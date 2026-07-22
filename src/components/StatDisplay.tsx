import React from 'react';
import { Character, StatValue, SubStatValue } from '@/types';
import { TrendingUp, Edit2, X } from 'lucide-react';
import { useAppStore } from '@/store';

interface StatDisplayProps {
  character: Character;
}

export const StatDisplay: React.FC<StatDisplayProps> = ({ character }) => {
  const { updateCharacter } = useAppStore();
  const [editing, setEditing] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState<number>(0);
  const [editBank, setEditBank] = React.useState<number>(0);
  const [editMode, setEditMode] = React.useState<'value' | 'bank'>('value');

  const handleEditStat = (statName: string, currentValue: number, currentBank: number, mode: 'value' | 'bank') => {
    setEditing(statName);
    setEditValue(currentValue);
    setEditBank(currentBank);
    setEditMode(mode);
  };

  const handleSaveStat = (statName: string, isCore: boolean) => {
    const updatedChar = { ...character };
    
    if (isCore && statName in updatedChar.coreStats) {
      updatedChar.coreStats[statName as keyof typeof updatedChar.coreStats] = {
        value: editMode === 'value' ? editValue : editValue,
        carryBank: editMode === 'bank' ? editBank : editBank,
      };
    } else if (statName in updatedChar.subStats) {
      updatedChar.subStats[statName as keyof typeof updatedChar.subStats] = {
        ...updatedChar.subStats[statName as keyof typeof updatedChar.subStats],
        value: editMode === 'value' ? editValue : editValue,
        carryBank: editMode === 'bank' ? editBank : editBank,
      };
    } else {
      // Custom stat
      const customIndex = updatedChar.customSubStats.findIndex(s => s.name === statName);
      if (customIndex >= 0) {
        updatedChar.customSubStats[customIndex] = {
          ...updatedChar.customSubStats[customIndex],
          value: editMode === 'value' ? editValue : editValue,
          carryBank: editMode === 'bank' ? editBank : editBank,
        };
      }
    }

    updateCharacter(character.id, updatedChar);
    setEditing(null);
  };

  const renderStat = (name: string, stat: StatValue | SubStatValue, isSub: boolean = false, isCustom: boolean = false) => {
    const isEditing = editing === name;
    const isCore = !isSub && !isCustom;

    return (
      <div key={name} className="bg-slate-800 p-3 rounded border border-slate-700 hover:border-slate-600 transition">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold text-sm">{name}</span>
          <div className="flex gap-2">
            {!isEditing && (
              <>
                <button
                  onClick={() => handleEditStat(name, stat.value, stat.carryBank, 'value')}
                  className="text-blue-400 hover:text-blue-300 transition"
                  title="Edit value"
                >
                  <Edit2 size={14} />
                </button>
              </>
            )}
            {!isCore && !isSub && <TrendingUp size={14} className="text-green-400" />}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <div>
              <label className="text-xs text-slate-400">Value</label>
              <input
                type="number"
                min="0"
                value={editValue}
                onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Carry Bank</label>
              <input
                type="number"
                min="0"
                value={editBank}
                onChange={(e) => setEditBank(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleSaveStat(name, isCore)}
                className="flex-1 bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-sm"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(null)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-4 cursor-pointer">
            <div onClick={() => handleEditStat(name, stat.value, stat.carryBank, 'value')}>
              <p className="text-xs text-slate-400">Value</p>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
            <div onClick={() => handleEditStat(name, stat.value, stat.carryBank, 'bank')}>
              <p className="text-xs text-slate-400">Bank</p>
              <p className="text-lg font-bold text-yellow-400">{stat.carryBank}</p>
            </div>
          </div>
        )}
        
        {isSub && 'thresholdModifier' in stat && (
          <p className="text-xs text-slate-400 mt-2">
            Threshold Mod: {(stat as SubStatValue).thresholdModifier}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Core Stats */}
      <div>
        <h3 className="text-lg font-bold mb-3 text-blue-400">Core Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(character.coreStats).map(([name, stat]) => renderStat(name, stat, false, false))}
        </div>
      </div>

      {/* Sub Stats with Relationship Tree */}
      <div>
        <h3 className="text-lg font-bold mb-3 text-purple-400">Sub Stats</h3>
        <div className="space-y-4">
          {/* Show relationships */}
          <div className="bg-slate-900 p-3 rounded border border-slate-700 text-xs text-slate-300 space-y-2">
            <p className="font-semibold text-purple-300">Stat Relationships:</p>
            {Object.entries(character.subStats).map(([name, stat]) => (
              <div key={name} className="ml-2">
                <span className="text-slate-400">{(stat as SubStatValue).parents.join(', ')}</span>
                <span className="text-slate-500"> → </span>
                <span className="text-purple-300 font-semibold">{name}</span>
              </div>
            ))}
          </div>
          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(character.subStats).map(([name, stat]) => renderStat(name, stat, true, false))}
          </div>
        </div>
      </div>

      {/* Custom Sub Stats */}
      {character.customSubStats.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-3 text-green-400">Custom Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {character.customSubStats.map((stat) => renderStat(stat.name, stat, true, true))}
          </div>
        </div>
      )}
    </div>
  );
};
