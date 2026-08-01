import React, { useState } from 'react'
import { TrainingSchedule, TrainingSession, NPC, trainSelected, loadNPCsFromStorage, saveNPCsToStorage } from '../../grimgar'

export default function TrainingScheduler() {
  const [schedules, setSchedules] = useState<TrainingSchedule[]>([]) 
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null)
  const [npcSelection, setNpcSelection] = useState<string[]>([])
  const [npcs, setNpcs] = useState<Record<string,NPC>>(loadNPCsFromStorage())

  function createSampleSchedule() {
    const session: TrainingSession = { id: 's1', name: 'Strength Routine', statDeltas: { STR: 1 } }
    const sched: TrainingSchedule = { id: 'sched_' + Date.now(), name: 'Daily Strength', sessions: [session] }
    setSchedules(prev => [...prev, sched])
    setSelectedSchedule(sched.id)
  }

  function toggleNpc(id: string) {
    setNpcSelection(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function runTraining() {
    if (!selectedSchedule) return
    const sched = schedules.find(s => s.id === selectedSchedule)!
    trainSelected(npcs, sched, npcSelection, {})
    saveNPCsToStorage(npcs)
    setNpcs({ ...npcs })
    alert('Training applied to ' + npcSelection.length + ' NPC(s)')
  }

  return (
    <div style={{ border: '1px solid #ddd', padding: 12 }}>
      <h3>Training Scheduler</h3>
      <div>
        <button onClick={createSampleSchedule}>Create sample schedule</button>
      </div>
      <div style={{ marginTop: 8 }}>
        <label>Schedules:</label>
        <select value={selectedSchedule ?? ''} onChange={e => setSelectedSchedule(e.target.value || null)}>
          <option value="">-- select --</option>
          {schedules.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div style={{ marginTop: 8 }}>
        <label>Pick NPCs:</label>
        <div style={{ maxHeight: 120, overflow: 'auto', border: '1px solid #eee', padding: 6 }}>
          {Object.keys(npcs).map(k => (
            <div key={k}><label><input type="checkbox" checked={npcSelection.includes(k)} onChange={() => toggleNpc(k)} /> {npcs[k].name}</label></div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 8 }}>
        <button onClick={runTraining}>Run Training for selected NPCs</button>
      </div>
    </div>
  )
}
