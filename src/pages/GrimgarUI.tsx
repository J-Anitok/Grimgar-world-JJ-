import React, { useEffect, useState } from "react";
import * as G from "../data/grimgar";
import "./grimgar-ui.css";

export default function GrimgarUI(): JSX.Element {
  const [players, setPlayers] = useState<G.Player[]>([]);
  const [npcs, setNpcs] = useState<Record<string, G.NPC>>({});
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [scavengeResult, setScavengeResult] = useState<any | null>(null);
  const [scavengeTable, setScavengeTable] = useState<string>("goblin_scavenger");
  const [qualityRoll, setQualityRoll] = useState<number>(1);
  const [collectionRoll, setCollectionRoll] = useState<number>(1);
  const [selectedNpcs, setSelectedNpcs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const ps = G.loadPlayersFromStorage();
    setPlayers(ps);
    const allNpcs = G.loadNPCsFromStorage();
    setNpcs(allNpcs);
  }, []);

  function persistPlayers(updated: G.Player[]) {
    G.savePlayersToStorage(updated);
    setPlayers(updated);
  }

  function persistNPCs(updated: Record<string, G.NPC>) {
    G.saveNPCsToStorage(updated);
    setNpcs(updated);
  }

  function handleCreatePlayer() {
    if (!newPlayerName) return;
    const id = `p_${Date.now()}`;
    const p = G.createPlayer(id, newPlayerName, 0);
    const next = [...players, p];
    persistPlayers(next);
    setNewPlayerName("");
    setSelectedPlayerId(id);
  }

  function handleDeletePlayer(id: string) {
    const next = players.filter(p => p.id !== id);
    persistPlayers(next);
    if (selectedPlayerId === id) setSelectedPlayerId(null);
  }

  function getSelectedPlayer(): G.Player | undefined {
    return players.find(p => p.id === selectedPlayerId);
  }

  function handleCreateBankAccount(playerId: string) {
    const player = players.find(p => p.id === playerId);
    if (!player) return;
    const acc: G.BankAccount = { id: `acc_${Date.now()}`, name: "Vault", balanceBronze: 0, interestRateAnnualPercent: 2, lastAccruedISO: new Date().toISOString() };
    player.bankAccounts.push(acc);
    const next = players.map(p => p.id === playerId ? player : p);
    persistPlayers(next);
  }

  function handleDeposit(playerId: string, accountId: string, amountSilver: number) {
    const player = players.find(p => p.id === playerId);
    if (!player) return;
    const bronze = G.coinsToBronze({ silver: amountSilver });
    try {
      G.depositToBank(player, accountId, bronze);
      const next = players.map(p => p.id === playerId ? player : p);
      persistPlayers(next);
    } catch (e) {
      alert(String(e));
    }
  }

  function handleWithdraw(playerId: string, accountId: string, amountSilver: number) {
    const player = players.find(p => p.id === playerId);
    if (!player) return;
    const bronze = G.coinsToBronze({ silver: amountSilver });
    try {
      G.withdrawFromBank(player, accountId, bronze);
      const next = players.map(p => p.id === playerId ? player : p);
      persistPlayers(next);
    } catch (e) {
      alert(String(e));
    }
  }

  function handleApplyInterest(playerId: string) {
    const player = players.find(p => p.id === playerId);
    if (!player) return;
    if (player.bankAccounts) player.bankAccounts.forEach(acc => G.applyInterestToAccount(acc));
    const next = players.map(p => p.id === playerId ? player : p);
    persistPlayers(next);
  }

  function handleDeleteNPC(id: string) {
    const copy = { ...npcs };
    delete copy[id];
    persistNPCs(copy);
  }

  function toggleNpcSelection(id: string) {
    setSelectedNpcs(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function runBatchTrain() {
    // simple training: for each selected npc, if trainingSchedule exists, increase stats by the schedule amount
    const copy = { ...npcs };
    Object.keys(selectedNpcs).forEach(id => {
      if (!selectedNpcs[id]) return;
      const npc = copy[id];
      if (!npc) return;
      if (npc.trainingSchedule) {
        npc.trainingSchedule.forEach(slot => {
          if (slot.targetSubstat) {
            if (!npc.substats) npc.substats = {};
            if (!npc.substats[slot.targetSubstat]) npc.substats[slot.targetSubstat] = { name: slot.targetSubstat, parents: ["STR" as any], value: 0 };
            npc.substats[slot.targetSubstat].value += slot.amount ?? 1;
          }
        });
      }
    });
    persistNPCs(copy);
    alert("Training applied to selected NPCs (if they had schedules)");
  }

  function handleScavenge() {
    const table = G.LOOT_TABLES[scavengeTable];
    if (!table) { alert("No table"); return; }
    const res = G.scavengeFromTable(table, qualityRoll, collectionRoll);
    setScavengeResult(res);
  }

  function handleSplit(shares: number) {
    if (!scavengeResult) return;
    const split = scavengeResult.split(shares);
    alert(`Per share: ${G.formatMoney(split.perShareBronze)}\nDistribution (bronze): ${split.distribution.join(", ")}`);
  }

  return (
    <div className="grimgar-ui">
      <h2>Grimgar — Bank & NPC UI</h2>
      <section className="panel">
        <h3>Players</h3>
        <div className="row">
          <input value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} placeholder="New player name" />
          <button onClick={handleCreatePlayer}>Create Player</button>
        </div>
        <ul className="list">
          {players.map(p => (
            <li key={p.id} className={p.id === selectedPlayerId ? "selected" : ""}>
              <div>
                <strong>{p.name}</strong> — Wallet: {G.formatMoney(p.walletBronze)}
              </div>
              <div className="actions">
                <button onClick={() => setSelectedPlayerId(p.id)}>Select</button>
                <button onClick={() => handleDeletePlayer(p.id)}>Delete</button>
                <button onClick={() => handleCreateBankAccount(p.id)}>Create Bank Account</button>
                <button onClick={() => handleApplyInterest(p.id)}>Apply Interest</button>
              </div>
              <div className="bank-list">
                {p.bankAccounts.map(acc => (
                  <div key={acc.id} className="bank-item">
                    <div>{acc.name ?? acc.id}: {G.formatMoney(acc.balanceBronze)} — {acc.interestRateAnnualPercent}%</div>
                    <div>
                      <button onClick={() => handleDeposit(p.id, acc.id, 1)}>Deposit 1 SC</button>
                      <button onClick={() => handleWithdraw(p.id, acc.id, 1)}>Withdraw 1 SC</button>
                    </div>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h3>NPCs</h3>
        <div className="npc-list">
          {Object.entries(npcs).map(([id, n]) => (
            <div key={id} className="npc-card">
              <label>
                <input type="checkbox" checked={!!selectedNpcs[id]} onChange={() => toggleNpcSelection(id)} />
                <strong>{n.name}</strong> ({n.title}) — {n.location}
              </label>
              <div>HP: {n.hp} AC: {n.ac}</div>
              <div>Inventory: {n.inventory.map(i => `${i.item} (${G.formatMoney(i.priceBronze)})`).join(", ")}</div>
              <div className="npc-actions">
                <button onClick={() => handleDeleteNPC(id)}>Delete NPC</button>
              </div>
            </div>
          ))}
        </div>
        <div>
          <button onClick={runBatchTrain}>Train Selected NPCs</button>
        </div>
      </section>

      <section className="panel">
        <h3>Scavenger</h3>
        <div>
          <label>Table:
            <select value={scavengeTable} onChange={e => setScavengeTable(e.target.value)}>
              {Object.keys(G.LOOT_TABLES).map(k => <option key={k} value={k}>{G.LOOT_TABLES[k].name}</option>)}
            </select>
          </label>
        </div>
        <div>
          <label>Quality roll: <input type="number" value={qualityRoll} step="0.1" onChange={e => setQualityRoll(Number(e.target.value))} /></label>
          <label>Collection roll: <input type="number" value={collectionRoll} step="0.1" onChange={e => setCollectionRoll(Number(e.target.value))} /></label>
          <button onClick={handleScavenge}>Scavenge</button>
        </div>
        {scavengeResult && (
          <div className="scavenge-results">
            <h4>Results ({G.formatMoney(scavengeResult.totalBronze)})</h4>
            <ul>
              {scavengeResult.obtained.map((o: any, idx: number) => (
                <li key={idx}>{o.quantity}× {o.item.name} — {G.formatMoney(o.totalValueBronze)}</li>
              ))}
            </ul>
            <div>
              <button onClick={() => handleSplit(6)}>Split 6 ways</button>
              <button onClick={() => handleSplit(5)}>Split 5 ways</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
