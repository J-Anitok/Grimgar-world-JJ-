export interface NPCStats {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
}

export interface NPCItem {
  item: string;
  price: string;
  lore: string;
}

export interface NPC {
  title: string;
  location: string;
  description: string;
  hp: number;
  ac: number;
  stats: NPCStats;
  inventory: NPCItem[];
}

export interface LootItem {
  name: string;
  chance: number;
  value_min: number;
  value_max: number;
  currency: string;
  lore: string;
}

export interface LootTable {
  name: string;
  items: LootItem[];
}

export const NPC_DATABASE: Record<string, NPC> = {
  "Britney": {
    title: "Militia Registrar & Commander",
    location: "Central Office, Alterna",
    description: "Flamboyant and highly pragmatic. He registers new amnesiac arrivals and issues their initial survival loans.",
    hp: 52,
    ac: 14,
    stats: { STR: 11, DEX: 16, CON: 14, INT: 13, WIS: 12, CHA: 15 },
    inventory: [
      { item: "Polished Silver Dagger", price: "15 SC", lore: "A beautifully balanced weapon used for self-defense." },
      { item: "Volunteer Soldier Badge", price: "8 SC", lore: "The official license required to cash in monster bounties." }
    ]
  },
  "Barbara": {
    title: "Thieves' Guild Master Trainer",
    location: "West Town Slums, Alterna",
    description: "The notoriously sadistic and intense physical trainer of the Thieves' Guild.",
    hp: 90,
    ac: 17,
    stats: { STR: 12, DEX: 20, CON: 16, INT: 14, WIS: 14, CHA: 16 },
    inventory: [
      { item: "Serrated Stiletto", price: "25 SC", lore: "Designed specifically to slip between plate mail joints." },
      { item: "Climbing Harness", price: "5 SC", lore: "Reinforced leather straps with steel rings." }
    ]
  },
  "Master Hanz": {
    title: "Owner of Hanz's Heavy Ironworks",
    location: "West Town Slums, Alterna",
    description: "A gruff, heavily scarred dwarf blacksmith who crafts durable, non-ornate equipment.",
    hp: 45,
    ac: 15,
    stats: { STR: 16, DEX: 12, CON: 16, INT: 11, WIS: 13, CHA: 9 },
    inventory: [
      { item: "Standard Broadsword", price: "15 SC", lore: "Durable iron sword; standard issue for Warriors." },
      { item: "Iron-Rimmed Wooden Shield", price: "10 SC", lore: "Heavy ash wood with a cold-rolled iron rim." }
    ]
  }
};

export const LOOT_TABLES: Record<string, LootTable> = {
  "goblin_scavenger": {
    name: "Goblin Scavenger (Damuro Ruins)",
    items: [
      { name: "Dirty Goblin Pouch", chance: 0.50, value_min: 1, value_max: 8, currency: "CC", lore: "A small leather pouch containing dirty, worn copper coins." },
      { name: "Rusted Scrap Iron Dagger", chance: 0.30, value_min: 5, value_max: 5, currency: "CC", lore: "Can be sold to Master Hanz for raw material scrap value." },
      { name: "Coarse Salt Bag", chance: 0.15, value_min: 12, value_max: 12, currency: "CC", lore: "Highly valued by wilderness survivalists to preserve meat." }
    ]
  },
  "savage_kobold": {
    name: "Savage Kobold (Cyrene Mines)",
    items: [
      { name: "Small Iron Ore Chunk", chance: 0.40, value_min: 3, value_max: 10, currency: "CC", lore: "Raw mineral mined from the deep subterranean shafts." },
      { name: "Crude Leather Strips", chance: 0.35, value_min: 2, value_max: 6, currency: "CC", lore: "Scavenged binding material, useful for field repair." },
      { name: "Bioluminescent Moss Flask", chance: 0.15, value_min: 1, value_max: 2, currency: "SC", lore: "Faintly glowing moss. Provides 5 feet of dim light for 1 hour." }
    ]
  }
};

export const FIRST_NAMES = [
  "Haru", "Ranta", "Moguzo", "Yume", "Shihoru", "Mary", "Manato", "Kuzaku", "Choco", "Sassa"
];

export const TRAITS = [
  "Extremely hesitant", "Brash & impulsive", "Stoic & quiet", "Nervous yet observant", "Pragmatic", "Aloof"
];
