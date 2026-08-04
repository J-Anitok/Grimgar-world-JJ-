export type Currency = "BRZ" /* bronze */ | "SC" /* silver */ | "GC" /* gold */;

/* ---- Currency helpers ----
   Base unit: bronze (BRZ)
   1 SC (silver) = 100 BRZ
   1 GC (gold) = 100 SC = 10_000 BRZ
*/
export const CURRENCY_MULTIPLIER: Record<Currency, number> = {
  BRZ: 1,
  SC: 100,
  GC: 100 * 100
};

export function toBronze(amount: number, currency: Currency): number {
  return Math.round(amount * CURRENCY_MULTIPLIER[currency]);
}

export function fromBronze(bronze: number, currency: Currency): number {
  return bronze / CURRENCY_MULTIPLIER[currency];
}

export function formatMoney(bronze: number): string {
  // returns like "2 GC 34 SC 50 BRZ"
  const gold = Math.floor(bronze / CURRENCY_MULTIPLIER.GC);
  const remAfterGold = bronze % CURRENCY_MULTIPLIER.GC;
  const silver = Math.floor(remAfterGold / CURRENCY_MULTIPLIER.SC);
  const bronzeLeft = remAfterGold % CURRENCY_MULTIPLIER.SC;
  const parts = [];
  if (gold) parts.push(`${gold} GC`);
  if (silver) parts.push(`${silver} SC`);
  if (bronzeLeft || parts.length === 0) parts.push(`${bronzeLeft} BRZ`);
  return parts.join(" ");
}

/* ---- Stats and substats ---- */
export interface StatDef {
  name: string;
  // parent names (0,1,or 2). If 1 parent -> single-parent substat; if 2 parents -> two-parent stat
  parents?: string[];
  value: number;
  // optional override for threshold calculation (absolute bronze-like number but here a tier multiplier numeric)
  thresholdOverride?: number;
}

export interface StatThresholdConfig {
  // For single-parent substats: startBase=5, step=10: tiers = 5,15,25...
  // For two parents or main stat: startBase=10, step=10: 10,20,30...
  startBase: number;
  step: number;
  multiplier: number; // multiply tier by this to get threshold (user wanted x4)
}

export const SINGLE_PARENT_CONFIG: StatThresholdConfig = {
  startBase: 5,
  step: 10,
  multiplier: 4
};

export const TWO_PARENT_OR_MAIN_CONFIG: StatThresholdConfig = {
  startBase: 10,
  step: 10,
  multiplier: 4
};

export function computeThresholdForValue(value: number, parentsCount: number, override?: number): number {
  if (override !== undefined) return override;
  const cfg = parentsCount <= 1 ? SINGLE_PARENT_CONFIG : TWO_PARENT_OR_MAIN_CONFIG;
  // Determine the tier value that applies for this stat value.
  // If value < startBase, use startBase threshold.
  const n = Math.max(0, Math.floor((Math.max(value, cfg.startBase) - cfg.startBase) / cfg.step));
  const tierValue = cfg.startBase + n * cfg.step;
  return tierValue * cfg.multiplier;
}

/* Optional function to compute the next threshold (next tier) */
export function nextThreshold(value: number, parentsCount: number): number {
  const cfg = parentsCount <= 1 ? SINGLE_PARENT_CONFIG : TWO_PARENT_OR_MAIN_CONFIG;
  const n = Math.max(0, Math.floor((Math.max(value, cfg.startBase) - cfg.startBase) / cfg.step));
  const nextTierValue = cfg.startBase + (n + 1) * cfg.step;
  return nextTierValue * cfg.multiplier;
}

/* ---- Ripple configuration and application ---- */
export interface RippleConfig {
  // Either percentage (0..1) of change to propagate, or absolute value.
  percentToParents?: number; // e.g. 0.2 => 20% of delta goes to each parent (distributed to each parent)
  percentToSub?: number; // core -> sub percent
  // If multi-parent, percentToParents is applied to each parent unless distributeAcrossParents is true
  distributeAcrossParents?: boolean; // if true: percentToParents is split across parents
}

