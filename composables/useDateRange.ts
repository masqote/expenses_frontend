const fmt = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const useDateRange = () => {
  const fromDate = useState('dateRangeFrom', () => {
    const now = new Date()
    const day = now.getDate()
    const from = day >= 25
      ? new Date(now.getFullYear(), now.getMonth(), 25)
      : new Date(now.getFullYear(), now.getMonth() - 1, 25)
    return fmt(from)
  })

  const toDate = useState('dateRangeTo', () => fmt(new Date()))

  const setRange = (from: string, to: string) => {
    fromDate.value = from
    toDate.value = to
  }

  return { fromDate, toDate, setRange }
}
