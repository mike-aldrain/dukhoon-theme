/**
 * Majmar WebGL hero scene (Three.js). Loaded lazily by HeroStage, never on the server.
 *
 * Draws a glass perfume bottle with amber liquid and a brass cap on a stone plinth,
 * lit like a studio still life, with incense smoke and embers rising behind it.
 * When the merchant uploads their own product render, `bottle: false` keeps only the
 * plinth, smoke, embers and light so the image sits in the scene.
 *
 * Performance: pixel ratio capped at 1.75, one environment map, ~170 particles, no
 * shadow maps (a soft contact shadow is a textured plane). Rendering stops while the
 * canvas is off-screen or the tab is hidden.
 *
 * Two modes:
 * - `idle` (hero): a slow turntable that follows the pointer.
 * - `scroll` (Scroll Film block): `setProgress(0..1)` plays a timeline. The bottle turns
 *   on black, the cap lifts and drifts toward the camera, the liquid lights up, the
 *   camera pushes in, then the bottle settles to the inline-end side for the buy panel.
 */
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Clock,
  Color,
  CylinderGeometry,
  BackSide,
  Group,
  LatheGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NormalBlending,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  PointLight,
  Points,
  PointsMaterial,
  Scene,
  SpotLight,
  SRGBColorSpace,
  Sprite,
  SpriteMaterial,
  Vector2,
  WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export interface HeroSceneOptions {
  /** Draw the procedural bottle (off when the merchant supplies a product render). */
  bottle: boolean;
  /** Amber accent as "R G B" channels (from the --mj-gold-rgb token). */
  accent: string;
  /** Liquid tint as "R G B" channels. */
  liquid?: string;
  /** Reading direction: smoke drifts from the side away from the copy. */
  rtl: boolean;
  /** `subtle` slows everything down and drops the embers. */
  intensity: 'cinematic' | 'subtle';
  /** `idle` turntable (default) or `scroll` timeline driven by setProgress. */
  mode?: 'idle' | 'scroll';
  /** Show the stone plinth (off for the black film stage). */
  plinth?: boolean;
}

export interface HeroSceneHandle {
  setProgress: (p: number) => void;
  dispose: () => void;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** 0..1 position of p inside [a, b], eased. */
const span = (p: number, a: number, b: number) => {
  const t = clamp01((p - a) / (b - a));
  return t * t * (3 - 2 * t);
};

const rgb = (channels: string, fallback: string) => {
  const parts = channels.trim().split(/\s+/).map(Number);
  // Theme tokens are sRGB; three.js works in linear light, so convert on the way in.
  return parts.length === 3 && parts.every((n) => Number.isFinite(n))
    ? new Color().setRGB(parts[0] / 255, parts[1] / 255, parts[2] / 255, SRGBColorSpace)
    : new Color(fallback);
};

/** A radial gradient drawn once on a 2D canvas (smoke puff or contact shadow). */
function radialTexture(inner: string, mid: string, outer: string): CanvasTexture {
  const size = 128;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, inner);
  grad.addColorStop(0.4, mid);
  grad.addColorStop(1, outer);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

/** Flacon outline as a lathe profile: heavy base, tall body, soft shoulders, short neck. */
function bottleProfile(scale = 1): Vector2[] {
  const pts: [number, number][] = [
    [0, 0],
    [0.5, 0],
    [0.6, 0.06],
    [0.62, 0.18],
    [0.62, 1.45],
    [0.58, 1.62],
    [0.42, 1.76],
    [0.2, 1.84],
    [0.17, 1.88],
    [0.17, 2.06],
    [0, 2.06],
  ];
  return pts.map(([x, y]) => new Vector2(x * scale, y * scale));
}

export function mountHeroScene(canvas: HTMLCanvasElement, opts: HeroSceneOptions): HeroSceneHandle {
  const scrollMode = opts.mode === 'scroll';
  let progress = 0;
  let shown = 0;
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envMap;

  const camera = new PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 1.5, 8.2);
  camera.lookAt(0, 1.2, 0);

  const accent = rgb(opts.accent, '#D4A35A');
  // Liquid: a deeper, richer amber than the accent unless the merchant sets one.
  const liquidColor = opts.liquid ? rgb(opts.liquid, '#9A5418') : new Color('#6E3A10');
  const speed = opts.intensity === 'subtle' ? 0.5 : 1;
  const dir = opts.rtl ? -1 : 1;

