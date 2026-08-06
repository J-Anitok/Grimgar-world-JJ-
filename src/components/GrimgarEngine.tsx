import React, { useState } from 'react';
import { NPC_DATABASE, LOOT_TABLES, FIRST_NAMES, TRAITS, formatMoney } from '@/data/grimgar';
import { Users, Gift, Heart, DollarSign } from 'lucide-react';

type TabType = 'amnesiac' | 'npcs' | 'loot' | 'grief' | 'economy';

interface LootResult {
  name: string;
  value: number;
  currency: string;
  lore: string;
}

interface GriefResult {
  deadCount: number;
  duration: number;
}

export const GrimgarEngine: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('amnesiac');
  const [amnesiacData, setAmnesiacData] = useState<{ name: string; trait: string } | null>(null);
  const [selectedNPC, setSelectedNPC] = useState<string | null>(null);
  const [lootResults, setLootResults] = useState<LootResult[]>([]);
  const [selectedMonster, setSelectedMonster] = useState<string>('');
  const [griefData, setGriefData] = useState<GriefResult | null>(null);
  const [griefInput, setGriefInput] = useState('');

  const generateAmnesiac = () => {
    const name = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const trait = TRAITS[Math.floor(Math.random() * TRAITS.length)];
    setAmnesiacData({ name, trait });
  };

  const simulateLoot = () => {
    if (!selectedMonster) return;

    const lootTable = LOOT_TABLES[selectedMonster];
    const results: LootResult[] = [];
    let foundSomething = false;

    for (const item of lootTable.items) {
      if (Math.random() <= item.chance) {
        foundSomething = true;
        const value = Math.floor(Math.random() * (item.value_max - item.value_min + 1)) + item.value_min;
        results.push({
          name: item.name,
          value,
          currency: item.currency,
          lore: item.lore
        });
      }
    }

    if (!foundSomething) {
      results.push({
        name: 'Black Ash & Broken Wood',
        value: 0,
        currency: 'CC',
        lore: 'Scarcity Penalty Activated: The remains contain nothing but black ash and broken wood.'
      });
    }

    setLootResults(results);
  };

  const calculateGrief = () => {
    const count = parseInt(griefInput);
    if (isNaN(count) || count <= 0) return;

    const duration = Math.floor(Math.random() * 6 + 1) * count;
    setGriefData({ deadCount: count, duration });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-gray-900 p-6 rounded-lg border border-purple-700 text-center">
        <h2 className="text-3xl font-bold text-purple-300 mb-2">🏰 Grimgar Campaign Engine</h2>
        <p className="text-slate-300">Amnesiac Management & Frontier Economics</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveTab('amnesiac')}
          className={`px-4 py-2 rounded font-semibold transition flex items-center gap-2 ${
            activeTab === 'amnesiac'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Users size={18} /> Amnesiac
        </button>
        <button
          onClick={() => setActiveTab('npcs')}
          className={`px-4 py-2 rounded font-semibold transition flex items-center gap-2 ${
            activeTab === 'npcs'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Users size={18} /> NPC Registry
        </button>
        <button
          onClick={() => setActiveTab('loot')}
          className={`px-4 py-2 rounded font-semibold transition flex items-center gap-2 ${
            activeTab === 'loot'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Gift size={18} /> Loot Scavenge
        </button>
        <button
          onClick={() => setActiveTab('grief')}
          className={`px-4 py-2 rounded font-semibold transition flex items-center gap-2 ${
            activeTab === 'grief'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Heart size={18} /> Grief Cycle
        </button>
        <button
          onClick={() => setActiveTab('economy')}
          className={`px-4 py-2 rounded font-semibold transition flex items-center gap-2 ${
            activeTab === 'economy'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <DollarSign size={18} /> Economy
        </button>
      </div>

      {/* Content */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        {/* Amnesiac Tab */}
        {activeTab === 'amnesiac' && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-purple-300">Wake Up New Amnesiac</h3>
            <button
              onClick={generateAmnesiac}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-bold"
            >
              Generate Amnesiac
            </button>

            {amnesiacData && (
              <div className="bg-slate-900 p-6 rounded border-l-4 border-green-400 space-y-4">
                <div>
                  <p className="text-slate-400 text-sm">NAME RECALLED</p>
                  <p className="text-2xl font-bold text-green-300">{amnesiacData.name}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">INHERENT DISPOSITION</p>
                  <p className="text-lg text-slate-100">{amnesiacData.trait}</p>
                </div>
                <div className="bg-slate-800 p-4 rounded space-y-2">
                  <p className="font-bold text-slate-300">Initial Financial State:</p>
                  <p className="text-sm">• Britney's Basic Loan: <span className="text-yellow-300">+10 SC</span></p>
                  <p className="text-sm">• Mandatory Guild Enrollment: <span className="text-red-300">-8 SC</span></p>
                  <div className="border-t border-slate-600 pt-2 mt-2">
                    <p className="font-bold text-green-300">NET SURVIVAL ASSETS: 2 SC (20 CC)</p>
                  </div>
                </div>
                <div className="bg-red-900/30 border border-red-400 p-4 rounded">
                  <p className="text-red-200 text-sm">
                    ⚠️ Warning: Slum lodging and basic food costs 10 Copper Coins/night.
                    The recruit must slay a monster and sell its remains within 48 hours.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* NPC Registry Tab */}
        {activeTab === 'npcs' && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-purple-300">Human Region NPC Registry</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.keys(NPC_DATABASE).map((npcName) => (
                <button
                  key={npcName}
                  onClick={() => setSelectedNPC(npcName)}
                  className={`p-3 rounded text-left transition ${
                    selectedNPC === npcName
                      ? 'bg-purple-600 border-2 border-purple-400'
                      : 'bg-slate-700 border-2 border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <p className="font-bold">{npcName}</p>
                  <p className="text-xs text-slate-300">{NPC_DATABASE[npcName].title}</p>
                </button>
              ))}
            </div>

            {selectedNPC && (
              <div className="bg-slate-900 p-6 rounded border-l-4 border-purple-400 space-y-4">
                <div>
                  <p className="text-2xl font-bold">{selectedNPC}</p>
                  <p className="text-purple-300">{NPC_DATABASE[selectedNPC].title}</p>
                  <p className="text-slate-400 text-sm">📋 {NPC_DATABASE[selectedNPC].location}</p>
                </div>

                <p className="text-slate-100">{NPC_DATABASE[selectedNPC].description}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800 p-3 rounded">
                    <p className="text-slate-400 text-xs">COMBAT STATS</p>
                    <p>HP: <span className="text-red-400 font-bold">{NPC_DATABASE[selectedNPC].hp}</span></p>
                    <p>AC: <span className="text-blue-400 font-bold">{NPC_DATABASE[selectedNPC].ac}</span></p>
                  </div>
                  <div className="bg-slate-800 p-3 rounded">
                    <p className="text-slate-400 text-xs">ATTRIBUTES</p>
                    <div className="text-sm space-y-1">
                      {Object.entries(NPC_DATABASE[selectedNPC].stats).map(([stat, val]) => (
                        <div key={stat}>
                          {stat}: <span className="font-bold">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-slate-200 mb-2">📦 Wares & Equipment:</p>
                  <div className="space-y-2">
                    {NPC_DATABASE[selectedNPC].inventory.map((item, idx) => (
                      <div key={idx} className="bg-slate-800 p-3 rounded">
                        <p className="font-semibold text-green-300">{item.item}</p>
                        <p className="text-slate-400 text-sm">Price: {formatMoney(item.priceBronze)}</p>
                        <p className="text-slate-300 text-sm italic">📖 {item.lore}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loot Scavenge Tab */}
        {activeTab === 'loot' && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-purple-300">Monster Skirmish & Loot Scarcity</h3>
            <p className="text-slate-300">Select Target Monster Class to Loot:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(LOOT_TABLES).map(([key, table]) => (
                <button
                  key={key}
                  onClick={() => setSelectedMonster(key)}
                  className={`p-4 rounded text-left transition ${
                    selectedMonster === key
                      ? 'bg-green-600 border-2 border-green-400'
                      : 'bg-slate-700 border-2 border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <p className="font-bold">{table.name}</p>
                </button>
              ))}
            </div>

            {selectedMonster && (
              <>
                <button
                  onClick={simulateLoot}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-bold w-full"
                >
                  🔍 Search Monster Remains
                </button>

                {lootResults.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-green-300">Loot Found:</h4>
                    {lootResults.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded border-l-4 ${
                          item.value === 0
                            ? 'bg-yellow-900/30 border-yellow-400'
                            : 'bg-green-900/30 border-green-400'
                        }`}
                      >
                        <p className="font-bold">{item.name}</p>
                        <p className="text-sm text-slate-300">
                          Value: <span className="text-yellow-300 font-bold">{item.value} {item.currency}</span>
                        </p>
                        <p className="text-sm text-slate-400 italic">📖 {item.lore}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Grief Cycle Tab */}
        {activeTab === 'grief' && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-purple-300">The Psychological Cycle of Grief</h3>
            <p className="text-slate-300">
              In Grimgar, a teammate's death causes crippling grief, directly weakening the survivors' physical and mental capabilities.
            </p>

            <div className="space-y-2">
              <label className="block text-slate-300 font-semibold">Number of Fallen Party Members:</label>
              <input
                type="number"
                min="0"
                value={griefInput}
                onChange={(e) => setGriefInput(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
                placeholder="Enter number..."
              />
            </div>

            <button
              onClick={calculateGrief}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-bold w-full"
            >
              Calculate Grief Penalty
            </button>

            {griefData && (
              <div className="bg-red-900/30 border-l-4 border-red-400 p-6 rounded space-y-4">
                <div>
                  <p className="text-slate-400 text-sm">FALLEN MEMBERS</p>
                  <p className="text-2xl font-bold text-red-300">{griefData.deadCount}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">MOURNING DURATION</p>
                  <p className="text-2xl font-bold text-red-300">{griefData.duration} In-Game Days</p>
                </div>

                <div className="bg-slate-800 p-4 rounded space-y-2">
                  <p className="font-bold text-red-200">Active Penalties Applied to ALL Survivors:</p>
                  <ul className="space-y-1 text-sm text-slate-300">
                    <li>⚔️ Disadvantage on all Initiative rolls</li>
                    <li>🛡️ Disadvantage on all Saving Throws against fear and magical fatigue</li>
                    <li>✨ Healing spells restore only HALF the normal amount</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Economy Tab */}
        {activeTab === 'economy' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-purple-300">Frontier Economic Exchange Rates</h3>

            <div className="bg-slate-900 p-6 rounded border border-slate-600">
              <p className="text-lg font-bold text-yellow-300 mb-4">Currency Conversion:</p>
              <div className="space-y-2 text-slate-200">
                <p>1 <span className="text-yellow-400 font-bold">Gold Coin (GC)</span> = 10 <span className="text-slate-300 font-bold">Silver Coins (SC)</span></p>
                <p>1 <span className="text-slate-300 font-bold">Silver Coin (SC)</span> = 10 <span className="text-orange-400 font-bold">Copper Coins (CC)</span></p>
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded border border-slate-600">
              <p className="text-lg font-bold text-slate-200 mb-4">Typical Costs in West Town Slums:</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">🏨 1 Night in Trainee Lodging</span>
                  <span className="font-bold text-orange-400">10 CC</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">🍜 A bowl of hot Pit-Rat Stew</span>
                  <span className="font-bold text-orange-400">3 CC</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">🛡️ Master Hanz's Iron Shield</span>
                  <span className="font-bold text-slate-300">10 SC</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">⚔️ Standard Broadsword</span>
                  <span className="font-bold text-slate-300">15 SC</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
