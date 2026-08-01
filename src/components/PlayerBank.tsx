import React, { useState } from 'react'
import { Player, createPlayer, loadPlayersFromStorage, savePlayersToStorage, toBronze, fromBronze, formatMoney, BankAccount, depositToBank, withdrawFromBank, applyInterestToAccount } from '../../grimgar'

export default function PlayerBank() {
  const [players, setPlayers] = useState<Player[]>(() => loadPlayersFromStorage())
  const [newName, setNewName] = useState('')

  function persist(next: Player[]) {
    savePlayersToStorage(next)
    setPlayers(next)
  }

  function handleCreate() {
    if (!newName) return
    const id = newName.toLowerCase().replace(/\s+/g, '_')
    const p = createPlayer(id, newName, toBronze(5, 'SC'))
    const next = [...players, p]
    persist(next)
    setNewName('')
  }

  function addAccount(playerId: string) {
    const copy = players.map(p => ({ ...p }))
    const p = copy.find(x => x.id === playerId)!
    const acc: BankAccount = { id: 'acc_' + Date.now(), name: 'Savings', balanceBronze: 0, interestRateAnnualPercent: 2.5 }
    p.bankAccounts.push(acc)
    persist(copy)
  }

  function doDeposit(playerId: string, accId: string, amountSC: number) {
    const copy = players.map(p => ({ ...p }))
    const p = copy.find(x => x.id === playerId)!
    try {
      depositToBank(p, accId, toBronze(amountSC, 'SC'))
      persist(copy)
    } catch (e:any) { alert(e.message) }
  }

  function doWithdraw(playerId: string, accId: string, amountSC: number) {
    const copy = players.map(p => ({ ...p }))
    const p = copy.find(x => x.id === playerId)!
    try {
      withdrawFromBank(p, accId, toBronze(amountSC, 'SC'))
      persist(copy)
    } catch (e:any) { alert(e.message) }
  }

  function handleApplyInterest(playerId: string, accId: string) {
    const copy = players.map(p => ({ ...p }))
    const p = copy.find(x => x.id === playerId)!
    const acc = p.bankAccounts.find(a => a.id === accId)!
    applyInterestToAccount(acc)
    persist(copy)
  }

  return (
    <div style={{ border: '1px solid #ddd', padding: 12 }}>
      <h3>Players & Bank</h3>
      <div style={{ marginBottom: 8 }}>
        <input placeholder="player name" value={newName} onChange={e => setNewName(e.target.value)} />
        <button onClick={handleCreate}>Create Player</button>
      </div>

      {players.map(p => (
        <div key={p.id} style={{ borderTop: '1px solid #eee', paddingTop: 8, marginTop: 8 }}>
          <strong>{p.name}</strong> — Wallet: {formatMoney(p.walletBronze)}
          <div>
            <button onClick={() => { p.walletBronze += toBronze(1,'SC'); savePlayersToStorage(players); setPlayers(loadPlayersFromStorage()) }}>+1 SC to wallet</button>
            <button onClick={() => { p.walletBronze = Math.max(0, p.walletBronze - toBronze(1,'SC')); savePlayersToStorage(players); setPlayers(loadPlayersFromStorage()) }}>-1 SC from wallet</button>
          </div>
          <div style={{ marginTop: 8 }}>
            <button onClick={() => addAccount(p.id)}>Add account</button>
          </div>
          <div>
            {p.bankAccounts.map(acc => (
              <div key={acc.id} style={{ marginTop: 6, padding: 6, background: '#fafafa' }}>
                <div>{acc.name} — Balance: {formatMoney(acc.balanceBronze)} — APR: {acc.interestRateAnnualPercent}%</div>
                <div>
                  <button onClick={() => doDeposit(p.id, acc.id, 1)}>Deposit 1 SC</button>
                  <button onClick={() => doWithdraw(p.id, acc.id, 1)}>Withdraw 1 SC</button>
                  <button onClick={() => handleApplyInterest(p.id, acc.id)}>Apply interest</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
