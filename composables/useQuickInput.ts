export const useQuickInput = () => {
  const { createExpense } = useExpenses()
  const { createIncome } = useIncome()
  const { setSalary } = useSalary()
  const error = ref<string | null>(null)
  const loading = ref(false)

  const submit = async (raw: string, period: string) => {
    error.value = null
    loading.value = true

    try {
      const parsed = parseQuickInput(raw)

      if (parsed.type === 'expense') {
        await createExpense({ label: parsed.label, amount: parsed.amount, period })
      } else if (parsed.type === 'income') {
        await createIncome({ label: parsed.label, amount: parsed.amount, period })
      } else if (parsed.type === 'salary') {
        await setSalary(parsed.amount, period)
      }
    } catch (e: any) {
      error.value = e?.message ?? e?.data?.message ?? 'Invalid input'
      throw e
    } finally {
      loading.value = false
    }
  }

  return { submit, error, loading }
}
