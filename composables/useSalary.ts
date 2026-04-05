export interface Salary {
  id: number
  user_id: number
  amount: string
  period: string
}

export const useSalary = () => {
  const { apiFetch } = useApi()
  const salaries = useState<Salary[]>('salaries', () => [])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchSalaries = async () => {
    loading.value = true
    error.value = null
    try {
      salaries.value = await apiFetch<Salary[]>('/salary')
    } catch (e: any) {
      error.value = e?.data?.message ?? 'Failed to fetch salary'
    } finally {
      loading.value = false
    }
  }

  const setSalary = async (amount: number, period: string) => {
    const result = await apiFetch<Salary>('/salary', {
      method: 'POST',
      body: JSON.stringify({ amount, period }),
    })
    await fetchSalaries()
    return result
  }

  const deleteSalary = async (period: string) => {
    await apiFetch(`/salary/${period}`, { method: 'DELETE' })
    salaries.value = salaries.value.filter(s => s.period !== period)
  }

  return { salaries, loading, error, fetchSalaries, setSalary, deleteSalary }
}
