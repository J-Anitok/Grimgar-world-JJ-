import { describe, it, expect } from 'vitest'
import { computeThresholdForValue, nextThreshold } from '../grimgar'

describe('thresholds', () => {
  it('single parent thresholds (value 5 -> threshold 20?)', () => {
    // value 5 single parent: startBase=5 -> tierValue=5 -> threshold = 5*4 = 20
    expect(computeThresholdForValue(5, 1)).toBe(20)
  })

  it('two parent thresholds start at 10', () => {
    expect(computeThresholdForValue(10, 2)).toBe(40)
  })

  it('nextThreshold increments', () => {
    expect(nextThreshold(5,1)).toBe(60) // next tier: 15*4=60
  })
})
