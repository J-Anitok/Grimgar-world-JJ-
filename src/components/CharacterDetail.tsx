import React from 'react';
import { useAppStore } from '@/store';
import { TrainingResult, StatHistoryEntry } from '@/types';
import { StatDisplay } from './StatDisplay';
import { TrainingPanel } from './TrainingPanel';
import { TrainingHistory } from './TrainingHistory';
import { Edit2 } from 'lucide-react';

export const CharacterDetail: React.FC = () => {
  const { getSelectedCharacter, updateCharacter } = useAppStore();
  const character = getSelectedCharacter();
  const [editing, setEditing] = React.useState(false);
  const [editName, setEditName] = React.useState('');

  if (!character) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p>Select a character to view details</p>
      </div>
    );
  }

  const handleNameChange = () => {
    if (editName.trim()) {
      updateCharacter(character.id, { name: editName });
      setEditing(false);
    }
  };

  const handleTraining = (result: TrainingResult) => {
    const historyEntry: StatHistoryEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      statName: result.statName,
      isCore: result.statName in character.coreStats,
      entryType: 'training',
      d20Roll: result.d20Roll,
      nDice: result.nDice,
      dieType: result.dieType,
      diceRolls: result.diceRolls,
      sumOfDice: result.sumOfDice,
      trainingMod: result.trainingMod,
      oldCarryBank: result.oldCarryBank,
      totalRoll: result.totalRoll,
      threshold: result.threshold,
      passed: result.passed,
      oldValue: result.totalRoll,
      newValue: result.newValue,
      newCarryBank: result.newCarryBank,
      rippleTriggered: result.rippleTriggered,
    };

    const updatedChar = { ...character };
    if (result.statName in updatedChar.coreStats) {
      updatedChar.coreStats[result.statName as keyof typeof updatedChar.coreStats] = {
        value: result.newValue,
        carryBank: result.newCarryBank,
      };
    } else if (result.statName in updatedChar.subStats) {
      updatedChar.subStats[result.statName as keyof typeof updatedChar.subStats] = {
        ...updatedChar.subStats[result.statName as keyof typeof updatedChar.subStats],
        value: result.newValue,
        carryBank: result.newCarryBank,
      };
    }

    updatedChar.statHistory = [...updatedChar.statHistory, historyEntry];
    updateCharacter(character.id, updatedChar);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-lg border border-slate-700">
        <div className="flex justify-between items-start mb-4">
          <div>
            {editing ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameChange()}
                  className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  autoFocus
                />
                <button
                  onClick={handleNameChange}
                  className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-bold">{character.name}</h2>
                <button
                  onClick={() => {
                    setEditName(character.name);
                    setEditing(true);
                  }}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <Edit2 size={20} />
                </button>
              </div>
            )}
          </div>
          <span className="bg-slate-700 px-3 py-1 rounded text-sm font-semibold capitalize">
            {character.type === 'player' ? '👤 Player' : '🎭 NPC'}
          </span>
        </div>
        <img
          src={character.image}
          alt={character.name}
          className="w-full h-48 object-cover rounded"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats and Training */}
        <div className="lg:col-span-2 space-y-6">
          <StatDisplay character={character} />
          <TrainingPanel character={character} onTraining={handleTraining} />
        </div>

        {/* History Sidebar */}
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 h-fit">
          <TrainingHistory character={character} />
        </div>
      </div>
    </div>
  );
};
