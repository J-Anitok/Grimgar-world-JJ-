import React, { useState } from 'react';
import { Character, DieType, TrainingResult } from '@/types';
import { Dice6 } from 'lucide-react';

interface TrainingPanelProps {
  character: Character;
  onTraining: (result: TrainingResult) => void;
}

const rollDice = (count: number, sides: DieType): number[] => {
  return Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
};

export const TrainingPanel: React.FC<TrainingPanelProps> = ({ character, onTraining }) => {
  const [selectedStat, setSelectedStat] = useState<string>('Strength');
  const [nDice, setNDice] = useState(2);
  const [dieType, setDieType] = useState<DieType>(6);
  const [trainingMod, setTrainingMod] = useState(0);
  const [lastResult, setLastResult] = useState<TrainingResult | null>(null);

  const allStats = {
    ...Object.entries(character.coreStats).reduce(
      (acc, [name, stat]) => ({ ...acc, [name]: { ...stat, type: 'core' as const } }),
      {}
    ),
    ...Object.entries(character.subStats).reduce(
      (acc, [name, stat]) => ({ ...acc, [name]: { ...stat, type: 'sub' as const } }),
      {}
    ),
  };

  const handleTrain = () => {
    const d20Roll = Math.floor(Math.random() * 20) + 1;
    const diceRolls = rollDice(nDice, dieType);
    const sumOfDice = diceRolls.reduce((a, b) => a + b, 0);
    const totalRoll = sumOfDice + trainingMod;

    const stat = character.coreStats[selectedStat as keyof typeof character.coreStats] ||
                 character.subStats[selectedStat as keyof typeof character.subStats];
    
    if (!stat) return;

    const threshold = 10 + (stat.value - 1) * 3;
    const passed = totalRoll >= threshold;

    const result: TrainingResult = {
      statName: selectedStat,
      d20Roll,
      nDice,
      dieType,
      diceRolls,
      sumOfDice,
      trainingMod,
      oldCarryBank: stat.carryBank,
      totalRoll,
      threshold,
      passed,
      newValue: passed ? stat.value + 1 : stat.value,
      newCarryBank: passed ? stat.carryBank : stat.carryBank + sumOfDice,
      rippleTriggered: false,
    };

    setLastResult(result);
    onTraining(result);
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 space-y-4">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <Dice6 size={20} /> Training Roll
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Stat</label>
          <select
            value={selectedStat}
            onChange={(e) => setSelectedStat(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
          >
            {Object.keys(allStats).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Number of Dice</label>
          <input
            type="number"
            min="1"
            max="10"
            value={nDice}
            onChange={(e) => setNDice(parseInt(e.target.value))}
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Die Type</label>
          <select
            value={dieType}
            onChange={(e) => setDieType(parseInt(e.target.value) as DieType)}
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
          >
            <option value={4}>D4</option>
            <option value={6}>D6</option>
            <option value={8}>D8</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Training Modifier</label>
          <input
            type="number"
            value={trainingMod}
            onChange={(e) => setTrainingMod(parseInt(e.target.value) || 0)}
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
          />
        </div>
      </div>

      <button
        onClick={handleTrain}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Roll Training
      </button>

      {lastResult && (
        <div className={`p-4 rounded border-l-4 ${
          lastResult.passed
            ? 'bg-green-900 border-green-400 text-green-100'
            : 'bg-yellow-900 border-yellow-400 text-yellow-100'
        }`}>
          <h4 className="font-bold mb-2">{lastResult.passed ? '✓ Success!' : '○ No Gain'}</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>D20 Roll: {lastResult.d20Roll}</div>
            <div>Dice: {lastResult.diceRolls.join(', ')}</div>
            <div>Total: {lastResult.totalRoll}</div>
            <div>Threshold: {lastResult.threshold}</div>
            <div>New Value: {lastResult.newValue}</div>
            <div>New Bank: {lastResult.newCarryBank}</div>
          </div>
        </div>
      )}
    </div>
  );
};
