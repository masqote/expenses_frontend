export interface Salary {
  id: number
  user_id: number
  amount: string
  period: string
}

export const useSalary = () => {
  const { apiFetch } = useApi()
  const salary = useState<Salary | null>('salary', () => null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchSalary = async (period: string) => {
    loading.value = true
    error.value = null
    try {
      salary.value = await apiFetch<Salary | null>(`/salary?period=${period}`)
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
    salary.value = result
    return result
  }

  return { salary, loading, error, fetchSalary, setSalary }
}
