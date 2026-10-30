/**
 * Majmar 3D product showcase (Three.js). Loaded lazily, never on the server.
 *
 * The store's real product photos are placed on floating cards arranged on a slow
 * carousel: the front card is the hero product, the others wait at depth and fade into
 * the page colour (fog). A gold halo ring stands behind the front card, the cards
 * reflect on the floor, gold dust drifts, and a soft light sweep crosses the front card.
 * Photos use an unlit material so product colours stay exactly as photographed.
 *
 * Modes:
 * - `idle` (hero): holds on each product, then turns to the next; the pointer tilts the
 *   stage. `onFront(index)` reports the product in front so the page can show its name.
 * - `scroll` (Scroll Product Film): `setProgress(0..1)` drives the camera and carousel:
 *   the product flies in, the carousel turns through the images while the camera pushes
 *   in, then everything settles to the inline-end side for the buy panel.
 *
 * Rendering stops off-screen and in hidden tabs. Product images come from Salla's CDN,
 * which sends `Access-Control-Allow-Origin: *`, so they can be used as WebGL textures.
 */
import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Clock,
  Color,
  DirectionalLight,
  DoubleSide,
  Fog,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  NoToneMapping,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Points,
  PointsMaterial,
  Scene,
  SRGBColorSpace,
  TorusGeometry,
  Vector2,
  WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export interface ProductSceneOptions {
  /** Product photo URLs; the first is the hero product. */
  images: string[];
  /** Theme tokens as "R G B" channels. */
  accent: string;
  background: string;
  surface: string;
  rtl: boolean;
  intensity: 'cinematic' | 'subtle';
  mode?: 'idle' | 'scroll';
  /** Called when a different card comes to the front (idle mode). */
  onFront?: (index: number) => void;
}

export interface ProductSceneHandle {
  setProgress: (p: number) => void;
  dispose: () => void;
}

const CARD_W = 1.7;
const CARD_H = 2.125; // 4:5
const TEX_W = 768;
const TEX_H = 960;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => t * t * (3 - 2 * t);
const span = (p: number, a: number, b: number) => ease(clamp01((p - a) / (b - a)));

const color = (channels: string, fallback: string) => {
  const n = channels.trim().split(/\s+/).map(Number);
  return n.length === 3 && n.every(Number.isFinite)
    ? new Color().setRGB(n[0] / 255, n[1] / 255, n[2] / 255, SRGBColorSpace)
    : new Color(fallback);
};
const css = (channels: string, fallback: string) => {
  const n = channels.trim().split(/\s+/).map(Number);
  return n.length === 3 && n.every(Number.isFinite) ? `rgb(${n.join(',')})` : fallback;
};

/** Rounded rectangle path on a 2D canvas. */
function roundRect(g: CanvasRenderingContext2D, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(r, 0);
  g.arcTo(w, 0, w, h, r);
  g.arcTo(w, h, 0, h, r);
  g.arcTo(0, h, 0, 0, r);
  g.arcTo(0, 0, w, 0, r);
  g.closePath();
}

/** A card face: the product photo fitted (contain) on the card colour, rounded corners. */
function cardTexture(surface: string): { tex: CanvasTexture; draw: (img?: HTMLImageElement) => void } {
  const c = document.createElement('canvas');
  c.width = TEX_W;
  c.height = TEX_H;
  const g = c.getContext('2d')!;
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  const draw = (img?: HTMLImageElement) => {
    g.clearRect(0, 0, TEX_W, TEX_H);
    g.save();
    roundRect(g, TEX_W, TEX_H, 44);
    g.clip();
    g.fillStyle = surface;
    g.fillRect(0, 0, TEX_W, TEX_H);
    if (img && img.naturalWidth) {
      const pad = 0.07;
      const bw = TEX_W * (1 - pad * 2);
      const bh = TEX_H * (1 - pad * 2);
      const s = Math.min(bw / img.naturalWidth, bh / img.naturalHeight);
      const w = img.naturalWidth * s;
      const h = img.naturalHeight * s;
      g.drawImage(img, (TEX_W - w) / 2, (TEX_H - h) / 2, w, h);
    }
    g.restore();
    tex.needsUpdate = true;
  };
  draw();
  return { tex, draw };
}

