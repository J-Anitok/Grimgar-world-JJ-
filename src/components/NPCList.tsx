import React from 'react'
import { NPC } from '../../grimgar'

export default function NPCList({ npcs, onDelete }: { npcs: Record<string, NPC>, onDelete: (id: string) => void }) {
  const keys = Object.keys(npcs)
  if (!keys.length) return <div>No NPCs</div>
  return (
    <div>
      <ul>
        {keys.map(k => {
          const n = npcs[k]
          return (
            <li key={k} style={{ marginBottom: 8 }}>
              <strong>{n.name}</strong> — {n.title} @ {n.location}
              <div>HP: {n.hp} AC: {n.ac}</div>
              <div style={{ marginTop: 4 }}>
                <button onClick={() => onDelete(k)}>Delete</button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
