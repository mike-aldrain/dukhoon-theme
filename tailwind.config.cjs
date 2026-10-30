const fs = require('fs');
const path = require('path');

// In the monorepo the installed engine links to the live package, whose dist a
// rebuild rewrites under a running dev server; scan its source there instead.
const engineSrc = path.join(__dirname, '../theme-engine/src');
const engineContent = fs.existsSync(engineSrc)
  ? `${engineSrc}/**/*.{js,ts,jsx,tsx}`
  : './node_modules/@salla.sa/twilight-theme-engine/dist/**/*.js';

/** A palette token as a Tailwind colour that supports `/alpha`. */
const mj = (name) => `rgb(var(--mj-${name}-rgb) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  important: false,
  content: [
    './app/**/*.{js,ts,jsx,tsx,scss,css}',
    engineContent,
    // SSR'd skeletons and wrapper markup carry `s-*` classes; scan the package that
    // renders them. Twilight web components ship their own CSS since 2.14.538
    // (SallaApp/twilight#2107), so the safelist is no longer compiled here.
    './node_modules/@salla.sa/twilight-components-react/dist/**/*.js',
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    // 1320px content plus 24 / 40 / 64px gutters (Majmar spacing tokens).
    container: {
      center: true,
      padding: { DEFAULT: '24px', md: '40px', lg: '64px' },
      screens: { sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1448px' },
    },
    fontFamily: {
      sans: ['var(--font-main)', '-apple-system', 'BlinkMacSystemFont'],
      primary: 'var(--font-main)',
      display: 'var(--mj-font-display)',
      body: 'var(--mj-font-body)',
    },
    extend: {
      // Engine and Raed markup is written for a white page. These per-utility remaps send
      // `bg-white`, `text-gray-*` and `border-gray-*` to the palette tokens, so engine pages
      // follow the Oud or Musk palette without forking them. `text-white` is left alone
      // because it sits on images and overlays.
      backgroundColor: {
        white: mj('surface'),
        // Tinted alert bands (e.g. related-products title) become raised surfaces.
        red: { 50: mj('raised') },
        black: mj('bg'),
        dark: mj('raised'),
        darker: mj('bg'),
        gray: {
          50: mj('raised'),
          100: mj('raised'),
          200: mj('raised'),
          300: 'rgb(var(--mj-line-rgb) / 0.16)',
          400: 'rgb(var(--mj-line-rgb) / 0.24)',
          600: mj('raised'),
          800: mj('raised'),
          900: mj('bg'),
        },
      },
      textColor: {
        // Sale prices and stock warnings: the palette's soft terracotta, not alarm red.
        red: { 500: mj('error'), 600: mj('error'), 700: mj('error'), 800: mj('error') },
        black: mj('ivory'),
        dark: mj('ivory'),
        gray: {
          300: mj('muted'),
          400: mj('muted'),
          500: mj('muted'),
          600: mj('muted'),
          700: mj('ivory'),
          800: mj('ivory'),
          900: mj('ivory'),
        },
      },
      borderColor: {
        DEFAULT: 'var(--mj-line)',
        gray: {
          100: 'var(--mj-line)',
          200: 'var(--mj-line)',
          300: 'rgb(var(--mj-line-rgb) / 0.16)',
          400: 'rgb(var(--mj-line-rgb) / 0.24)',
          600: 'rgb(var(--mj-line-rgb) / 0.3)',
        },
      },
      transitionTimingFunction: {
        elastic: 'cubic-bezier(0.55, 0, 0.1, 1)',
        majmar: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      gridTemplateColumns: {
        'auto-fill': 'repeat(auto-fill, 290px)',
      },
      colors: {
        dark: '#1D1F1F',
        darker: '#0E0F0F',
        danger: '#AE0A0A',
        primary: 'var(--color-primary)',
        'primary-dark': 'var(--color-primary-dark)',
        mj: {
          bg: mj('bg'),
          surface: mj('surface'),
          raised: mj('raised'),
          gold: mj('gold'),
          'gold-hover': mj('gold-hover'),
          'gold-ink': mj('gold-ink'),
          ivory: mj('ivory'),
          muted: mj('muted'),
          'on-gold': mj('on-gold'),
          line: 'var(--mj-line)',
          success: mj('success'),
          warning: mj('warning'),
          error: mj('error'),
        },
      },
      spacing: {
        3.75: '15px',
        7.5: '30px',
        58: '232px',
        62: '248px',
        100: '28rem',
        116: '464px',
        132: '528px',
        200: '800px',
      },
      borderRadius: {
        large: '22px',
        big: '40px',
        tiny: '3px',
        DEFAULT: '12px',
        control: '2px',
        card: '12px',
        modal: '24px',
      },
      fontSize: {
        'icon-lg': '33px',
        xxs: '10px',
        xxxs: '8px',
        'title-size': '42px',
        '22px': '22px',
      },
      lineHeight: {
        12: '3rem',
        14: '3.5rem',
        16: '4rem',
        18: '4.5rem',
        20: '5rem',
      },
      boxShadow: {
        default: '5px 10px 30px #2B2D340D;',
        top: '0px 0px 10px #0000001A;',
        md: '5px 10px 99px #2B2D340D',
        dropdown: '0 4px 8px rgba(161, 121, 121, 0.07)',
        light: '0px 4px 15px rgba(1, 1, 1, 0.06)',
        huge: '0px 3px 6px #00000029',
        progress: '0 5px 15px rgba(92, 213, 196, 0.4)',
        mobile:
          'rgb(0 0 0 / 9%) 0px 2px 1px, rgb(0 0 0 / 9%) 0px 4px 2px, rgb(0 0 0 / 9%) 0px 8px 4px, rgb(0 0 0 / 9%) 0px 16px 18px, rgb(0 0 0 / 9%) -15px 10px 7px, rgb(0 0 0 / 9%) -20px 10px 20px, rgb(0 0 0 / 9%) -20px 10px 20px, rgb(0 0 0 / 9%) -25px 20px 20px',
      },
      width: {
        18: '4.5rem',
        22: '5.5rem',
        74: '18.5rem',
        76: '19rem',
        78: '19.5rem',
      },
      height: {
        banner: '200px',
        'lg-banner': '428px',
        'full-banner': '600px',
        500: '500px',
        460: '460px',
      },
      minWidth: {
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
      },
      maxWidth: {
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
      },
      zIndex: {
        1: '1',
        2: '2',
        '-1': '-1',
      },
      screens: {
        xxs: { min: '380px', max: '479px' },
        xs: '480px',
        mob: '390px',
      },
      backgroundOpacity: {
        '05': '0.05',
      },
      transitionProperty: {
        height: 'height',
      },
      keyframes: {
        slideUpFromBottom: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0%)', opacity: '1' },
        },
        slideDownFromBottom: {
          '0%': { transform: 'translateY(0%)', opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
      },
      animation: {
        slideUpFromBottom: 'slideUpFromBottom .6s linear',
        slideDownFromBottom: 'slideDownFromBottom .6s linear',
      },
    },
  },
  corePlugins: {
    outline: false,
  },
  plugins: [require('@salla.sa/twilight-tailwind-theme'), require('@tailwindcss/forms')],
};
