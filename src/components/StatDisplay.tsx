import React from 'react';
import { Character, StatValue, SubStatValue } from '@/types';
import { TrendingUp } from 'lucide-react';

interface StatDisplayProps {
  character: Character;
}

export const StatDisplay: React.FC<StatDisplayProps> = ({ character }) => {
  const renderStat = (name: string, stat: StatValue | SubStatValue, isSub: boolean = false) => (
    <div key={name} className="bg-slate-800 p-3 rounded border border-slate-700 hover:border-slate-600 transition">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-sm">{name}</span>
        {!isSub && <TrendingUp size={14} className="text-green-400" />}
      </div>
      <div className="flex gap-4">
        <div>
          <p className="text-xs text-slate-400">Value</p>
          <p className="text-xl font-bold">{stat.value}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Bank</p>
          <p className="text-lg font-bold text-yellow-400">{stat.carryBank}</p>
        </div>
      </div>
      {isSub && 'thresholdModifier' in stat && (
        <p className="text-xs text-slate-400 mt-2">
          Threshold Mod: {(stat as SubStatValue).thresholdModifier}
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Core Stats */}
      <div>
        <h3 className="text-lg font-bold mb-3 text-blue-400">Core Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(character.coreStats).map(([name, stat]) => renderStat(name, stat, false))}
        </div>
      </div>

      {/* Sub Stats */}
      <div>
        <h3 className="text-lg font-bold mb-3 text-purple-400">Sub Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(character.subStats).map(([name, stat]) => renderStat(name, stat, true))}
        </div>
      </div>

      {/* Custom Sub Stats */}
      {character.customSubStats.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-3 text-green-400">Custom Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {character.customSubStats.map((stat) => renderStat(stat.name, stat, true))}
          </div>
        </div>
      )}
    </div>
  );
};
