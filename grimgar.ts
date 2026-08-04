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
  price: string; // human readable price like "15 SC" or use currency helper to compute
  lore: string;
}

export interface SubStat {
  name: string;
  parents: (keyof NPCStats)[]; // parent main stats
  value: number; // current substat value
  // optional manual threshold override (in bronze-equivalent units of threshold calculation)
  thresholdOverride?: number;
}

export interface NPC {
  id: string; // unique id for persistence
  title: string;
  name?: string; // optional display name
  location: string;
  description: string;
  hp: number;
  ac: number;
  stats: NPCStats;
  substats?: Record<string, SubStat>;
  inventory: NPCItem[];
  level?: number;
  xp?: number;
  trainingSchedule?: TrainingSlot[];
}

export interface LootItem {
  name: string;
  chance: number;
  value_min: number;
  value_max: number;
  currency: string; // "BC" (bronze coin), "SC" (silver coin), "GC" (gold coin). We'll use short codes below.
  lore: string;
}

export interface LootTable {
  name: string;
  items: LootItem[];
}

export interface TrainingSlot {
  id?: string;
  day?: string | number; // abstract schedule key (e.g., "Mon", or day index)
  activity: string; // description
  targetSubstat?: string; // which substat it trains
  amount?: number; // how many points per "train" action
}

export interface BankAccount {
  balanceBronze: number; // store everything in bronze internally
  interestRateAnnualPercent: number; // e.g., 5 for 5% annual
  lastInterestApplied?: string; // ISO date
}

export interface Player {
  id: string;
  name: string;
  balanceBronze: number; // liquid money
  bank?: BankAccount;
}

// ----- Economy constants & helpers -----
export const BRONZE_PER_SILVER = 100; // 1 silver = 100 bronze
export const SILVER_PER_GOLD = 100; // 1 gold = 100 silver
export const BRONZE_PER_GOLD = SILVER_PER_GOLD * BRONZE_PER_SILVER; // 10_000

export function coinsToBronze({ gold = 0, silver = 0, bronze = 0 }: { gold?: number; silver?: number; bronze?: number; }): number {
  return Math.round((gold * BRONZE_PER_GOLD) + (silver * BRONZE_PER_SILVER) + bronze);
}

export function bronzeToCoins(totalBronze: number) {
  const gold = Math.floor(totalBronze / BRONZE_PER_GOLD);
  const remAfterGold = totalBronze - gold * BRONZE_PER_GOLD;
  const silver = Math.floor(remAfterGold / BRONZE_PER_SILVER);
  const bronze = remAfterGold - silver * BRONZE_PER_SILVER;
  return { gold, silver, bronze };
}

// Parse a human readable price like "15 SC" into bronze integer. Accepts formats: "15 SC", "3 GC", "10 BC"
export function parsePriceToBronze(price: string): number {
  const parts = price.trim().split(/\s+/);
  if (parts.length !== 2) return 0;
  const amount = Number(parts[0]);
  const unit = parts[1].toUpperCase();
  if (isNaN(amount)) return 0;
  if (unit === "BC" || unit === "BR" || unit === "BRONZE" || unit === "CC") return coinsToBronze({ bronze: amount });
  if (unit === "SC" || unit === "SL" || unit === "SILVER") return coinsToBronze({ silver: amount });
  if (unit === "GC" || unit === "GOLD") return coinsToBronze({ gold: amount });
  return 0;
}

// ----- Persistence (browser localStorage) -----
const STORAGE_PREFIX = "grimgar_world_v1"; // change version to invalidate
const NPCS_KEY = `${STORAGE_PREFIX}:npcs`;
const PLAYERS_KEY = `${STORAGE_PREFIX}:players`;

export function saveNPC(npc: NPC) {
  const all = loadAllNPCs();
  all[npc.id] = npc;
  localStorage.setItem(NPCS_KEY, JSON.stringify(all));
}

export function deleteNPC(npcId: string) {
  const all = loadAllNPCs();
  delete all[npcId];
  localStorage.setItem(NPCS_KEY, JSON.stringify(all));
}

