import React, { useEffect, useState } from 'react'
import { NPC, loadNPCsFromStorage, saveNPCsToStorage, NPC_DATABASE, deleteNPC, scavengeFromTable, LOOT_TABLES, formatMoney } from '../grimgar'
import NPCList from './components/NPCList'
import ScavengerPanel from './components/ScavengerPanel'

export default function App() {
  const [npcs, setNpcs] = useState<Record<string, NPC>>({})

  useEffect(() => {
    const stored = loadNPCsFromStorage()
    setNpcs(stored)
  }, [])

  function handleDelete(id: string) {
    const copy = { ...npcs }
    deleteNPC(copy, id)
    saveNPCsToStorage(copy)
    setNpcs(copy)
  }

  function handleResetToDefaults() {
    saveNPCsToStorage(NPC_DATABASE)
    setNpcs(NPC_DATABASE)
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Grimgar — UI Demo</h1>
      <p>Branch: feature/ui-and-tests — simple React + Vite demo that exercises grimgar.ts features.</p>

      <section>
        <h2>NPCs</h2>
        <button onClick={handleResetToDefaults}>Reset to defaults</button>
        <NPCList npcs={npcs} onDelete={handleDelete} />
      </section>

      <section style={{ marginTop: 20 }}>
        <h2>Scavenger (quick roll)</h2>
        <ScavengerPanel onRoll={(res) => {
          // show quick alert summary
          alert(JSON.stringify({ total: formatMoney(res.totalBronze), items: res.obtained.map(i => ({ name: i.item.name, qty: i.quantity })) }, null, 2))
        }} />
      </section>

      <section style={{ marginTop: 20 }}>
        <h2>Raw Data</h2>
        <pre style={{ maxHeight: 300, overflow: 'auto', background: '#f7f7f7', padding: 8 }}>{JSON.stringify(npcs, null, 2)}</pre>
      </section>
    </div>
  )
}
