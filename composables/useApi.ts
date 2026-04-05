/**
 * Helper to make authenticated API calls.
 */
export const useApi = () => {
  const config = useRuntimeConfig()
  const { token } = useAuth()

  const apiFetch = <T>(path: string, options: RequestInit & { body?: any } = {}): Promise<T> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }

    if (token.value) {
      headers['Authorization'] = `Bearer ${token.value}`
    }

    return $fetch<T>(`${config.public.apiBase}${path}`, {
      ...options,
      headers: { ...headers, ...(options.headers as Record<string, string> ?? {}) },
    })
  }

  return { apiFetch }
}
