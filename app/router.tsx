import { lazy } from 'react';
import { createRouter } from '@salla.sa/twilight-theme-engine/tanstack';
import { registry } from '@salla.sa/twilight-theme-engine';
import {
  registerHomeComponents,
  registerHomeComponentConfig,
  DefaultHomeComponents,
} from '@salla.sa/twilight-theme-engine/routes/home';
import { SliderSkeleton } from '@salla.sa/twilight-components-react';
import { routeTree } from './routeTree.gen';
import {
  Brands,
  CustomTestimonials,
  EnhancedSlider,
  FeaturedProducts,
  featuredProductsConfig,
  FixedProducts,
  MainLinks,
  PhotosSlider,
  ProductsSlider,
  SliderProductsWithHeader,
  EnhancedSquareBanners,
} from './components/home';
import { Blog } from './components/home/Blog';
import {
  FeaturedProductsSpecialOffer,
  FeaturedProductsWithSpecialProduct,
} from './components/home/FeaturedProducts';
import { PhotosSliderWithText } from './components/home/PhotosSliderWithText';
import { registerThemeHooks } from './hooks';
import {
  BrandStory,
  CinematicHero,
  Marquee,
  HeroSlider,
  CategoryGrid,
  PromoPair,
  WideBanner,
  SpinShowcase,
  Occasions,
  NoirHero,
  ShopLookbook,
  Timeline,
  ScrollFilm,
  OccasionCountdown,
  ScentFamilies,
  ScentFinder,
  RitualBundle,
  GiftBoxBuilder,
  Faq,
  ProductReels,
  FeaturedCollections,
  Lookbook,
  Newsletter,
  ProductShowcase,
  SocialGrid,
  Testimonials,
  TrustBar,
} from './components/majmar/home';
import { ProductListSkeleton } from './components/product/ProductListSkeleton';

const ProductListPage = lazy(() =>
  import('./components/product/ProductListPage').then((m) => ({ default: m.ProductListPage }))
);

// Register theme-level hooks (AddProductToast, DigitalFilesSettings, etc.)
registerThemeHooks();

registry.register('product:list-page', ProductListPage);
registry.register('product:list-skeleton', ProductListSkeleton);

registerHomeComponents({
  ...DefaultHomeComponents,
  brands: Brands,
  'enhanced-slider': EnhancedSlider,
  'custom-testimonials': CustomTestimonials,
  'main-links': MainLinks,
  'square-links': MainLinks,
  // Replaces the engine Swiper with the theme's scroll carousel (home block +
  // the product page's "similar products" `best-offers-<n>-slider`).
  'products-slider': ProductsSlider,
  // Replaces the engine Swiper with the theme's scroll carousel — same
  // progress bar + arrows as testimonials/products, cards instead of a thin
  // full-width banner strip.
  'photos-slider': PhotosSlider,
  'photos-slider-with-text': PhotosSliderWithText,
  // The renderer checks `home:featured-products:<view_style>` before the bare
  // key (theme-engine `HomePageRenderer.getComponentByPath`), and
  // `...DefaultHomeComponents` above still has the engine's own component
  // registered under the three literal `styleN` variants — leaving those out
  // here would mean only view_style-less / unrecognised blocks ever reach
  // this component, and every `style1`/`style2`/`style3` block keeps
  // rendering the broken engine variants this fork exists to replace.
  'featured-products': FeaturedProducts,
  'featured-products:style1': FeaturedProducts,
  'featured-products:style2': FeaturedProducts,
  'featured-products:style3': FeaturedProducts,
  // The block's other two layouts, each its own block.
  'featured-products-special-offer': FeaturedProductsSpecialOffer,
  'featured-products-special-product': FeaturedProductsWithSpecialProduct,
  // Fork of the engine block so its grid renders the theme's ProductCard wrapper.
  'fixed-products': FixedProducts,
  'slider-products-with-header': SliderProductsWithHeader,
  'enhanced-square-banners': EnhancedSquareBanners,
  blog: Blog,
  // Majmar blocks (twilight.json `home.mj-*`).
  'mj-slider': HeroSlider,
  'mj-categories': CategoryGrid,
  'mj-promos': PromoPair,
  'mj-wide': WideBanner,
  'mj-spin': SpinShowcase,
  'mj-occasions': Occasions,
  'mj-noir': NoirHero,
  'mj-looks': ShopLookbook,
  'mj-timeline': Timeline,
  'mj-hero': CinematicHero,
  'mj-marquee': Marquee,
  'mj-film': ScrollFilm,
  'mj-countdown': OccasionCountdown,
  'mj-families': ScentFamilies,
  'mj-finder': ScentFinder,
  'mj-ritual': RitualBundle,
  'mj-giftbox': GiftBoxBuilder,
  'mj-faq': Faq,
  'mj-reels': ProductReels,
  'mj-collections': FeaturedCollections,
  'mj-showcase': ProductShowcase,
  'mj-story': BrandStory,
  'mj-lookbook': Lookbook,
  'mj-testimonials': Testimonials,
  'mj-social': SocialGrid,
  'mj-newsletter': Newsletter,
  'mj-trust': TrustBar,
});

