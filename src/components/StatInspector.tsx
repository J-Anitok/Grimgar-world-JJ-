import React, { useState } from 'react'
import { StatDef, computeThresholdForValue, nextThreshold, RippleConfig, applyRippleFromSubToParents, applyRippleFromCoreToSub } from '../../grimgar'

export default function StatInspector() {
  const [stats, setStats] = useState<Record<string, StatDef>>({
    STR: { name: 'STR', value: 12 },
    DEX: { name: 'DEX', value: 10 },
    'Sub-Perception': { name: 'Sub-Perception', value: 7, parents: ['WIS'] }
  })
  const [ripple, setRipple] = useState<RippleConfig>({ percentToParents: 0.2, percentToSub: 0.1, distributeAcrossParents: true })

  function bump(statName: string, delta: number) {
    const copy = { ...stats }
    copy[statName].value += delta
    // automatic ripple from sub to parents if sub
    if (copy[statName].parents && copy[statName].parents.length) {
      applyRippleFromSubToParents(copy, statName, delta, ripple)
    }
    setStats(copy)
  }

  return (
    <div style={{ border: '1px solid #ddd', padding: 12 }}>
      <h3>Stat Inspector</h3>
      <div>
        <label>Ripple to parents (%): <input type="number" step="0.05" value={ripple.percentToParents} onChange={e => setRipple({ ...ripple, percentToParents: Number(e.target.value) })} /></label>
      </div>
      <div style={{ marginTop: 8 }}>
        {Object.values(stats).map(s => (
          <div key={s.name} style={{ marginTop: 6 }}>
            <strong>{s.name}</strong> — Value: {s.value} — Threshold: {computeThresholdForValue(s.value, (s.parents||[]).length, s.thresholdOverride)} (next: {nextThreshold(s.value, (s.parents||[]).length)})
            <div><button onClick={() => bump(s.name, 1)}>+1</button> <button onClick={() => bump(s.name, -1)}>-1</button></div>
          </div>
        ))}
      </div>
    </div>
  )
}
