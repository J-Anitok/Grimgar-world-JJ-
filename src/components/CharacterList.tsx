import React from 'react';
import { useAppStore } from '@/store';
import { Trash2, Plus } from 'lucide-react';

interface CharacterListProps {
  type: 'player' | 'npc';
}

export const CharacterList: React.FC<CharacterListProps> = ({ type }) => {
  const { characters, selectedCharacterId, selectCharacter, deleteCharacter, addCharacter } = useAppStore();
  const filtered = characters.filter((c) => c.type === type);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold capitalize">{type === 'player' ? 'Player Characters' : 'NPCs'}</h2>
        <button
          onClick={() => {
            const name = prompt(`Enter ${type} character name:`);
            if (name) addCharacter(name, type);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus size={20} /> Add {type === 'player' ? 'Player' : 'NPC'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((character) => (
          <div
            key={character.id}
            onClick={() => selectCharacter(character.id)}
            className={`p-4 rounded-lg cursor-pointer transition ${
              selectedCharacterId === character.id
                ? 'bg-blue-600 border-2 border-blue-400'
                : 'bg-slate-800 border-2 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-lg">{character.name}</h3>
                <p className="text-sm text-slate-400">Level: {character.coreStats.Strength.value}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteCharacter(character.id);
                }}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <img
              src={character.image}
              alt={character.name}
              className="w-full h-32 object-cover rounded mb-2"
            />
            <div className="text-xs text-slate-400">
              <p>Stats recorded: {character.statHistory.length}</p>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <p>No {type === 'player' ? 'player characters' : 'NPCs'} yet. Create one to get started!</p>
        </div>
      )}
    </div>
  );
};