export function applyRippleFromSubToParents(stats: Record<string, StatDef>, subName: string, delta: number, ripple: RippleConfig) {
  const sub = stats[subName];
  if (!sub || !sub.parents || sub.parents.length === 0) return;
  const numParents = sub.parents.length;
  const p = ripple.percentToParents ?? 0;
  if (p === 0) return;
  if (ripple.distributeAcrossParents) {
    const perParent = (delta * p) / numParents;
    for (const parentName of sub.parents) {
      const pStat = stats[parentName];
      if (pStat) pStat.value += perParent;
    }
  } else {
    // apply full percent to each parent
    for (const parentName of sub.parents) {
      const pStat = stats[parentName];
      if (pStat) pStat.value += delta * p;
    }
  }
}

export function applyRippleFromCoreToSub(stats: Record<string, StatDef>, coreName: string, delta: number, ripple: RippleConfig, subMap: Record<string, string[]>) {
  // subMap: coreName -> list of substat names to adjust
  const subs = subMap[coreName] || [];
  const p = ripple.percentToSub ?? 0;
  for (const subName of subs) {
    const s = stats[subName];
    if (s) s.value += delta * p;
  }
}

/* ---- NPC / Loot / Inventory ---- */
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
  // numeric price stored as bronze for math
  priceBronze: number;
  // original currency unit for display
  currency: Currency;
  lore: string;
}

export interface NPC {
  id: string;
  title: string;
  name: string;
  location: string;
  description: string;
  hp: number;
  ac: number;
  stats: NPCStats;
  inventory: NPCItem[];
  // training schedule reference (optional)
  trainingScheduleId?: string;
  substats?: Record<string, StatDef>;
}

export interface LootItem {
  name: string;
  chance: number; // 0..1
  value_min: number;
  value_max: number;
  currency: Currency;
  lore: string;
}

export interface LootTable {
  name: string;
  items: LootItem[];
}

/* Example DB (converted existing values). Prices converted to bronze. */
export const NPC_DATABASE: Record<string, NPC> = {
  "britney": {
    id: "britney",
    title: "Militia Registrar & Commander",
    name: "Britney",
    location: "Central Office, Alterna",
    description: "Flamboyant and highly pragmatic. He registers new amnesiac arrivals and issues their initial survival loans.",
    hp: 52,
    ac: 14,
    stats: { STR: 11, DEX: 16, CON: 14, INT: 13, WIS: 12, CHA: 15 },
    inventory: [
      { item: "Polished Silver Dagger", priceBronze: toBronze(15, "SC"), currency: "SC", lore: "A beautifully balanced weapon used for self-defense." },
      { item: "Volunteer Soldier Badge", priceBronze: toBronze(8, "SC"), currency: "SC", lore: "The official license required to cash in monster bounties." }
    ]
  },
  "barbara": {
    id: "barbara",
    title: "Thieves' Guild Master Trainer",
    name: "Barbara",
    location: "West Town Slums, Alterna",
    description: "The notoriously sadistic and intense physical trainer of the Thieves' Guild.",
    hp: 90,
    ac: 17,
    stats: { STR: 12, DEX: 20, CON: 16, INT: 14, WIS: 14, CHA: 16 },
    inventory: [
      { item: "Serrated Stiletto", priceBronze: toBronze(25, "SC"), currency: "SC", lore: "Designed specifically to slip between plate mail joints." },
      { item: "Climbing Harness", priceBronze: toBronze(5, "SC"), currency: "SC", lore: "Reinforced leather straps with steel rings." }
    ]
  },
  "master_hanz": {
    id: "master_hanz",
    title: "Owner of Hanz's Heavy Ironworks",
    name: "Master Hanz",
    location: "West Town Slums, Alterna",
    description: "A gruff, heavily scarred dwarf blacksmith who crafts durable, non-ornate equipment.",
    hp: 45,
    ac: 15,
    stats: { STR: 16, DEX: 12, CON: 16, INT: 11, WIS: 13, CHA: 9 },
    inventory: [
      { item: "Standard Broadsword", priceBronze: toBronze(15, "SC"), currency: "SC", lore: "Durable iron sword; standard issue for Warriors." },
      { item: "Iron-Rimmed Wooden Shield", priceBronze: toBronze(10, "SC"), currency: "SC", lore: "Heavy ash wood with a cold-rolled iron rim." }
    ]
  }
};

