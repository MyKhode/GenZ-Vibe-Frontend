// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Explicitly use the `app/` folder as source directory so Nuxt scans app/pages
  srcDir: 'app',
  devtools: { enabled: true },
  
  modules: ['@nuxt/ui'],

  colorMode: {
    preference: 'dark'
  },

  app: {
    head: {
      title: 'Peak Premium Audio',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Premium gaming headsets for legendary performance' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@700;800;900&display=swap' }
      ]
    }
  },

  compatibilityDate: '2025-01-20'
})