export function loadAllNPCs(): Record<string, NPC> {
  try {
    const raw = localStorage.getItem(NPCS_KEY);
    if (!raw) return { ...NPC_DATABASE } as Record<string, NPC>;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed loading NPCs from storage", e);
    return { ...NPC_DATABASE } as Record<string, NPC>;
  }
}

export function savePlayer(player: Player) {
  const all = loadAllPlayers();
  all[player.id] = player;
  localStorage.setItem(PLAYERS_KEY, JSON.stringify(all));
}

export function deletePlayer(playerId: string) {
  const all = loadAllPlayers();
  delete all[playerId];
  localStorage.setItem(PLAYERS_KEY, JSON.stringify(all));
}

export function loadAllPlayers(): Record<string, Player> {
  try {
    const raw = localStorage.getItem(PLAYERS_KEY);
    if (!raw) return {}; // no default players
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed loading players from storage", e);
    return {};
  }
}

// Bank: apply interest based on elapsed days (simple interest per day approximation)
export function applyBankInterest(player: Player, asOfDate = new Date()) {
  if (!player.bank) return player;
  const account = player.bank;
  const last = account.lastInterestApplied ? new Date(account.lastInterestApplied) : null;
  const now = asOfDate;
  if (!last) {
    account.lastInterestApplied = now.toISOString();
    return player;
  }
  const msPerDay = 1000 * 60 * 60 * 24;
  const days = Math.floor((now.getTime() - last.getTime()) / msPerDay);
  if (days <= 0) return player;
  // simple daily compounding using annual percent -> daily rate
  const dailyRate = (account.interestRateAnnualPercent / 100) / 365;
  // compound per-day to avoid large inaccuracies
  const newBalance = Math.floor(account.balanceBronze * Math.pow(1 + dailyRate, days));
  account.balanceBronze = newBalance;
  account.lastInterestApplied = now.toISOString();
  player.bank = account;
  savePlayer(player);
  return player;
}

// ----- Stat & Substat threshold logic -----
// Rules implemented:
// - Substats with 1 parent start at 5. Their "levels" are: 5, 15, 25, ... (start + n*10). Threshold for next tier is nextLevel*4.
// - Substats with 2 (or more) parents start at 10. Their "levels" are: 10, 20, 30, ... Threshold = nextLevel*4.
// - You can override threshold manually on a SubStat by setting thresholdOverride.

export function computeNextThresholdForSubstat(sub: SubStat): number {
  if (sub.thresholdOverride !== undefined) return sub.thresholdOverride;
  const parentsCount = sub.parents.length;
  const start = parentsCount <= 1 ? 5 : 10;
  const step = 10;
  let nextLevel = start;
  while (nextLevel <= sub.value) nextLevel += step;
  return nextLevel * 4;
}

export function setSubstatThresholdOverride(sub: SubStat, overrideValue: number) {
  sub.thresholdOverride = overrideValue;
}

// ----- Ripple logic -----
export interface RippleConfig {
  // positive or negative ripple amount to distribute
  amount: number;
  // if coreRipple is true, propagate from a main stat to a substat; otherwise from substat to parents
  coreRipple?: boolean;
  // optional: custom distribution function (defaults to equal split among parents)
}

// Apply ripple from a substat to its main stat parents (default equal split). Returns updated main stat deltas.
export function applyRippleToParents(sub: SubStat, config: RippleConfig, npc: NPC) {
  const parents = sub.parents;
  if (!parents || parents.length === 0) return;
  const perParent = config.amount / parents.length;
  parents.forEach((p) => {
    (npc.stats[p] as number) += perParent;
  });
}

// Apply core ripple from a main stat to a substat. If the substat has multiple parents and coreRipple true, the ripple
// can be applied to all matching substats or only one depending on implementation choice. We'll apply to the provided substat.
export function applyCoreRippleToSubstat(mainStatKey: keyof NPCStats, amount: number, sub: SubStat, npc: NPC) {
  // If the substat lists the main stat as parent, increase the substat value
  if (sub.parents.includes(mainStatKey)) {
    sub.value += amount;
  }
}