  // Lights: warm key from above, amber rim behind, low warm fill.
  const key = new SpotLight(0xffe2b8, 38, 14, Math.PI / 6, 0.6, 1.4);
  key.position.set(1.6, 5.2, 3.2);
  key.target.position.set(0, 0.9, 0);
  scene.add(key, key.target);
  const rim = new PointLight(accent, 14, 8, 1.6);
  rim.position.set(-1.8, 2.2, -1.6);
  scene.add(rim);
  const edgeLight = new SpotLight(0xfff3e0, 22, 12, Math.PI / 9, 0.4, 1.2);
  edgeLight.position.set(-2.6, 3.4, 4.2);
  edgeLight.target.position.set(0, 1.2, 0);
  scene.add(edgeLight, edgeLight.target);
  const fill = new PointLight(0x6b4a33, 4, 10, 2);
  fill.position.set(2.5, 0.6, 2.5);
  scene.add(fill);

  const stage = new Group();
  scene.add(stage);
  const disposables: { dispose: () => void }[] = [envMap, pmrem];

  // Plinth: dark stone drum with a brass edge.
  const stone = new MeshStandardMaterial({ color: 0x1b1511, roughness: 0.55, metalness: 0.1 });
  const plinth = new Mesh(new CylinderGeometry(1.35, 1.45, 0.42, 64), stone);
  plinth.position.y = -0.21;
  const brass = new MeshStandardMaterial({ color: accent, metalness: 1, roughness: 0.28 });
  const edge = new Mesh(new CylinderGeometry(1.352, 1.352, 0.025, 64, 1, true), brass);
  if (opts.plinth !== false) stage.add(plinth, edge);
  disposables.push(stone, brass, plinth.geometry, edge.geometry);