/** Radial gradient texture (glow, contact shadow). */
function radial(stops: [number, string][]): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  stops.forEach(([o, col]) => grad.addColorStop(o, col));
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** Diagonal light band used for the sweep across the front card. */
function sweepTexture(): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 32;
  const g = c.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, 256, 0);
  grad.addColorStop(0, 'rgba(255,255,255,0)');
  grad.addColorStop(0.45, 'rgba(255,255,255,0)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.55)');
  grad.addColorStop(0.55, 'rgba(255,255,255,0)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 32);
  return new CanvasTexture(c);
}

interface Card {
  group: Group;
  draw: (img?: HTMLImageElement) => void;
  photo: MeshBasicMaterial;
  reflection: MeshBasicMaterial;
}

export function mountProductScene(canvas: HTMLCanvasElement, opts: ProductSceneOptions): ProductSceneHandle {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NoToneMapping;
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  const bg = color(opts.background, '#FBF8F3');
  scene.fog = new Fog(bg, 7.5, 14);

  const gold = color(opts.accent, '#C8952E');
  const surfaceCss = css(opts.surface, '#ffffff');
  const dir = opts.rtl ? -1 : 1;
  const speed = opts.intensity === 'subtle' ? 0.6 : 1;
  const scrollMode = opts.mode === 'scroll';
  const disposables: { dispose: () => void }[] = [env, pmrem];

  const camera = new PerspectiveCamera(30, 1, 0.1, 60);
  scene.add(new HemisphereLight(0xffffff, 0xd8c8b0, 1.6));
  const key = new DirectionalLight(0xfff4e0, 2.2);
  key.position.set(2, 5, 6);
  scene.add(key);

  const stage = new Group();
  scene.add(stage);
  const carousel = new Group();
  stage.add(carousel);

  // ---- Cards
  const urls = opts.images.filter(Boolean).slice(0, 6);
  const n = Math.max(1, urls.length);
  const radius = n === 1 ? 0 : n === 2 ? 1.5 : 2.1;
  const bodyGeo = new BoxGeometry(CARD_W, CARD_H, 0.05);
  const faceGeo = new PlaneGeometry(CARD_W, CARD_H);
  const bodyMat = new MeshStandardMaterial({ color: color(opts.surface, '#ffffff'), roughness: 0.35, metalness: 0.05 });
  disposables.push(bodyGeo, faceGeo, bodyMat);
  // Reflection fade: opaque next to the card, gone a third of the way down.
  const fadeCanvas = document.createElement('canvas');
  fadeCanvas.width = 4;
  fadeCanvas.height = 256;
  const fg = fadeCanvas.getContext('2d')!;
  const fgrad = fg.createLinearGradient(0, 0, 0, 256);
  fgrad.addColorStop(0, '#000');
  fgrad.addColorStop(0.62, '#000');
  fgrad.addColorStop(1, '#fff');
  fg.fillStyle = fgrad;
  fg.fillRect(0, 0, 4, 256);
  const fadeTex = new CanvasTexture(fadeCanvas);
  disposables.push(fadeTex);
  const cards: Card[] = [];
  for (let i = 0; i < n; i++) {
    const group = new Group();
    const { tex, draw } = cardTexture(surfaceCss);
    const photo = new MeshBasicMaterial({ map: tex, transparent: true });
    const face = new Mesh(faceGeo, photo);
    face.position.z = 0.026;
    const body = new Mesh(bodyGeo, bodyMat);
    body.scale.set(0.985, 0.985, 1);
    // Floor reflection: the face mirrored under the card, faded.
    const reflection = new MeshBasicMaterial({ map: tex, alphaMap: fadeTex, transparent: true, opacity: 0.16, depthWrite: false, side: DoubleSide });
    const mirror = new Mesh(faceGeo, reflection);
    mirror.scale.y = -1;
    mirror.position.y = -CARD_H - 0.04;
    group.add(body, face, mirror);
    group.position.y = CARD_H / 2 + 0.05;
    carousel.add(group);
    disposables.push(tex, photo, reflection);
    cards.push({ group, draw, photo, reflection });

    const url = urls[i];
    if (url) {
      // If the page already showed this photo as a plain <img>, the browser may answer
      // from a cache entry without CORS headers; retry once with a fresh URL.
      const load = (src: string, retry: boolean) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.decoding = 'async';
        img.onload = () => {
          draw(img);
          frameOnce();
        };
        img.onerror = () => retry && load(`${src}${src.includes('?') ? '&' : '?'}mj3d=1`, false);
        img.src = src;
      };
      load(url, true);
    }
  }

  // ---- Gold halo ring and glow behind the front card
  const ringMat = new MeshStandardMaterial({ color: gold, metalness: 1, roughness: 0.25, envMapIntensity: 1.4, transparent: true });
  const ring = new Mesh(new TorusGeometry(1.55, 0.012, 16, 160), ringMat);
  ring.position.set(0, CARD_H / 2 + 0.15, -0.55);
  stage.add(ring);
  const glowTex = radial([
    [0, 'rgba(255,214,140,0.55)'],
    [0.5, 'rgba(255,200,120,0.18)'],
    [1, 'rgba(255,200,120,0)'],
  ]);
  const glow = new Mesh(new PlaneGeometry(4.6, 4.6), new MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, fog: false }));
  glow.position.set(0, CARD_H / 2 + 0.15, -0.7);
  stage.add(glow);
  disposables.push(ringMat, ring.geometry, glowTex, glow.geometry, glow.material as MeshBasicMaterial);

  // ---- Contact shadow on the floor
  const shadowTex = radial([
    [0, 'rgba(40,24,8,0.32)'],
    [0.6, 'rgba(40,24,8,0.08)'],
    [1, 'rgba(40,24,8,0)'],
  ]);
  const shadow = new Mesh(new PlaneGeometry(3, 1.2), new MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.001;
  stage.add(shadow);
  disposables.push(shadowTex, shadow.geometry, shadow.material as MeshBasicMaterial);

  // ---- Light sweep across the front card
  const sweepTex = sweepTexture();
  const sweepMat = new MeshBasicMaterial({ map: sweepTex, transparent: true, depthWrite: false, opacity: 0.9 });
  const sweep = new Mesh(new PlaneGeometry(CARD_W * 2.2, CARD_H * 1.6), sweepMat);
  sweep.rotation.z = -0.5;
  disposables.push(sweepTex, sweepMat, sweep.geometry);

  // ---- Gold dust
  const DUST = opts.intensity === 'subtle' ? 40 : 110;
  const dustGeo = new BufferGeometry();
  const dustPos = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 7;
    dustPos[i * 3 + 1] = Math.random() * 4;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 4 - 0.5;
  }
  dustGeo.setAttribute('position', new BufferAttribute(dustPos, 3));
  const dustMat = new PointsMaterial({ color: gold, size: 0.028, transparent: true, opacity: 0.75, depthWrite: false });
  stage.add(new Points(dustGeo, dustMat));
  disposables.push(dustGeo, dustMat);

  // ---- Layout of the carousel for a rotation value (in card steps)
  const place = (rot: number, push: number) => {
    let frontIdx = 0;
    let best = -Infinity;
    cards.forEach((card, i) => {
      // Wrap to (-PI, PI] so a card that came round the full circle faces forward again.
      let a = ((i - rot) / n) * Math.PI * 2;
      a = Math.atan2(Math.sin(a), Math.cos(a));
      const x = Math.sin(a) * radius;
      const z = (Math.cos(a) - 1) * radius;
      card.group.position.x = x * dir;
      card.group.position.z = z;
      card.group.rotation.y = a * 0.55 * dir;
      const front = Math.cos(a);
      card.group.scale.setScalar(0.82 + 0.18 * Math.max(0, front) + push * 0.05 * Math.max(0, front));
      if (front > best) {
        best = front;
        frontIdx = i;
      }
    });
    return frontIdx;
  };

  // ---- Size and input
  let narrow = false;
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    narrow = w / h < 0.85;
    camera.updateProjectionMatrix();
    frameOnce();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  const pointer = new Vector2();
  const target = new Vector2();
  const onPointer = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const r = canvas.getBoundingClientRect();
    target.set(((e.clientX - r.left) / r.width - 0.5) * 2, ((e.clientY - r.top) / r.height - 0.5) * 2);
  };
  window.addEventListener('pointermove', onPointer, { passive: true });

  let visible = true;
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) loop();
  });
  io.observe(canvas);
  const onVis = () => document.visibilityState === 'visible' && loop();
  document.addEventListener('visibilitychange', onVis);

  let progress = 0;
  let shown = 0;
  let lastFront = -1;
  const HOLD = 4.2;
  const TURN = 1.4;
  const clock = new Clock();
  let raf = 0;
  let running = false;

  function render() {
    const t = clock.elapsedTime * speed;
    pointer.lerp(target, 0.05);
    const camZ = narrow ? 10.8 : 7.6;
    let rot: number;
    let push = 0;
    let settle = 0;
    let enter = 1;

    if (scrollMode) {
      shown += (progress - shown) * 0.12;
      const p = shown;
      enter = span(p, 0, 0.14);
      const tour = clamp01((p - 0.14) / 0.6);
      // Tour through every card, then complete the turn so the featured product (card 0)
      // is in front again when the buy panel lands.
      rot = n > 1 ? tour * (n - 1) + span(p, 0.74, 0.94) : 0;
      push = Math.sin(Math.PI * span(p, 0.18, 0.72));
      // Off to the inline-end side from the first chapter, away from the chapter copy
      // and the buy panel (both on the inline-start side).
      settle = span(p, 0.1, 0.22);
    } else {
      // Hold on a product, then turn to the next.
      const cycle = HOLD + TURN;
      const k = Math.floor(t / cycle);
      const f = clamp01((t - k * cycle - HOLD) / TURN);
      rot = n > 1 ? k + ease(f) : 0;
    }

    const front = place(rot, push);
    if (!scrollMode && front !== lastFront) {
      lastFront = front;
      opts.onFront?.(front % n);
    }

    // Stage tilt from the pointer and a slow breathing sway.
    stage.rotation.y = (pointer.x * 0.22 + Math.sin(t * 0.35) * 0.05) * dir;
    stage.rotation.x = pointer.y * 0.05;
    stage.position.y = Math.sin(t * 0.9) * 0.03;
    stage.position.z = (1 - enter) * -6;
    stage.position.x = narrow ? 0 : settle * 1.25 * dir;
    if (narrow) stage.position.y += settle * 1.1;
    cards.forEach((c) => {
      c.photo.opacity = enter;
      c.reflection.opacity = 0.16 * enter;
    });

    // Sweep across the front card every few seconds.
    const fc = cards[front].group;
    if (sweep.parent !== fc) fc.add(sweep);
    sweep.position.set(((t * 0.45) % 3) * 2.2 - 3.3, 0, 0.03);

    ring.rotation.z = t * 0.08;
    ringMat.opacity = 1 - push * 0.85;
    dustMat.opacity = 0.55 + Math.sin(t * 1.7) * 0.2;
    const pos = dustGeo.attributes.position as BufferAttribute;
    for (let i = 0; i < DUST; i++) {
      let y = pos.getY(i) + 0.0022 * speed;
      if (y > 4) y = 0;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;

    camera.position.set(pointer.x * 0.25, 1.35 + push * 0.12, camZ - push * 1.5 + settle * 0.6);
    // Fog starts just behind the front card wherever the camera is, so only the cards
    // waiting at the back fade, on phones (camera further back) as on desktop.
    const fog = scene.fog as Fog;
    fog.near = camera.position.z + 0.6;
    fog.far = camera.position.z + 6.5;
    camera.lookAt(0, 1.12 + push * 0.05, 0);
    renderer.render(scene, camera);
  }

  function frame() {
    running = false;
    if (!visible || document.visibilityState !== 'visible') {
      clock.getDelta();
      return;
    }
    clock.getDelta();
    render();
    loop();
  }
  function loop() {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(frame);
  }
  function frameOnce() {
    if (!running) render();
  }
  resize();
  loop();

  return {
    setProgress: (p) => {
      progress = clamp01(p);
      loop();
    },
    dispose: () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVis);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    },
  };
}
