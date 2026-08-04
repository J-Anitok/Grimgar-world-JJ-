import React, { useEffect, useState } from "react";
import * as G from "../data/grimgar";

export default function NPCEditor(): JSX.Element {
  const [npcs, setNpcs] = useState<Record<string, G.NPC>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<G.NPC>>({});

  useEffect(() => {
    setNpcs(G.loadNPCsFromStorage());
  }, []);

  function persist(copy: Record<string, G.NPC>) {
    G.saveNPCsToStorage(copy);
    setNpcs(copy);
  }

  function handleNew() {
    const id = `npc_${Date.now()}`;
    const base: G.NPC = {
      id,
      title: "",
      name: "New NPC",
      location: "",
      description: "",
      hp: 10,
      ac: 10,
      stats: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
      inventory: []
    };
    const copy = { ...npcs, [id]: base };
    persist(copy);
    setEditingId(id);
    setForm(base);
  }

  function handleEdit(id: string) {
    setEditingId(id);
    setForm(npcs[id]);
  }

  function handleSave() {
    if (!editingId || !form) return;
    const updated: G.NPC = { ...(npcs[editingId] || {}), ...(form as G.NPC) } as G.NPC;
    const copy = { ...npcs, [editingId]: updated };
    persist(copy);
    setEditingId(null);
  }

  function handleDelete(id: string) {
    if (!confirm("Delete NPC?")) return;
    const copy = { ...npcs };
    delete copy[id];
    persist(copy);
  }

  function addInventoryItem() {
    if (!editingId) return;
    const i = { item: "New Item", priceBronze: 0, currency: "SC" as G.Currency, lore: "" } as any;
    const copy = { ...npcs };
    (copy[editingId].inventory || []).push(i);
    persist(copy);
    setForm(copy[editingId]);
  }

  function updateInventory(idx: number, key: string, value: any) {
    if (!editingId) return;
    const copy = { ...npcs };
    const inv = copy[editingId].inventory;
    inv[idx] = { ...inv[idx], [key]: value } as any;
    persist(copy);
    setForm(copy[editingId]);
  }

  return (
    <div>
      <h2>NPC Editor</h2>
      <button onClick={handleNew}>Create New NPC</button>
      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <div style={{ flex: 1 }}>
          <h3>NPC List</h3>
          <ul>
            {Object.keys(npcs).map(id => (
              <li key={id}>
                <strong>{npcs[id].name}</strong> — {npcs[id].title}
                <button onClick={() => handleEdit(id)} style={{ marginLeft: 8 }}>Edit</button>
                <button onClick={() => handleDelete(id)} style={{ marginLeft: 4 }}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ flex: 2 }}>
          {editingId ? (
            <div>
              <h3>Editing {editingId}</h3>
              <div>
                <label>Name: <input value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
              </div>
              <div>
                <label>Title: <input value={form.title || ""} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
              </div>
              <div>
                <label>Location: <input value={form.location || ""} onChange={e => setForm({ ...form, location: e.target.value })} /></label>
              </div>
              <div>
                <label>HP: <input type="number" value={form.hp || 0} onChange={e => setForm({ ...form, hp: Number(e.target.value) })} /></label>
                <label style={{ marginLeft: 8 }}>AC: <input type="number" value={form.ac || 0} onChange={e => setForm({ ...form, ac: Number(e.target.value) })} /></label>
              </div>
              <div style={{ marginTop: 8 }}>
                <h4>Inventory</h4>
                <button onClick={addInventoryItem}>Add Item</button>
                <ul>
                  {(form.inventory || []).map((it: any, idx: number) => (
                    <li key={idx}>
                      <input value={it.item} onChange={e => updateInventory(idx, "item", e.target.value)} />
                      <input value={it.priceBronze != null ? G.formatMoney(it.priceBronze) : "0 BRZ"} onChange={e => updateInventory(idx, "priceBronze", G.parsePriceToBronze(e.target.value))} />
                      <input value={it.lore || ""} onChange={e => updateInventory(idx, "lore", e.target.value)} />
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ marginTop: 8 }}>
                <h4>Substats (simple)</h4>
                <pre>{JSON.stringify(form.substats || {}, null, 2)}</pre>
              </div>

              <div style={{ marginTop: 12 }}>
                <button onClick={handleSave}>Save</button>
                <button onClick={() => { setEditingId(null); setForm({}); }} style={{ marginLeft: 8 }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div>Select an NPC to edit or create a new one.</div>
          )}
        </div>
      </div>
    </div>
  );
}
