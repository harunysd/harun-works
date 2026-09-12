import { isDevelopment } from 'std-env';
import GLSL from 'vite-plugin-glsl';
import SVGLoader from 'vite-svg-loader';

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: { lang: 'tr', dir: 'ltr' },
      title: 'Harun Yasir SARIDAŞ',
      titleTemplate: '%s',
      meta: [
        { lang: 'tr' },
        { language: 'Turkish' },
        { property: 'name', name: 'name', content: 'Harun Yasir Sarıdaş' },
        { charset: 'utf-8' },
        { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' },
        { 'http-equiv': 'Reply-to', content: 'iletisim@harun.works' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'robots', content: 'all' },
        { name: 'theme-color', content: '#030303' },
        { name: 'color-scheme', content: 'dark' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        {
          name: 'apple-mobile-web-app-status-bar-style',
          content: 'black-translucent',
        },
        {
          property: 'og:site_name',
          name: 'og:site_name',
          content: 'HARUN WORKS',
        },
        { property: 'og:locale', name: 'og:locale', content: 'tr_TR' },
        { property: 'og:type', name: 'og:type', content: 'website' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg?v=hys3' },
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: '/favicon.ico?v=hys3',
          sizes: 'any',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: '/favicon-32x32.png?v=hys3',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
          href: '/favicon-16x16.png?v=hys3',
        },
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/apple-touch-icon.png?v=hys3',
        },
        { rel: 'manifest', href: '/site.webmanifest?v=hys3' },
      ],
    },
  },

  runtimeConfig: {
    public: {
      base: isDevelopment
        ? 'http://localhost:3000'
        : 'https://harun.works',
    },
  },

  imports: {
    imports: [{ name: 'on', from: 'rad-event-listener' }],
  },

  routeRules: {
    '/sitemap.xml': { prerender: true },
    '/_headers': { prerender: true },
  },

  sourcemap: isDevelopment,

  css: [
    'normalize.css/normalize.css',
    'locomotive-scroll/dist/locomotive-scroll.css',
    '~/assets/styles/fonts.css',
    '~/assets/styles/global.css',
  ],

  build: {
    transpile: ['gsap', 'std-env'],
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      concurrency: 4,
    },
  },

  modules: ['@nuxt/content', '@nuxtjs/fontaine'],

  fontMetrics: {
    fonts: [
      {
        family: 'e-Ukraine',
        src: '/fonts/e-Ukraine-Thin.woff2',
        fallbacks: ['Arial'],
      },
    ],
  },

  vite: {
    plugins: [SVGLoader({ svgo: false }), GLSL({ compress: !isDevelopment })],
  },
});
