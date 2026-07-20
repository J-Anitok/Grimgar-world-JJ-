export interface StatValue {
  value: number;
  carryBank: number;
}

export interface SubStatValue extends StatValue {
  thresholdModifier: number;
  parents: string[];
  rippleParentOverride?: string;
}

export interface CustomSubStat extends SubStatValue {
  name: string;
}

export interface Character {
  id: string;
  name: string;
  type: "player" | "npc";
  image: string;
  coreStats: {
    Strength: StatValue;
    Constitution: StatValue;
    Dexterity: StatValue;
    Intelligence: StatValue;
    Wisdom: StatValue;
    Charisma: StatValue;
  };
  subStats: {
    Guard: SubStatValue;
    Stamina: SubStatValue;
    Endurance: SubStatValue;
    Agility: SubStatValue;
    Leadership: SubStatValue;
    "Pain Tolerance": SubStatValue;
    "Mana Focus": SubStatValue;
    "Mana Pool": SubStatValue;
  };
  customSubStats: CustomSubStat[];
  subStatGainCounts: Record<string, number>;
  statHistory: StatHistoryEntry[];
}

export interface GlobalCustomSubStatDef {
  name: string;
  parents: string[];
}

export interface UndoSnapshot {
  charId: string;
  snapshot: Character;
}

export interface AppState {
  characters: Character[];
  globalCustomSubStatDefinitions: GlobalCustomSubStatDef[];
  selectedCharacterId: string | null;
  activeTab: "players" | "npcs" | "grimgar" | "manager";
  undoStack: UndoSnapshot[];
}

export type DieType = 4 | 6 | 8;

export type HistoryEntryType = "training" | "manual_edit" | "ripple_bonus" | "routine_summary";

export interface StatHistoryEntry {
  id: string;
  timestamp: number;
  statName: string;
  isCore: boolean;
  entryType: HistoryEntryType;
  d20Roll?: number;
  nDice?: number;
  dieType?: DieType;
  diceRolls?: number[];
  sumOfDice?: number;
  trainingMod?: number;
  oldCarryBank?: number;
  totalRoll?: number;
  threshold?: number;
  passed?: boolean;
  oldValue?: number;
  newValue?: number;
  newCarryBank?: number;
  rippleTriggered?: boolean;
  rippleParent?: string;
  editedFrom?: number;
  editedTo?: number;
  bankFrom?: number;
  bankTo?: number;
  fromSubStat?: string;
  routineIterations?: number;
  routineLevelsGained?: number;
  routineFinalValue?: number;
  routineFinalBank?: number;
  routineRippleCount?: number;
  routineDieType?: DieType;
}

export interface TrainingResult {
  statName: string;
  d20Roll: number;
  nDice: number;
  dieType: DieType;
  diceRolls: number[];
  sumOfDice: number;
  trainingMod: number;
  oldCarryBank: number;
  totalRoll: number;
  threshold: number;
  passed: boolean;
  newValue: number;
  newCarryBank: number;
  rippleTriggered: boolean;
  rippleParent?: string;
}
