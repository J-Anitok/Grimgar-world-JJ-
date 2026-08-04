import React, { useEffect, useState } from "react";
import * as G from "../data/grimgar";

export default function SubstatEditor(): JSX.Element {
  const [npcs, setNpcs] = useState<Record<string, G.NPC>>({});
  const [selectedNpc, setSelectedNpc] = useState<string | null>(null);
  const [rippleConfig, setRippleConfig] = useState({ percentToParents: 0.2, distributeAcrossParents: true });

  useEffect(() => {
    setNpcs(G.loadNPCsFromStorage());
  }, []);

  function persist(copy: Record<string, G.NPC>) {
    G.saveNPCsToStorage(copy);
    setNpcs(copy);
  }

  function addSubstat(npcId: string) {
    const name = prompt("Substat name") || "NewSub";
    const parents = (prompt("Comma-separated parents (STR,DEX,..)") || "STR").split(",").map(s => s.trim()) as any;
    const copy = { ...npcs };
    if (!copy[npcId].substats) copy[npcId].substats = {};
    copy[npcId].substats![name] = { name, parents, value: 5 } as any;
    persist(copy);
  }

  function setThresholdOverride(npcId: string, subName: string) {
    const v = prompt("Override threshold (number) — leave empty to clear");
    const copy = { ...npcs };
    const sub = copy[npcId].substats![subName];
    if (!sub) return;
    if (!v) delete sub.thresholdOverride;
    else sub.thresholdOverride = Number(v);
    persist(copy);
  }

  function applyRipple(npcId: string, subName: string) {
    const copy = { ...npcs };
    const sub = copy[npcId].substats![subName];
    if (!sub) return;
    G.applyRippleToParents(sub as any, { amount: Math.round(1), coreRipple: false } as any, copy[npcId]);
    persist(copy);
    alert("Applied ripple +1 split to parents");
  }

  return (
    <div>
      <h2>Substat & Ripple Editor</h2>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <h3>NPCs</h3>
          <ul>
            {Object.keys(npcs).map(id => (
              <li key={id}><button onClick={() => setSelectedNpc(id)}>{npcs[id].name}</button></li>
            ))}
          </ul>
        </div>
        <div style={{ flex: 2 }}>
          {selectedNpc ? (
            <div>
              <h3>{npcs[selectedNpc].name} — Substats</h3>
              <button onClick={() => addSubstat(selectedNpc)}>Add Substat</button>
              <ul>
                {(npcs[selectedNpc].substats ? Object.keys(npcs[selectedNpc].substats) : []).map(sn => {
                  const s = npcs[selectedNpc].substats![sn];
                  return (
                    <li key={sn}>
                      <strong>{s.name}</strong> (parents: {s.parents.join(",")}) — value: {s.value}
                      <button onClick={() => setThresholdOverride(selectedNpc, sn)} style={{ marginLeft: 8 }}>Set Threshold Override</button>
                      <button onClick={() => applyRipple(selectedNpc, sn)} style={{ marginLeft: 8 }}>Apply Ripple</button>
                      <div>Next threshold: {G.computeNextThresholdForSubstat(s as any)}</div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (<div>Select an NPC to edit substats.</div>)}
        </div>
      </div>
    </div>
  );
}
