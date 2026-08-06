import { useEffect, useState } from "react";
import * as G from "../data/grimgar";

export default function ImportExport(): JSX.Element {
  const [npcs, setNpcs] = useState<Record<string, G.NPC>>({});
  const [players, setPlayers] = useState<G.Player[]>([]);

  useEffect(() => {
    setNpcs(G.loadNPCsFromStorage());
    setPlayers(G.loadPlayersFromStorage());
  }, []);

  function exportAll() {
    const payload = { npcs, players };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "grimgar_backup.json";
    a.click();
  }

  function importFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(String(ev.target?.result));
        if (parsed.npcs) {
          G.saveNPCsToStorage(parsed.npcs);
          setNpcs(parsed.npcs);
        }
        if (parsed.players) {
          if (G.savePlayersToStorage) G.savePlayersToStorage(parsed.players);
          setPlayers(parsed.players);
        }
        alert("Imported successfully");
      } catch (err) {
        alert("Invalid file");
      }
    };
    reader.readAsText(f);
  }

  function clearAll() {
    if (!confirm("Clear ALL NPCs and Players from localStorage? This cannot be undone.")) return;
    localStorage.removeItem("grimgar_world_v1:npcs");
    localStorage.removeItem("grimgar_world_v1:players");
    setNpcs({});
    setPlayers([]);
    alert("Cleared");
  }

  return (
    <div>
      <h2>Import / Export & Bulk</h2>
      <div>
        <button onClick={exportAll}>Export NPCs & Players (JSON)</button>
        <input type="file" accept="application/json" onChange={importFile} />
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={clearAll} style={{ color: "red" }}>Clear all local data</button>
      </div>
      <div style={{ marginTop: 12 }}>
        <h3>Preview</h3>
        <div>NPCs: {Object.keys(npcs).length}</div>
        <div>Players: {players.length}</div>
      </div>
    </div>
  );
}