// Wrapper `<section>` classes for `featured-products` — the engine only styles
// the literal `styleN` values; this covers the semantic `view_style`s too.
// `custom-testimonials` gets `s-block--full-bg` so the gray band runs edge-to-edge.
registerHomeComponentConfig({
  // Majmar blocks own their spacing; the reserved heights match their first
  // paint so lazily placed blocks do not shift the page (CLS).
  'mj-slider': { className: 's-block s-block--mj s-block--mj-slider', height: 'clamp(560px, 42vw, 640px)' },
  'mj-categories': { className: 's-block s-block--mj', height: 'clamp(300px, 24vw, 380px)' },
  'mj-promos': { className: 's-block s-block--mj', height: 'clamp(420px, 34vw, 520px)' },
  'mj-wide': { className: 's-block s-block--mj', height: 'clamp(320px, 33vw, 480px)' },
  'mj-spin': { className: 's-block s-block--mj', height: 'clamp(820px, 60vw, 900px)' },
  'mj-occasions': { className: 's-block s-block--mj', height: 'clamp(520px, 30vw, 560px)' },
  'mj-noir': { className: 's-block s-block--mj s-block--mj-noir', height: '100svh' },
  'mj-looks': { className: 's-block s-block--mj', height: 'clamp(560px, 45vw, 680px)' },
  'mj-timeline': { className: 's-block s-block--mj', height: '760px' },
  'mj-hero': { className: 's-block s-block--mj s-block--mj-hero', height: '100svh' },
  'mj-marquee': { className: 's-block s-block--mj', height: 'clamp(70px, 6vw, 92px)' },
  'mj-families': { className: 's-block s-block--mj s-block--mj-families', height: 'clamp(260px, 22vw, 340px)' },
  // The film grows to several screens after hydration; reserve one screen.
  'mj-film': { className: 's-block s-block--mj s-block--mj-film', height: '100svh' },
  'mj-collections': { className: 's-block s-block--mj', height: 'clamp(720px, 70vw, 1100px)' },
  'mj-showcase': { className: 's-block s-block--mj', height: 'clamp(560px, 45vw, 760px)' },
  'mj-story': { className: 's-block s-block--mj', height: 'clamp(900px, 60vw, 980px)' },
  'mj-lookbook': { className: 's-block s-block--mj', height: 'clamp(900px, 80vw, 1400px)' },
  'mj-testimonials': { className: 's-block s-block--mj', height: '520px' },
  'mj-social': { className: 's-block s-block--mj', height: 'clamp(420px, 30vw, 520px)' },
  'mj-newsletter': { className: 's-block s-block--mj', height: '460px' },
  'mj-trust': { className: 's-block s-block--mj', height: '220px' },
  'featured-products': featuredProductsConfig,
  'featured-products-special-offer': featuredProductsConfig,
  'featured-products-special-product': featuredProductsConfig,
  // Gray band edge to edge; the height is a card plus the heading and controls.
  blog: {
    className: 's-block s-block--blog s-block--full-bg',
    height: 'clamp(480px, 45vw, 660px)',
  },
  'custom-testimonials': {
    className: 's-block s-block--custom-testimonials s-block--full-bg',
  },
  // Lazy placements (blocks 4+): reserve the loaded blocks' height and show the
  // same SliderSkeleton the SSR path shows (sized in home-blocks.scss), not the
  // engine's 400px/200px defaults with mismatched skeletons (CLS on scroll-in).
  'enhanced-slider': {
    height: 'calc(100vw / 2.4)', // the 12:5 slide ratio
    placeholder: <SliderSkeleton />,
    // The boxed variant (`in_container`) is capped at the container width, so
    // its skeleton must be too (home-blocks.scss) or the reservation oversizes.
    className: (data) =>
      `s-block s-block--enhanced-slider${data.in_container ? ' s-block--enhanced-slider-boxed' : ''}`,
  },
  'main-links': {
    height: '112px',
    placeholder: <SliderSkeleton />,
    // Keeps the engine entry's merge classes; theme config replaces, not merges.
    className: (data) => {
      const mergeWithTop = data.merge_links_with_top_component;
      return [
        's-block',
        's-block--main-links',
        mergeWithTop && data.position ? 'merge-with-top-component' : '',
        !data.title && mergeWithTop ? 'merged-has-no-title' : '',
      ]
        .filter(Boolean)
        .join(' ');
    },
  },
  'square-links': {
    height: '144px', // .slide--cat-entry h-36 cards (square-links keeps the card look)
    placeholder: <SliderSkeleton />,
  },
  // Taller cards than the engine's thin full-width banner strip — reserve
  // more skeleton height so the real content doesn't shift the page on load.
  'photos-slider': {
    height: 'clamp(210px, 32vw, 420px)',
    placeholder: <SliderSkeleton />,
    className: (data) =>
      `s-block s-block--photos-slider${data.is_repeated ? ' repeated-block' : ''}`,
  },
  'photos-slider-with-text': {
    height: 'clamp(300px, 36vw, 470px)', // a card plus the controls row
    placeholder: <SliderSkeleton />,
    className: (data) =>
      `s-block s-block--photos-slider-with-text${data.in_container ? ' s-block--photos-slider-with-text-boxed' : ''}`,
  },
});

// Singleton for client-side (preserves QueryClient cache across navigations)
// SSR creates fresh instances per request via getRouter()
let clientRouter: ReturnType<typeof createRouter> | null = null;

// TanStack Start expects getRouter() for SSR compatibility
export function getRouter() {
  // On client: reuse existing router to preserve QueryClient cache
  if (typeof window !== 'undefined' && clientRouter) {
    return clientRouter;
  }

  // On SSR or first client load: create new router
  const router = createRouter(routeTree);

  // Cache for client-side
  if (typeof window !== 'undefined') {
    clientRouter = router;
  }

  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
