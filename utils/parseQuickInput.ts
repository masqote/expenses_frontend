export type ParseResult =
  | { type: 'expense'; label: string; amount: number }
  | { type: 'income'; label: string; amount: number }
  | { type: 'salary'; amount: number }

/**
 * Parse a quick input string into a structured record.
 * Mirrors the PHP QuickInputParser rules exactly.
 * @throws Error on malformed input
 */
export function parseQuickInput(input: string): ParseResult {
  const trimmed = input.trim()

  // Rule 1: income prefix (case-insensitive)
  const incomeMatch = trimmed.match(/^income\s+(.+)$/i)
  if (incomeMatch) {
    const { label, amount } = parseLabelAmount(incomeMatch[1])
    return { type: 'income', label, amount }
  }

  // Rule 2: salary prefix (case-insensitive)
  const salaryMatch = trimmed.match(/^salary\s+(.+)$/i)
  if (salaryMatch) {
    const amount = parseAmount(salaryMatch[1].trim())
    return { type: 'salary', amount }
  }

  // Rule 3: plain expense
  const { label, amount } = parseLabelAmount(trimmed)
  return { type: 'expense', label, amount }
}

function parseLabelAmount(input: string): { label: string; amount: number } {
  // Rule 4: split on first ' : ' (space-colon-space)
  const pos = input.indexOf(' : ')
  if (pos === -1) {
    throw new Error('Invalid format. Expected: label : amount')
  }

  const label = input.substring(0, pos).trim()
  const rawAmt = input.substring(pos + 3).trim()

  // Rule 7: reject empty label
  if (label === '') {
    throw new Error('Label cannot be empty.')
  }

  const amount = parseAmount(rawAmt)
  return { label, amount }
}

function parseAmount(raw: string): number {
  if (raw === '') {
    throw new Error('Amount cannot be empty.')
  }

  // Rule 5: thousands-separated integer pattern e.g. 1.000 / 1,000 / 1.000.000
  if (/^\d{1,3}([.,]\d{3})+$/.test(raw)) {
    const normalized = raw.replace(/[.,]/g, '')
    return parseFloat(normalized)
  }

  // Rule 6: single separator with < 3 trailing digits → decimal
  const decimalMatch = raw.match(/^(\d+)[.,](\d{1,2})$/)
  if (decimalMatch) {
    return parseFloat(`${decimalMatch[1]}.${decimalMatch[2]}`)
  }

  // Plain integer or float
  const n = parseFloat(raw)
  if (isNaN(n)) {
    throw new Error('Amount must be a valid number.')
  }

  return n
}
