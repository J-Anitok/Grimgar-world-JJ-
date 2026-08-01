(function(){
  // Minimal demo data (subset of grimgar.ts data)
  const NPCS = {
    britney: { id: 'britney', name: 'Britney', title: 'Militia Registrar & Commander', location: 'Central Office, Alterna', hp: 52, ac: 14 },
    barbara: { id: 'barbara', name: 'Barbara', title: "Thieves' Guild Master Trainer", location: 'West Town Slums, Alterna', hp: 90, ac: 17 },
    master_hanz: { id: 'master_hanz', name: 'Master Hanz', title: "Owner of Hanz's Heavy Ironworks", location: 'West Town Slums, Alterna', hp: 45, ac: 15 }
  }

  const LOOT_TABLES = {
    goblin_scavenger: {
      name: 'Goblin Scavenger (Damuro Ruins)',
      items: [
        { name: 'Dirty Goblin Pouch', chance: 0.5, value_min: 1, value_max: 8, currency: 'BRZ', lore: '' },
        { name: 'Rusted Scrap Iron Dagger', chance: 0.3, value_min: 5, value_max: 5, currency: 'BRZ', lore: '' },
        { name: 'Coarse Salt Bag', chance: 0.15, value_min: 12, value_max: 12, currency: 'BRZ', lore: '' }
      ]
    }
  }

  function formatMoney(bronze){
    const GC = 100*100;
    const SC = 100;
    const gold = Math.floor(bronze/GC);
    const rem = bronze % GC;
    const silver = Math.floor(rem/SC);
    const bronzeLeft = rem % SC;
    const parts = [];
    if (gold) parts.push(gold+' GC');
    if (silver) parts.push(silver+' SC');
    if (bronzeLeft || parts.length===0) parts.push(bronzeLeft+' BRZ');
    return parts.join(' ');
  }

  function scavengeFromTable(table, quality=1, collection=1){
    const obtained = [];
    for(const li of table.items){
      let qty = 0;
      for(let attempt=0; attempt<Math.max(1, Math.round(collection)); attempt++){
        if (Math.random() < li.chance) qty++;
      }
      if (qty>0){
        const rawVal = Math.round(((li.value_min + (Math.random()*(li.value_max - li.value_min))) * quality));
        const totalBronze = rawVal * qty; // assume BRZ base
        obtained.push({ item: li, qty, totalBronze });
      }
    }
    const totalBronze = obtained.reduce((s,i) => s + i.totalBronze, 0);
    return { obtained, totalBronze, split: (shares)=>{
      const per = Math.floor(totalBronze/shares);
      const dist = Array(shares).fill(per);
      let rem = totalBronze - per*shares; let i=0; while(rem>0){ dist[i%shares]++; rem--; i++; }
      return { perShareBronze: per, distribution: dist };
    } }
  }

  function renderNPCs(){
    const el = document.getElementById('npc-list');
    el.innerHTML = '';
    Object.keys(NPCS).forEach(k => {
      const n = NPCS[k];
      const div = document.createElement('div');
      div.className = 'item';
      div.innerHTML = `<strong>${n.name}</strong> — ${n.title} @ ${n.location}<div>HP:${n.hp} AC:${n.ac}</div>`;
      const del = document.createElement('button'); del.textContent='Delete';
      del.onclick = ()=>{ delete NPCS[k]; renderNPCs(); };
      div.appendChild(del);
      el.appendChild(div);
    })
  }

  document.getElementById('reset').addEventListener('click', ()=>{ location.reload(); })
  document.getElementById('roll').addEventListener('click', ()=>{
    const quality = parseFloat(document.getElementById('quality').value)||1
    const collection = parseInt(document.getElementById('collection').value)||1
    const res = scavengeFromTable(LOOT_TABLES.goblin_scavenger, quality, collection)
    const out = document.getElementById('roll-out')
    out.textContent = 'Total: '+formatMoney(res.totalBronze)+'\n' + JSON.stringify(res.obtained.map(o=>({ name: o.item.name, qty: o.qty, total: formatMoney(o.totalBronze)})), null, 2)
  })

  renderNPCs()
})();
