import React from 'react';
import { Character, StatHistoryEntry } from '@/types';
import { History, Trash2 } from 'lucide-react';

interface TrainingHistoryProps {
  character: Character;
  onDeleteEntry?: (entryId: string) => void;
}

export const TrainingHistory: React.FC<TrainingHistoryProps> = ({ character, onDeleteEntry }) => {
  const sortedHistory = [...character.statHistory].sort(
    (a, b) => b.timestamp - a.timestamp
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getEntryColor = (entryType: string) => {
    switch (entryType) {
      case 'training':
        return 'border-blue-400 bg-blue-900/30';
      case 'manual_edit':
        return 'border-purple-400 bg-purple-900/30';
      case 'ripple_bonus':
        return 'border-green-400 bg-green-900/30';
      case 'routine_summary':
        return 'border-orange-400 bg-orange-900/30';
      default:
        return 'border-slate-400 bg-slate-900/30';
    }
  };

  const renderEntryDetails = (entry: StatHistoryEntry) => {
    switch (entry.entryType) {
      case 'training':
        return (
          <div className="text-xs space-y-1">
            <p>Roll: {entry.d20Roll} | Dice: {entry.diceRolls?.join(', ')}</p>
            <p>Total: {entry.totalRoll} vs Threshold: {entry.threshold}</p>
            <p className={entry.passed ? 'text-green-300' : 'text-yellow-300'}>
              {entry.passed ? '✓ Passed' : '○ Failed'} | {entry.oldValue} → {entry.newValue}
            </p>
          </div>
        );
      case 'manual_edit':
        return (
          <div className="text-xs space-y-1">
            <p>Value: {entry.editedFrom} → {entry.editedTo}</p>
            <p>Bank: {entry.bankFrom} → {entry.bankTo}</p>
          </div>
        );
      case 'ripple_bonus':
        return (
          <div className="text-xs">
            <p>From: {entry.fromSubStat}</p>
          </div>
        );
      case 'routine_summary':
        return (
          <div className="text-xs space-y-1">
            <p>Iterations: {entry.routineIterations}</p>
            <p>Levels: +{entry.routineLevelsGained}</p>
            <p>Final: {entry.routineFinalValue} (Bank: {entry.routineFinalBank})</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <History size={20} /> Training History
      </h3>

      {sortedHistory.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <p>No training history yet</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {sortedHistory.map((entry) => (
            <div
              key={entry.id}
              className={`p-3 rounded border-l-4 ${getEntryColor(entry.entryType)}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold">
                    {entry.statName} ({entry.entryType.replace('_', ' ')})
                  </p>
                  <p className="text-xs text-slate-400">{formatDate(entry.timestamp)}</p>
                </div>
                {onDeleteEntry && (
                  <button
                    onClick={() => onDeleteEntry(entry.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              {renderEntryDetails(entry)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
