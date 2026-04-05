export interface Expense {
  id: number
  user_id: number
  label: string
  amount: string
  period: string
  category_id: number | null
  category: { id: number; name: string; icon: string | null } | null
  created_at: string
}

export const useExpenses = () => {
  const { apiFetch } = useApi()
  const expenses = useState<Expense[]>('expenses', () => [])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchExpenses = async (period: string) => {
    loading.value = true
    error.value = null
    try {
      expenses.value = await apiFetch<Expense[]>(`/expenses?period=${period}`)
    } catch (e: any) {
      error.value = e?.data?.message ?? 'Failed to fetch expenses'
    } finally {
      loading.value = false
    }
  }

  const createExpense = async (input: { quick_input?: string; label?: string; amount?: number; period?: string }) => {
    const expense = await apiFetch<Expense>('/expenses', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    expenses.value = [expense, ...expenses.value]
    return expense
  }

  const updateExpense = async (id: number, data: { label?: string; amount?: number }) => {
    const updated = await apiFetch<Expense>(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    expenses.value = expenses.value.map(e => e.id === id ? updated : e)
    return updated
  }

  const deleteExpense = async (id: number) => {
    await apiFetch(`/expenses/${id}`, { method: 'DELETE' })
    expenses.value = expenses.value.filter(e => e.id !== id)
  }

  return { expenses, loading, error, fetchExpenses, createExpense, updateExpense, deleteExpense }
}
