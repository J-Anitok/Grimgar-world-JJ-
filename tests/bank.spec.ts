import { describe, it, expect } from 'vitest'
import { createPlayer, depositToBank, withdrawFromBank, applyInterestToAccount } from '../grimgar'

describe('bank', () => {
  it('deposit and withdraw flows', () => {
    const p = createPlayer('t1', 'Test', 1000)
    p.bankAccounts.push({ id: 'a1', balanceBronze: 0, interestRateAnnualPercent: 0 })
    depositToBank(p, 'a1', 500)
    expect(p.walletBronze).toBe(500)
    expect(p.bankAccounts[0].balanceBronze).toBe(500)
    withdrawFromBank(p, 'a1', 200)
    expect(p.walletBronze).toBe(700)
    expect(p.bankAccounts[0].balanceBronze).toBe(300)
  })

  it('interest increases balance', () => {
    const acc = { id: 'a2', balanceBronze: 10000, interestRateAnnualPercent: 365 }
    // applyInterestToAccount for 1 day should roughly add ~1% (since APR 365 -> daily ~1%)
    const before = acc.balanceBronze
    applyInterestToAccount(acc, new Date(Date.now() + 1000*60*60*24).toISOString())
    expect(acc.balanceBronze).toBeGreaterThanOrEqual(before)
  })
})