  const shadowTex = radialTexture('rgba(0,0,0,0.75)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0)');
  const shadowMat = new MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
  const shadow = new Mesh(new PlaneGeometry(1.9, 1.9), shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.006;
  if (opts.plinth !== false) stage.add(shadow);
  disposables.push(shadowTex, shadowMat, shadow.geometry);

  // Bottle: transmissive glass, amber liquid, brass cap.
  const bottleGroup = new Group();
  const capGroup = new Group();
  let liquidMat: MeshPhysicalMaterial | undefined;
  if (opts.bottle) {
    // Cut crystal: 10 facets, flat shaded so each face catches the key light. Faked glass
    // (transparent + clearcoat + strong environment) instead of transmission, which looks
    // milky on a transparent canvas and costs an extra render pass.
    const FACETS = 10;
    const tint = new Color().copy(accent).lerp(new Color(0xffffff), 0.75);
    const glassBack = new MeshPhysicalMaterial({
      color: tint,
      roughness: 0.08,
      metalness: 0,
      transparent: true,
      opacity: 0.1,
      side: BackSide,
      depthWrite: false,
      envMapIntensity: 1.6,
      flatShading: true,
    });
    const glassFront = new MeshPhysicalMaterial({
      color: tint,
      roughness: 0.0,
      metalness: 0,
      transparent: true,
      opacity: 0.16,
      specularIntensity: 1,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      envMapIntensity: 2.6,
      depthWrite: false,
      flatShading: true,
    });
    const shellGeo = new LatheGeometry(bottleProfile(1), FACETS);
    const back = new Mesh(shellGeo, glassBack);
    const front = new Mesh(shellGeo, glassFront);
    back.renderOrder = 1;
    front.renderOrder = 3;
    // The liquid: rich amber that glows a little, filling three quarters of the body.
    const liquid = new MeshPhysicalMaterial({
      color: liquidColor,
      roughness: 0.12,
      metalness: 0,
      emissive: liquidColor,
      emissiveIntensity: 0.12,
      transparent: true,
      opacity: 0.92,
      clearcoat: 0.6,
      flatShading: true,
    });
    const liquidGeo = new LatheGeometry(
      bottleProfile(0.9)
        .filter((v) => v.y <= 1.15)
        .concat([new Vector2(0.54, 1.15), new Vector2(0, 1.15)]),
      FACETS
    );
    const inner = new Mesh(liquidGeo, liquid);
    inner.position.y = 0.08;
    inner.renderOrder = 2;
    // A thick glass base slab gives weight.
    const baseMat = new MeshPhysicalMaterial({ color: tint, roughness: 0.05, transparent: true, opacity: 0.5, clearcoat: 1, envMapIntensity: 2, flatShading: true });
    const base = new Mesh(new CylinderGeometry(0.6, 0.62, 0.12, FACETS), baseMat);
    base.position.y = 0.06;
    base.renderOrder = 2;
    const capMat = new MeshStandardMaterial({ color: accent, metalness: 1, roughness: 0.18, envMapIntensity: 1.8 });
    liquidMat = liquid;
    const cap = new Mesh(new CylinderGeometry(0.3, 0.3, 0.7, 48), capMat);
    const capRing = new Mesh(new CylinderGeometry(0.33, 0.33, 0.06, 48), capMat);
    capRing.position.y = -0.33;
    const capTop = new Mesh(new CylinderGeometry(0.27, 0.3, 0.05, 48), capMat);
    capTop.position.y = 0.37;
    capGroup.position.y = 2.38;
    capGroup.add(cap, capRing, capTop);
    bottleGroup.add(back, inner, base, front, capGroup);
    disposables.push(glassBack, glassFront, liquid, baseMat, capMat, shellGeo, liquidGeo, base.geometry, cap.geometry, capRing.geometry, capTop.geometry);
  }
  stage.add(bottleGroup);

  // Smoke: large soft sprites drifting up and spreading.
  const smokeTex = radialTexture('rgba(255,255,255,0.55)', 'rgba(255,255,255,0.18)', 'rgba(255,255,255,0)');
  disposables.push(smokeTex);
  const smokeColor = new Color().copy(accent).lerp(new Color(0xf3eadf), 0.55);
  const puffs: { sprite: Sprite; seed: number; life: number; rate: number }[] = [];
  const PUFFS = opts.intensity === 'subtle' ? 14 : 26;
  for (let i = 0; i < PUFFS; i++) {
    const mat = new SpriteMaterial({
      map: smokeTex,
      color: smokeColor,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: NormalBlending,
    });
    const sprite = new Sprite(mat);
    disposables.push(mat);
    stage.add(sprite);
    puffs.push({ sprite, seed: Math.random() * 100, life: Math.random(), rate: 0.05 + Math.random() * 0.05 });
  }

  // Embers: small additive points rising.
  const EMBERS = opts.intensity === 'subtle' ? 0 : 140;
  const emberGeo = new BufferGeometry();
  const emberPos = new Float32Array(EMBERS * 3);
  const emberSeed = new Float32Array(EMBERS);
  for (let i = 0; i < EMBERS; i++) {
    emberPos[i * 3] = (Math.random() - 0.5) * 3.2;
    emberPos[i * 3 + 1] = Math.random() * 4;
    emberPos[i * 3 + 2] = (Math.random() - 0.5) * 2 - 0.6;
    emberSeed[i] = Math.random() * 10;
  }
  emberGeo.setAttribute('position', new BufferAttribute(emberPos, 3));
  const emberMat = new PointsMaterial({
    color: accent,
    size: 0.035,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  if (EMBERS) stage.add(new Points(emberGeo, emberMat));
  disposables.push(emberGeo, emberMat);

  // Size, pointer and visibility.
  // Portrait (phone) stages: pull the camera back, and settle the bottle upward
  // because the buy panel sits at the bottom there.
  let narrow = false;
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    narrow = w / h < 0.85;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  const pointer = new Vector2(0, 0);
  const target = new Vector2(0, 0);
  const onPointer = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const r = canvas.getBoundingClientRect();
    target.set(((e.clientX - r.left) / r.width - 0.5) * 2, ((e.clientY - r.top) / r.height - 0.5) * 2);
  };
  window.addEventListener('pointermove', onPointer, { passive: true });

  let visible = true;
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) loop();
  });
  io.observe(canvas);
  const onVisibility = () => document.visibilityState === 'visible' && loop();
  document.addEventListener('visibilitychange', onVisibility);

  const clock = new Clock();
  let raf = 0;
  let running = false;

  function frame() {
    running = false;
    if (!visible || document.visibilityState !== 'visible') {
      clock.getDelta();
      return;
    }
    const dt = Math.min(clock.getDelta(), 0.05) * speed;
    const t = clock.elapsedTime * speed;

    pointer.lerp(target, 0.04);
    if (scrollMode) {
      // Ease towards the scroll position so wheel steps read as one camera move.
      shown += (progress - shown) * 0.12;
      const p = shown;
      const turn = span(p, 0, 0.35);
      const lift = span(p, 0.28, 0.6);
      const push = span(p, 0.35, 0.62);
      const settle = span(p, 0.7, 0.95);
      bottleGroup.rotation.y = (turn * Math.PI * 1.25 + t * 0.05) * dir + pointer.x * 0.2;
      bottleGroup.rotation.z = Math.sin(turn * Math.PI) * 0.12 * dir;
      // Settle to the inline-end side; the buy panel lands on the inline-start side.
      bottleGroup.position.x = narrow ? 0 : settle * 1.25 * dir;
      bottleGroup.position.y = Math.sin(t * 0.8) * 0.02 + (narrow ? settle * 0.9 : 0);
      // The cap lifts, turns and drifts toward the camera, then returns home.
      const capOut = lift * (1 - settle);
      capGroup.position.set(capOut * 1.15 * dir, 2.38 + capOut * 0.3, capOut * 1.5);
      capGroup.rotation.set(capOut * 0.7, capOut * Math.PI * 1.5, capOut * 0.5 * dir);
      if (liquidMat) liquidMat.emissiveIntensity = 0.12 + 0.5 * Math.sin(Math.PI * span(p, 0.3, 0.85));
      const back = narrow ? 3.2 : 0;
      camera.position.set(pointer.x * 0.2, 1.5 + push * 0.3 - settle * 0.3, 8.2 + back - push * 2.4 + settle * 1.8);
      camera.lookAt(0, 1.2 + push * 0.3 - settle * 0.3, 0);
    } else {
      bottleGroup.rotation.y = t * 0.18 * dir + pointer.x * 0.35;
      bottleGroup.rotation.x = pointer.y * 0.06;
      bottleGroup.position.y = Math.sin(t * 0.8) * 0.025;
      camera.position.set(pointer.x * 0.35, 1.5 - pointer.y * 0.18, narrow ? 10.5 : 8.2);
      camera.lookAt(0, 1.2, 0);
    }
    rim.intensity = 13 + Math.sin(t * 1.3) * 2.5;

    for (const p of puffs) {
      p.life += dt * p.rate;
      if (p.life > 1) {
        p.life = 0;
        p.seed = Math.random() * 100;
      }
      const l = p.life;
      const sway = Math.sin(t * 0.6 + p.seed) * 0.35 * l;
      p.sprite.position.set(-0.9 * dir + sway + Math.sin(p.seed) * 0.2, 0.2 + l * 3.6, -0.9 + Math.cos(p.seed) * 0.3);
      const s = 0.6 + l * 2.4;
      p.sprite.scale.set(s, s, 1);
      const m = p.sprite.material as SpriteMaterial;
      m.opacity = Math.sin(Math.PI * l) * 0.14;
      m.rotation = p.seed + l * 1.5;
    }

    if (EMBERS) {
      const pos = emberGeo.attributes.position as BufferAttribute;
      for (let i = 0; i < EMBERS; i++) {
        let y = pos.getY(i) + dt * (0.12 + (emberSeed[i] % 1) * 0.18);
        if (y > 4) y = 0;
        pos.setY(i, y);
        pos.setX(i, pos.getX(i) + Math.sin(t + emberSeed[i]) * 0.0015);
      }
      pos.needsUpdate = true;
      emberMat.opacity = 0.6 + Math.sin(t * 2) * 0.2;
    }

    renderer.render(scene, camera);
    loop();
  }
  function loop() {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(frame);
  }
  loop();

  const dispose = () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    window.removeEventListener('pointermove', onPointer);
    document.removeEventListener('visibilitychange', onVisibility);
    disposables.forEach((d) => d.dispose());
    renderer.dispose();
  };
  return {
    setProgress: (p: number) => {
      progress = clamp01(p);
      loop();
    },
    dispose,
  };
}