// ----- Training utilities -----
// Train a single NPC for one training slot (applies amount to the target substat)
export function performTraining(npc: NPC, slot: TrainingSlot) {
  if (!slot.targetSubstat) return npc;
  const subName = slot.targetSubstat;
  if (!npc.substats) npc.substats = {};
  if (!npc.substats[subName]) {
    // create a default substat: infer parents by convention (e.g., map from name or default to STR)
    npc.substats[subName] = { name: subName, parents: ["STR"], value: 0 } as SubStat;
  }
  const sub = npc.substats[subName];
  const amount = slot.amount ?? 1;
  sub.value += amount;
  return npc;
}

// Train multiple NPCs by ids using their schedules. This will iterate each NPC, and for each schedule slot apply training.
export function trainSelectedNPCs(npcIds: string[]) {
  const all = loadAllNPCs();
  npcIds.forEach((id) => {
    const npc = all[id];
    if (!npc) return;
    if (!npc.trainingSchedule) return;
    npc.trainingSchedule.forEach((slot) => performTraining(npc, slot));
    saveNPC(npc);
  });
}

// ----- Scavenger / Loot rolling -----
// Quality roll determines how high up the loot table to sample (0..1) where a higher roll favors rarer/higher-value items.
export function rollQuality(random = Math.random): number {
  // use a biased distribution if you want (exponential) but default uniform
  return random();
}

// Collection roll determines how effectively the scavenger collects; returns a multiplier for number/quality
export function rollCollection(random = Math.random): number {
  // return 0.5..1.5 multiplier roughly
  return 0.5 + random();
}

// Generate loot for a given LootTable and two rolls (qualityRoll & collectionRoll). Returns itemized loot and total value in bronze.
export function generateScavengeLoot(table: LootTable, qualityRoll = rollQuality(), collectionRoll = rollCollection(), random = Math.random) {
  const results: { item: LootItem; qty: number; unitValueBronze: number; totalBronze: number }[] = [];
  table.items.forEach((li) => {
    // decide if this item appears based on its chance scaled by qualityRoll
    const effectiveChance = li.chance * (0.5 + qualityRoll / 2); // qualityRoll skews chance between 0.5x and 1x
    if (random() <= effectiveChance) {
      // determine quantity based on collectionRoll and the value range
      const qtyMultiplier = collectionRoll;
      // qty: 1 for common items, or floor(random * multiplier * 2) as sample
      const qty = Math.max(1, Math.floor(qtyMultiplier * (1 + Math.floor(random() * 2))));
      // choose a random value between min/max
      const unitValue = li.value_min + Math.floor(random() * (li.value_max - li.value_min + 1));
      const unitBronze = parsePriceToBronze(`${unitValue} ${li.currency}`);
      const total = unitBronze * qty;
      results.push({ item: li, qty, unitValueBronze: unitBronze, totalBronze: total });
    }
  });
  const grandTotal = results.reduce((s, r) => s + r.totalBronze, 0);
  return { results, grandTotal };
}

// Split a bronze value across N people, returning an array of objects with exact coin breakdown for each share
export function splitLoot(totalBronze: number, people: number) {
  if (people <= 0) throw new Error("people must be >= 1");
  const baseShare = Math.floor(totalBronze / people);
  const remainder = totalBronze - baseShare * people;
  const shares: { bronze: number; coins: { gold: number; silver: number; bronze: number } }[] = [];
  for (let i = 0; i < people; i++) {
    const shareBronze = baseShare + (i < remainder ? 1 : 0);
    shares.push({ bronze: shareBronze, coins: bronzeToCoins(shareBronze) });
  }
  return shares;
}

