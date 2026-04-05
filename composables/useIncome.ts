export interface Income {
  id: number
  user_id: number
  label: string
  amount: string
  period: string
  created_at: string
}

export const useIncome = () => {
  const { apiFetch } = useApi()
  const incomes = useState<Income[]>('incomes', () => [])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchIncome = async (period: string) => {
    loading.value = true
    error.value = null
    try {
      incomes.value = await apiFetch<Income[]>(`/income?period=${period}`)
    } catch (e: any) {
      error.value = e?.data?.message ?? 'Failed to fetch income'
    } finally {
      loading.value = false
    }
  }

  const createIncome = async (input: { quick_input?: string; label?: string; amount?: number; period?: string }) => {
    const income = await apiFetch<Income>('/income', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    incomes.value = [income, ...incomes.value]
    return income
  }

  const updateIncome = async (id: number, data: { label?: string; amount?: number }) => {
    const updated = await apiFetch<Income>(`/income/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    incomes.value = incomes.value.map(i => i.id === id ? updated : i)
    return updated
  }

  const deleteIncome = async (id: number) => {
    await apiFetch(`/income/${id}`, { method: 'DELETE' })
    incomes.value = incomes.value.filter(i => i.id !== id)
  }

  return { incomes, loading, error, fetchIncome, createIncome, updateIncome, deleteIncome }
}
