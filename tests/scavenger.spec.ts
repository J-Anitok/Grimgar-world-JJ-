import { describe, it, expect } from 'vitest'
import { LOOT_TABLES, scavengeFromTable } from '../grimgar'

describe('scavenger', () => {
  it('scavenge returns structure', () => {
    const table = LOOT_TABLES['goblin_scavenger']
    const res = scavengeFromTable(table, 1, 1)
    expect(res).toHaveProperty('obtained')
    expect(res).toHaveProperty('totalBronze')
  })
})
