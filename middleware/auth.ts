export default defineNuxtRouteMiddleware((to) => {
  // Skip on server (SPA mode)
  if (import.meta.server) return

  // Read directly from localStorage — most reliable in SPA mode
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null

  if (!token && to.path !== '/login' && to.path !== '/register') {
    return navigateTo('/login')
  }
})