export const LOOT_TABLES: Record<string, LootTable> = {
  "goblin_scavenger": {
    name: "Goblin Scavenger (Damuro Ruins)",
    items: [
      { name: "Dirty Goblin Pouch", chance: 0.50, value_min: 1, value_max: 8, currency: "BRZ", lore: "A small leather pouch containing dirty, worn copper coins." },
      { name: "Rusted Scrap Iron Dagger", chance: 0.30, value_min: 5, value_max: 5, currency: "BRZ", lore: "Can be sold to Master Hanz for raw material scrap value." },
      { name: "Coarse Salt Bag", chance: 0.15, value_min: 12, value_max: 12, currency: "BRZ", lore: "Highly valued by wilderness survivalists to preserve meat." }
    ]
  },
  "savage_kobold": {
    name: "Savage Kobold (Cyrene Mines)",
    items: [
      { name: "Small Iron Ore Chunk", chance: 0.40, value_min: 3, value_max: 10, currency: "BRZ", lore: "Raw mineral mined from the deep subterranean shafts." },
      { name: "Crude Leather Strips", chance: 0.35, value_min: 2, value_max: 6, currency: "BRZ", lore: "Scavenged binding material, useful for field repair." },
      { name: "Bioluminescent Moss Flask", chance: 0.15, value_min: 1, value_max: 2, currency: "SC", lore: "Faintly glowing moss. Provides 5 feet of dim light for 1 hour." }
    ]
  }
};

/* ---- Player money sheet and bank ---- */
export interface BankAccount {
  id: string;
  name?: string;
  balanceBronze: number;
  interestRateAnnualPercent: number; // e.g. 2.5 means 2.5% per year
  lastAccruedISO?: string; // timestamp when interest last applied
}

export interface Player {
  id: string;
  name: string;
  walletBronze: number;
  bankAccounts: BankAccount[];
  createdAt?: string;
}

