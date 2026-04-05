import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { parseQuickInput } from '../../utils/parseQuickInput'

describe('parseQuickInput', () => {
  it('parses plain expense', () => {
    const result = parseQuickInput('coffee : 15000')
    expect(result).toEqual({ type: 'expense', label: 'coffee', amount: 15000 })
  })

  it('parses income prefix', () => {
    const result = parseQuickInput('income freelance : 500000')
    expect(result).toEqual({ type: 'income', label: 'freelance', amount: 500000 })
  })

  it('parses salary prefix', () => {
    const result = parseQuickInput('salary 5000000')
    expect(result).toEqual({ type: 'salary', amount: 5000000 })
  })

  it('throws on missing separator', () => {
    expect(() => parseQuickInput('noseparator')).toThrow()
  })

  it('throws on empty label', () => {
    expect(() => parseQuickInput(' : 5000')).toThrow()
  })

  it('normalizes period thousands separator', () => {
    expect(parseQuickInput('eat : 20.000').amount).toBe(20000)
  })

  it('normalizes comma thousands separator', () => {
    expect(parseQuickInput('eat : 20,000').amount).toBe(20000)
  })

  it('treats single period with 1-2 digits as decimal', () => {
    expect(parseQuickInput('item : 20.5').amount).toBe(20.5)
  })
})

// Feature: expense-tracker, Property 12 (frontend): Quick Input Parsing Round-Trip
// Validates: Requirements 6.1, 6.5
it('Property 12 – parses any valid label and amount round-trip', () => {
  fc.assert(
    fc.property(
      fc.stringMatching(/^[a-z][a-z ]{0,20}[a-z]$/),
      fc.integer({ min: 1, max: 999999 }),
      (label, amount) => {
        const result = parseQuickInput(`${label} : ${amount}`)
        expect(result.type).toBe('expense')
        if (result.type === 'expense') {
          expect(result.label).toBe(label)
          expect(result.amount).toBe(amount)
        }
      }
    ),
    { numRuns: 100 }
  )
})

// Feature: expense-tracker, Property 13 (frontend): Thousands Separator Normalization
// Validates: Requirements 6.3
it('Property 13 – thousands separator normalization', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1000, max: 9999999 }),
      (n) => {
        const withDot = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
        const withComma = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        const resultDot = parseQuickInput(`food : ${withDot}`)
        const resultComma = parseQuickInput(`food : ${withComma}`)
        expect(resultDot.amount).toBe(n)
        expect(resultComma.amount).toBe(n)
      }
    ),
    { numRuns: 100 }
  )
})

// Feature: expense-tracker, Property 14 (frontend): Malformed Quick Input Rejected
// Validates: Requirements 6.2
it('Property 14 – malformed quick input (no separator) is rejected', () => {
  const malformed = [
    'noseparator',
    'coffee15000',
    'coffee:15000',
    '',
    '   ',
    'just a label',
    '12345',
  ]

  for (const input of malformed) {
    expect(() => parseQuickInput(input)).toThrow()
  }
})
