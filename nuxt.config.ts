export default defineNuxtConfig({
  ssr: false,
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'http://192.168.100.15:8000/api',
    },
  },
  app: {
    head: {
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' },
      ],
      script: [
        { src: 'https://cdn.tailwindcss.com', defer: false }
      ]
    }
  },
  devtools: { enabled: false },
})