export const PLAYER_DB_KEY = "grimgar_players_v1";
export function savePlayersToStorage(players: Player[]) {
  localStorage.setItem(PLAYER_DB_KEY, JSON.stringify(players));
}
export function loadPlayersFromStorage(): Player[] {
  try {
    const raw = localStorage.getItem(PLAYER_DB_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Player[];
  } catch {
    return [];
  }
}

/* Player helpers */
export function createPlayer(id: string, name: string, startingBronze = 0): Player {
  return {
    id,
    name,
    walletBronze: startingBronze,
    bankAccounts: [],
    createdAt: new Date().toISOString()
  };
}

export function depositToBank(player: Player, accountId: string, amountBronze: number) {
  const acc = player.bankAccounts.find(a => a.id === accountId);
  if (!acc) throw new Error("Account not found");
  if (player.walletBronze < amountBronze) throw new Error("Insufficient wallet funds");
  player.walletBronze -= amountBronze;
  acc.balanceBronze += amountBronze;
}

export function withdrawFromBank(player: Player, accountId: string, amountBronze: number) {
  const acc = player.bankAccounts.find(a => a.id === accountId);
  if (!acc) throw new Error("Account not found");
  if (acc.balanceBronze < amountBronze) throw new Error("Insufficient bank funds");
  acc.balanceBronze -= amountBronze;
  player.walletBronze += amountBronze;
}

export function applyInterestToAccount(acc: BankAccount, nowISO?: string) {
  // Simple interest from lastAccrued to now (in days). For a web UI, you might apply per-day or per-second compounding.
  const now = new Date(nowISO ?? new Date().toISOString());
  const last = acc.lastAccruedISO ? new Date(acc.lastAccruedISO) : now;
  const ms = Math.max(0, now.getTime() - last.getTime());
  const days = ms / (1000 * 60 * 60 * 24);
  if (days <= 0) {
    acc.lastAccruedISO = now.toISOString();
    return;
  }
  const annual = acc.interestRateAnnualPercent / 100;
  // apply simple daily compounding (approx)
  const factor = Math.pow(1 + annual / 365, days);
  acc.balanceBronze = Math.round(acc.balanceBronze * factor);
  acc.lastAccruedISO = now.toISOString();
}

/* ---- NPC operations (add/edit/delete) with persistence ---- */
export const NPC_DB_KEY = "grimgar_npcs_v1";
export function saveNPCsToStorage(npcs: Record<string, NPC>) {
  localStorage.setItem(NPC_DB_KEY, JSON.stringify(npcs));
}
export function loadNPCsFromStorage(): Record<string, NPC> {
  try {
    const raw = localStorage.getItem(NPC_DB_KEY);
    if (!raw) return NPC_DATABASE;
    return JSON.parse(raw) as Record<string, NPC>;
  } catch {
    return NPC_DATABASE;
  }
}

export function addOrUpdateNPC(npcs: Record<string, NPC>, npc: NPC) {
  npcs[npc.id] = npc;
}

export function deleteNPC(npcs: Record<string, NPC>, npcId: string) {
  delete npcs[npcId];
}

/* ---- Training schedules ---- */
export interface TrainingSession {
  id: string;
  name: string;
  // map statName => delta value to increase per session
  statDeltas: Record<string, number>;
  // optional: duration, cooldown, repeats, etc.
}

export interface TrainingSchedule {
  id: string;
  name: string;
  sessions: TrainingSession[]; // ordered sequence
  // NPC ids associated (if schedule is bound)
  npcIds?: string[];
}

export function runTrainingSessionForNPC(npc: NPC, session: TrainingSession, statsMap: Record<string, StatDef>) {
  // Apply stat deltas to NPC.stats if their stat names match; we assume stat keys match STR/DEX etc.
  for (const [statName, delta] of Object.entries(session.statDeltas)) {
    if ((npc.stats as any)[statName] !== undefined) {
      (npc.stats as any)[statName] += delta;
      // propagate ripples if you have a configured ripple system (hook here)
    }
  }
}

export function trainSelected(npcs: Record<string, NPC>, schedule: TrainingSchedule, selectedNpcIds: string[], statsMap: Record<string, StatDef>) {
  for (const id of selectedNpcIds) {
    const npc = npcs[id];
    if (!npc) continue;
    for (const s of schedule.sessions) {
      runTrainingSessionForNPC(npc, s, statsMap);
    }
  }
}

/* ---- Scavenger loot / roll system ---- */
export interface ScavengerResultItem {
  item: LootItem;
  quantity: number;
  totalValueBronze: number;
}

export interface ScavengerRollResult {
  obtained: ScavengerResultItem[];
  totalBronze: number;
  split(amountOfShares: number): { perShareBronze: number; distribution: number[] };
}

/**
 * Roll quantity of an item given chance. Basic implementation: for each item do a Bernoulli roll.
 * `qualityRoll` and `collectionRoll` affect quantity and chance:
 * - qualityRoll: multiplier on value (0.5 .. 2.0 for example)
 * - collectionRoll: multiplier on number of items found (0..n)
 */
export function scavengeFromTable(
  table: LootTable,
  qualityRoll: number, // e.g. 0.8..1.5 modifies the item value
  collectionRoll: number // e.g. 0..3 how many attempts / multiplier
): ScavengerRollResult {
  const obtained: ScavengerResultItem[] = [];
  for (const li of table.items) {
    // perform collectionRoll attempts for each item type
    let qty = 0;
    for (let attempt = 0; attempt < Math.max(1, Math.round(collectionRoll)); attempt++) {
      if (Math.random() < li.chance) {
        qty += 1;
      }
    }
    if (qty > 0) {
      // pick a random value between min and max and apply quality roll multiplier
      const rawValue = Math.round(((li.value_min + (Math.random() * (li.value_max - li.value_min))) * qualityRoll) * CURRENCY_MULTIPLIER[li.currency]);
      const totalValueBronze = rawValue * qty;
      obtained.push({ item: li, quantity: qty, totalValueBronze });
    }
  }
  const totalBronze = obtained.reduce((s, it) => s + it.totalValueBronze, 0);
  return {
    obtained,
    totalBronze,
    split: (shares: number) => {
      const per = Math.floor(totalBronze / shares);
      const distribution: number[] = Array(shares).fill(per);
      let remainder = totalBronze - per * shares;
      let i = 0;
      while (remainder > 0) {
        distribution[i % shares] += 1;
        remainder--;
        i++;
      }
      return { perShareBronze: per, distribution };
    }
  };
}

/* ---- Helper: List the loot and prices in readable form ---- */
export function listScavengerResult(result: ScavengerRollResult) {
  return {
    total: formatMoney(result.totalBronze),
    items: result.obtained.map(o => ({
      name: o.item.name,
      qty: o.quantity,
      perItem: formatMoney(Math.round(o.totalValueBronze / o.quantity)),
      total: formatMoney(o.totalValueBronze),
      lore: o.item.lore
    }))
  };
}

/* ---- Utility arrays you provided ---- */
export const FIRST_NAMES = [
  "Haru", "Ranta", "Moguzo", "Yume", "Shihoru", "Mary", "Manato", "Kuzaku", "Choco", "Sassa"
];

export const TRAITS = [
  "Extremely hesitant", "Brash & impulsive", "Stoic & quiet", "Nervous yet observant", "Pragmatic", "Aloof"
];
