import React, { useState } from 'react';
import { useAppStore } from '@/store';
import { CustomSubStat } from '@/types';
import { Plus, X } from 'lucide-react';

export const CustomStatCreator: React.FC = () => {
  const { getSelectedCharacter, updateCharacter } = useAppStore();
  const character = getSelectedCharacter();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [selectedParents, setSelectedParents] = useState<string[]>([]);
  const [thresholdModifier, setThresholdModifier] = useState(1);

  if (!character) return null;

  const availableParents = [
    ...Object.keys(character.coreStats),
    ...Object.keys(character.subStats),
  ];

  const handleAddStat = () => {
    if (!name.trim() || selectedParents.length === 0) {
      alert('Please enter a name and select at least one parent stat');
      return;
    }

    if (character.customSubStats.some(s => s.name === name)) {
      alert('A custom stat with this name already exists');
      return;
    }

    const newStat: CustomSubStat = {
      name,
      value: 1,
      carryBank: 0,
      thresholdModifier,
      parents: selectedParents,
    };

    const updatedChar = {
      ...character,
      customSubStats: [...character.customSubStats, newStat],
    };

    updateCharacter(character.id, updatedChar);
    setName('');
    setSelectedParents([]);
    setThresholdModifier(1);
    setIsOpen(false);
  };

  const handleRemoveStat = (statName: string) => {
    const updatedChar = {
      ...character,
      customSubStats: character.customSubStats.filter(s => s.name !== statName),
    };
    updateCharacter(character.id, updatedChar);
  };

  const toggleParent = (parentName: string) => {
    setSelectedParents(prev =>
      prev.includes(parentName)
        ? prev.filter(p => p !== parentName)
        : [...prev, parentName]
    );
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Plus size={20} /> Manage Custom Stats
        </h3>
      </div>

      {/* Existing Custom Stats */}
      {character.customSubStats.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-slate-400">Your Custom Stats:</p>
          {character.customSubStats.map(stat => (
            <div
              key={stat.name}
              className="flex justify-between items-center bg-slate-700 p-3 rounded"
            >
              <div>
                <p className="font-semibold">{stat.name}</p>
                <p className="text-xs text-slate-400">
                  Parents: {stat.parents.join(', ')}
                </p>
              </div>
              <button
                onClick={() => handleRemoveStat(stat.name)}
                className="text-red-400 hover:text-red-300 transition"
              >
                <X size={20} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create New Custom Stat */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold flex items-center justify-center gap-2 transition"
        >
          <Plus size={20} /> Add Custom Stat
        </button>
      ) : (
        <div className="bg-slate-700 p-4 rounded space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Stat Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Dodge, Perception"
              className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Parent Stats</label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableParents.map(parent => (
                <label key={parent} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedParents.includes(parent)}
                    onChange={() => toggleParent(parent)}
                    className="rounded"
                  />
                  <span className="text-sm">{parent}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Threshold Modifier</label>
            <input
              type="number"
              min="0"
              max="10"
              value={thresholdModifier}
              onChange={(e) => setThresholdModifier(parseInt(e.target.value) || 1)}
              className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white"
            />
            <p className="text-xs text-slate-400 mt-1">
              Multiplier for difficulty scaling (1 = standard)
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddStat}
              className="flex-1 bg-green-600 hover:bg-green-700 px-3 py-2 rounded font-semibold"
            >
              Create Stat
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 bg-slate-600 hover:bg-slate-500 px-3 py-2 rounded font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