// ----- Example data upgraded from original -----
export const NPC_DATABASE: Record<string, NPC> = {
  "Britney": {
    id: "britney-01",
    title: "Militia Registrar & Commander",
    name: "Britney",
    location: "Central Office, Alterna",
    description: "Flamboyant and highly pragmatic. He registers new amnesiac arrivals and issues their initial survival loans.",
    hp: 52,
    ac: 14,
    stats: { STR: 11, DEX: 16, CON: 14, INT: 13, WIS: 12, CHA: 15 },
    substats: {
      "Leadership": { name: "Leadership", parents: ["CHA", "WIS"], value: 10 }
    },
    inventory: [
      { item: "Polished Silver Dagger", price: "15 SC", lore: "A beautifully balanced weapon used for self-defense." },
      { item: "Volunteer Soldier Badge", price: "8 SC", lore: "The official license required to cash in monster bounties." }
    ],
    level: 4,
    xp: 230,
    trainingSchedule: [
      { id: "t1", day: "Mon", activity: "Tactics", targetSubstat: "Leadership", amount: 1 }
    ]
  },
  "Barbara": {
    id: "barbara-01",
    title: "Thieves' Guild Master Trainer",
    name: "Barbara",
    location: "West Town Slums, Alterna",
    description: "The notoriously sadistic and intense physical trainer of the Thieves' Guild.",
    hp: 90,
    ac: 17,
    stats: { STR: 12, DEX: 20, CON: 16, INT: 14, WIS: 14, CHA: 16 },
    substats: {
      "Stealth": { name: "Stealth", parents: ["DEX"], value: 15 }
    },
    inventory: [
      { item: "Serrated Stiletto", price: "25 SC", lore: "Designed specifically to slip between plate mail joints." },
      { item: "Climbing Harness", price: "5 SC", lore: "Reinforced leather straps with steel rings." }
    ],
    level: 7,
    xp: 980,
    trainingSchedule: [
      { id: "t2", day: "Tue", activity: "Climbing drills", targetSubstat: "Stealth", amount: 2 }
    ]
  },
  "Master Hanz": {
    id: "hanz-01",
    title: "Owner of Hanz's Heavy Ironworks",
    name: "Master Hanz",
    location: "West Town Slums, Alterna",
    description: "A gruff, heavily scarred dwarf blacksmith who crafts durable, non-ornate equipment.",
    hp: 45,
    ac: 15,
    stats: { STR: 16, DEX: 12, CON: 16, INT: 11, WIS: 13, CHA: 9 },
    substats: {
      "Smithing": { name: "Smithing", parents: ["STR", "CON"], value: 12 }
    },
    inventory: [
      { item: "Standard Broadsword", price: "15 SC", lore: "Durable iron sword; standard issue for Warriors." },
      { item: "Iron-Rimmed Wooden Shield", price: "10 SC", lore: "Heavy ash wood with a cold-rolled iron rim." }
    ],
    level: 3,
    xp: 120,
    trainingSchedule: [
      { id: "t3", day: "Wed", activity: "Forging practice", targetSubstat: "Smithing", amount: 1 }
    ]
  }
};

export const LOOT_TABLES: Record<string, LootTable> = {
  "goblin_scavenger": {
    name: "Goblin Scavenger (Damuro Ruins)",
    items: [
      { name: "Dirty Goblin Pouch", chance: 0.50, value_min: 1, value_max: 8, currency: "BC", lore: "A small leather pouch containing dirty, worn copper coins." },
      { name: "Rusted Scrap Iron Dagger", chance: 0.30, value_min: 5, value_max: 5, currency: "BC", lore: "Can be sold to Master Hanz for raw material scrap value." },
      { name: "Coarse Salt Bag", chance: 0.15, value_min: 12, value_max: 12, currency: "BC", lore: "Highly valued by wilderness survivalists to preserve meat." }
    ]
  },
  "savage_kobold": {
    name: "Savage Kobold (Cyrene Mines)",
    items: [
      { name: "Small Iron Ore Chunk", chance: 0.40, value_min: 3, value_max: 10, currency: "BC", lore: "Raw mineral mined from the deep subterranean shafts." },
      { name: "Crude Leather Strips", chance: 0.35, value_min: 2, value_max: 6, currency: "BC", lore: "Scavenged binding material, useful for field repair." },
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
