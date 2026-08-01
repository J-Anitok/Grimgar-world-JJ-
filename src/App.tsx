import React, { useState } from 'react'
import PlayerBank from './components/PlayerBank'
import NPCList from './components/NPCList'
import ScavengerPanel from './components/ScavengerPanel'
import TrainingScheduler from './components/TrainingScheduler'
import StatInspector from './components/StatInspector'

export default function App() {
  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Grimgar — UI Demo</h1>
      <section>
        <h2>NPCs</h2>
        <NPCList npcs={{}} onDelete={() => {}} />
      </section>

      <section style={{ marginTop: 20 }}>
        <PlayerBank />
      </section>

      <section style={{ marginTop: 20 }}>
        <TrainingScheduler />
      </section>

      <section style={{ marginTop: 20 }}>
        <StatInspector />
      </section>

      <section style={{ marginTop: 20 }}>
        <h2>Scavenger (quick roll)</h2>
        <ScavengerPanel />
      </section>
    </div>
  )
}
