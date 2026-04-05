export const useAuth = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  const token = useState<string | null>('token', () => {
    if (import.meta.client) return localStorage.getItem('token')
    return null
  })

  const user = useState<{ id: number; name: string; email: string } | null>('user', () => null)

  const setToken = (t: string | null) => {
    token.value = t
    if (import.meta.client) {
      if (t) localStorage.setItem('token', t)
      else localStorage.removeItem('token')
    }
  }

  if (import.meta.client && !token.value) {
    const stored = localStorage.getItem('token')
    if (stored) token.value = stored
  }

  const fetchMe = async () => {
    if (!token.value) return
    try {
      user.value = await $fetch<{ id: number; name: string; email: string }>(`${apiBase}/me`, {
        headers: { Authorization: `Bearer ${token.value}` },
      })
    } catch { user.value = null }
  }

  const login = async (email: string, password: string) => {
    const data = await $fetch<{ token: string }>(`${apiBase}/login`, {
      method: 'POST',
      body: { email, password },
    })
    setToken(data.token)
    await fetchMe()
    return data
  }

  const register = async (name: string, email: string, password: string) => {
    const data = await $fetch<{ token: string }>(`${apiBase}/register`, {
      method: 'POST',
      body: { name, email, password },
    })
    setToken(data.token)
    await fetchMe()
    return data
  }

  const logout = async () => {
    if (token.value) {
      await $fetch(`${apiBase}/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token.value}` },
      }).catch(() => {})
    }
    setToken(null)
    user.value = null
  }

  const isAuthenticated = computed(() => !!token.value)

  return { token, user, login, logout, register, isAuthenticated, setToken, fetchMe }
}
