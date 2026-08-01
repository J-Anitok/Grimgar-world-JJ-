import { describe, it, expect } from 'vitest'
import { toBronze, fromBronze, formatMoney } from '../grimgar'

describe('currency', () => {
  it('converts silver to bronze and back', () => {
    const b = toBronze(2, 'SC')
    expect(b).toBe(200)
    expect(fromBronze(b, 'SC')).toBe(2)
  })

  it('formats money properly', () => {
    expect(formatMoney(0)).toBe('0 BRZ')
    expect(formatMoney(12345)).toBe('1 GC 23 SC 45 BRZ')
  })
})
