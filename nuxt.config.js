const env = process.env.NODE_ENV
const isLocal = !env || env === 'local'

export default {
  /**
   * force dev if not producion
   */
  dev: isLocal,

  publicRuntimeConfig: {
    googleMapAPIKey: process.env.CW_GMAP_API_KEY,
    webSocketUrl: process.env.CW_WS_URL || '/ws/',
    vapidKey: 'BJh7odgJ_y4V6Rfd2D4xjUCSKa_HQxyUzfPDhLepJC6IVmhxjfdILA4DFcPkv-__emKjV2R-aaLSqItVzp_kcME'
  },

  /*
  ** Nuxt rendering mode
  ** See https://nuxtjs.org/api/configuration-mode
  */
  // mode: 'spa',
  ssr: false,
  server: {
    host: process.env.NUXT_HOST || '0',
    port: process.env.NUXT_PORT || 5000
  },
  /*
  ** Nuxt target
  ** See https://nuxtjs.org/api/configuration-target
  */
  target: 'server',
  /*
  ** Headers of the page
  ** See https://nuxtjs.org/api/configuration-head
  */
  head: {
    title: 'Cowellness',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  /*
  ** Global CSS
  */
  css: [
    'izitoast/dist/css/iziToast.min.css',
    '~assets/scss/main.scss',
    'flatpickr/dist/flatpickr.css',
    'vue-swatches/dist/vue-swatches.css',
    'vue-slider-component/theme/default.css',
    '~assets/scss/rich-text.scss'
  ],
  /*
  ** Plugins to load before mounting the App
  ** https://nuxtjs.org/guide/plugins
  */
  plugins: [
    '~plugins/utils',
    '~plugins/tippy',
    '~plugins/swipe',
    '~plugins/vue-mq',
    '~plugins/resize',
    '~plugins/v-mask',
    '~plugins/confirm',
    '~plugins/masonry',
    '~plugins/izitoast',
    '~plugins/viewport',
    '~plugins/lazyload',
    '~plugins/input-file',
    '~plugins/portal-vue',
    '~plugins/vue-qr-code',
    '~plugins/action-sheet',
    '~plugins/auto-resize-text',
    '~plugins/directive-click-away',
    '~plugins/pwa',
    '~plugins/axios',
    '~plugins/websocket',
    '~plugins/repositories',
    '~plugins/push-subscription',
    '~plugins/auth',
    '~plugins/share'
  ],
  /*
  ** Auto import components
  ** See https://nuxtjs.org/api/configuration-components
  */
  components: [
    { path: '~/components', pathPrefix: false, prefix: 'cw', extensions: ['vue'] },
    { path: '~/components/global', pathPrefix: false, prefix: 'base', extensions: ['vue'] }
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    ['@nuxtjs/eslint-module', { fix: true }],
    '@nuxtjs/tailwindcss',
    '@nuxtjs/svg'
  ],
  /*
  ** Nuxt.js modules`
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/proxy',
    ['@nuxtjs/pwa', {
      manifest: {
        name: 'Cowellness',
        lang: 'en',
        short_name: 'Cowellness',
        display: 'standalone',
        start_url: '/',
        theme_color: '#262626',
        background_color: '#262626'
      },
      workbox: {
        importScripts: [
          '/cw-sw.js'
        ],
        dev: isLocal,
        offline: !isLocal,
        offlineStrategy: 'NetworkFirst'
      }
    }],
    ['nuxt-vuex-localstorage', {
      localStorage: ['index', 'linkPreview']
    }],
    ['@nuxtjs/dayjs', {
      locales: ['en', 'it', 'es'],
      defaultLocale: 'en'
    }],
    ['nuxt-i18n', {
      locales: [
        { code: 'en', file: 'translations.js' },
        { code: 'it', file: 'translations.js' },
        { code: 'es', file: 'translations.js' }
      ],
      lazy: true,
      langDir: 'lang/',
      differentDomains: false,
      detectBrowserLanguage: {
        useCookie: true,
        cookieKey: 'cw_locale',
        onlyOnRoot: false
      },
      strategy: 'no_prefix',
      defaultLocale: 'en',
      vueI18n: {
        fallbackLocale: 'en'
      },
      vuex: {
        moduleName: 'i18n',
        syncLocale: true,
        syncMessages: false,
        syncRouteParams: false
      }
    }]
  ],
  /*
  ** Axios module configuration
  ** See https://axios.nuxtjs.org/options
  */
  axios: {
    proxy: isLocal,
    credentials: true,
    baseURL: process.env.BASE_URL,
    browserBaseURL: ''
  },

  proxy: isLocal ? {
    '/api/': { target: process.env.CW_API_URL || 'https://dev.cowellness.net/api/', pathRewrite: { '^/api/': '' } },
    '/file/': { target: process.env.CW_API_URL || 'https://dev.cowellness.net/file/', pathRewrite: { '^/file/': '' } },
    '/ws/': { target: 'wss://dev.cowellness.net/api/ws/', pathRewrite: { '^/ws/': '' }, ws: true, changeOrigin: true }
  } : {},

  /*
  ** Build configuration
  ** See https://nuxtjs.org/api/configuration-build/
  */
  build: {},

  router: {
    middleware: ['initial', 'layout', 'auth']
  }
}
