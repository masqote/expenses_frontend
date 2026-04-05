export const useTelegramLink = () => {
  const { apiFetch } = useApi()
  const token = ref<string | null>(null)
  const expiresAt = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const generateToken = async () => {
    loading.value = true
    error.value = null
    try {
      const result = await apiFetch<{ token: string; expires_at: string }>('/telegram/link-token', {
        method: 'POST',
      })
      token.value = result.token
      expiresAt.value = result.expires_at
    } catch (e: any) {
      error.value = e?.data?.message ?? 'Failed to generate token'
    } finally {
      loading.value = false
    }
  }

  return { token, expiresAt, loading, error, generateToken }
}
