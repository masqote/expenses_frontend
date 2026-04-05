export default defineNuxtConfig({
  ssr: false,
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'https://expenses-production-09b3.up.railway.app/api',
    },
  },
  app: {
    head: {
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' },
      ],
      script: [
        { src: 'https://cdn.tailwindcss.com', defer: false },
        { src: 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js', defer: false }
      ]
    }
  },
  devtools: { enabled: false },
})
