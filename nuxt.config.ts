// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      // Support both env names for compatibility
      apiBase: process.env.NUXT_PUBLIC_API_BASE || process.env.NUXT_PUBLIC_API_BASE_URL || '' || 'https://genzvibe.ikhode.com'
    }
  },
  // Explicitly use the `app/` folder as source directory so Nuxt scans app/pages
  srcDir: 'app',
  devtools: { enabled: true },
  
  modules: ['@nuxt/ui'],

  colorMode: {
    preference: 'dark'
  },

  app: {
    head: {
      title: 'GenZ Vibe',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'GenZ Vibe — modern, minimal products by Khmer creators. Create, discover, and shop the cheapest price products produced in Cambodia.' },
        { name: 'keywords', content: 'genz vibe, genz product, create product, kon khmer product, ikhode, genz producer, product minnimal , modern, cheapest price product ever produce in cambodia' }
      ],
      link: [
        // Favicons
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon/favicon-16x16.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon/favicon-32x32.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/favicon/android-chrome-192x192.png' },
        { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/favicon/android-chrome-512x512.png' },
        { rel: 'manifest', href: '/favicon/site.webmanifest' },
        // Fonts
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@700;800;900&display=swap' }
      ]
    }
  },

  // Ensure /admin can be refreshed without 404 by serving SPA shell
  routeRules: {
    '/admin/**': { ssr: false },
    '/admin': { ssr: false }
  },

  compatibilityDate: '2025-01-20'
  ,
  // Vite dev server configuration
  vite: {
    server: {
      allowedHosts: ['genzvibe.ikhode.com']
    }
  }
})
