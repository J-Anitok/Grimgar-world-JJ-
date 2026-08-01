import React, { useState } from 'react'
import { LOOT_TABLES, scavengeFromTable, listScavengerResult } from '../../grimgar'

export default function ScavengerPanel({ onRoll }: { onRoll?: (res: any) => void }) {
  const [tableKey, setTableKey] = useState<string>('goblin_scavenger')
  const [quality, setQuality] = useState<number>(1.0)
  const [collection, setCollection] = useState<number>(1)

  function handleRoll() {
    const table = LOOT_TABLES[tableKey]
    if (!table) return
    const res = scavengeFromTable(table, quality, collection)
    if (onRoll) onRoll(res)
    else alert(JSON.stringify(listScavengerResult(res), null, 2))
  }

  return (
    <div style={{ border: '1px solid #ddd', padding: 12 }}>
      <div>
        <label>Loot table: </label>
        <select value={tableKey} onChange={e => setTableKey(e.target.value)}>
          {Object.keys(LOOT_TABLES).map(k => <option value={k} key={k}>{LOOT_TABLES[k].name}</option>)}
        </select>
      </div>
      <div style={{ marginTop: 8 }}>
        <label>Quality multiplier: </label>
        <input type="number" step="0.1" value={quality} onChange={e => setQuality(Number(e.target.value))} />
      </div>
      <div style={{ marginTop: 8 }}>
        <label>Collection attempts: </label>
        <input type="number" min={1} value={collection} onChange={e => setCollection(Number(e.target.value))} />
      </div>
      <div style={{ marginTop: 8 }}>
        <button onClick={handleRoll}>Roll Scavenger</button>
      </div>
    </div>
  )
}
