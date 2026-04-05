export interface Summary {
  period: string
  salary: number | null
  total_income: number
  total_expenses: number
  balance: number | null
}

export const useSummary = () => {
  const { apiFetch } = useApi()
  const summary = useState<Summary | null>('summary', () => null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchSummary = async (period: string) => {
    loading.value = true
    error.value = null
    try {
      summary.value = await apiFetch<Summary>(`/summary?period=${period}`)
    } catch (e: any) {
      error.value = e?.data?.message ?? 'Failed to fetch summary'
    } finally {
      loading.value = false
    }
  }

  return { summary, loading, error, fetchSummary }
}
