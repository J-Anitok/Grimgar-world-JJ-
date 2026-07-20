import { create } from 'zustand';
import { AppState, Character } from '@/types';

const createDefaultCharacter = (name: string, type: 'player' | 'npc'): Character => ({
  id: Math.random().toString(36).substr(2, 9),
  name,
  type,
  image: 'https://via.placeholder.com/150',
  coreStats: {
    Strength: { value: 1, carryBank: 0 },
    Constitution: { value: 1, carryBank: 0 },
    Dexterity: { value: 1, carryBank: 0 },
    Intelligence: { value: 1, carryBank: 0 },
    Wisdom: { value: 1, carryBank: 0 },
    Charisma: { value: 1, carryBank: 0 },
  },
  subStats: {
    Guard: { value: 1, carryBank: 0, thresholdModifier: 1, parents: ['Constitution'] },
    Stamina: { value: 1, carryBank: 0, thresholdModifier: 1, parents: ['Constitution'] },
    Endurance: { value: 1, carryBank: 0, thresholdModifier: 1, parents: ['Constitution'] },
    Agility: { value: 1, carryBank: 0, thresholdModifier: 1, parents: ['Dexterity'] },
    Leadership: { value: 1, carryBank: 0, thresholdModifier: 1, parents: ['Charisma'] },
    'Pain Tolerance': { value: 1, carryBank: 0, thresholdModifier: 1, parents: ['Wisdom'] },
    'Mana Focus': { value: 1, carryBank: 0, thresholdModifier: 1, parents: ['Intelligence'] },
    'Mana Pool': { value: 1, carryBank: 0, thresholdModifier: 1, parents: ['Intelligence'] },
  },
  customSubStats: [],
  subStatGainCounts: {},
  statHistory: [],
});

interface AppStore extends AppState {
  addCharacter: (name: string, type: 'player' | 'npc') => void;
  deleteCharacter: (id: string) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  selectCharacter: (id: string | null) => void;
  setActiveTab: (tab: 'players' | 'npcs' | 'grimgar' | 'manager') => void;
  getSelectedCharacter: () => Character | undefined;
}

export const useAppStore = create<AppStore>((set, get) => ({
  characters: [],
  globalCustomSubStatDefinitions: [],
  selectedCharacterId: null,
  activeTab: 'players',
  undoStack: [],

  addCharacter: (name: string, type: 'player' | 'npc') => {
    const newCharacter = createDefaultCharacter(name, type);
    set((state) => ({
      characters: [...state.characters, newCharacter],
      selectedCharacterId: newCharacter.id,
    }));
  },

  deleteCharacter: (id: string) => {
    set((state) => ({
      characters: state.characters.filter((c) => c.id !== id),
      selectedCharacterId: state.selectedCharacterId === id ? null : state.selectedCharacterId,
    }));
  },

  updateCharacter: (id: string, updates: Partial<Character>) => {
    set((state) => ({
      characters: state.characters.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  },

  selectCharacter: (id: string | null) => {
    set({ selectedCharacterId: id });
  },

  setActiveTab: (tab: 'players' | 'npcs' | 'grimgar' | 'manager') => {
    set({ activeTab: tab });
  },

  getSelectedCharacter: () => {
    const state = get();
    return state.characters.find((c) => c.id === state.selectedCharacterId);
  },
}));
