export type LevelTaskType = 
  | 'clear_darkness'    // Clear negative energy blocks
  | 'break_illusion'    // Break illusion stones
  | 'activate_lamps'    // Light sacred lamps
  | 'collect_items'     // Collect divine elements
  | 'purify_mist'       // Clear spreading mist
  | 'timed_challenge'   // Complete before timer
  | 'unlock_chains';    // Break sacred locks

export type SymbolType = 'lotus' | 'om' | 'rudraksha' | 'diya' | 'chakra' | 'yantra' | 'trishul' | 'shankh';

export interface LevelConfig {
  id: number;
  name: string;
  description: string;
  taskType: LevelTaskType;
  gridSize: { rows: number; cols: number };
  movesLimit?: number;
  timeLimit?: number; // seconds
  targets: {
    darkBlocks?: number;
    illusionStones?: number;
    lampsToLight?: number;
    itemsToCollect?: { type: string; count: number }[];
    mistToClear?: number;
    chainsToBreak?: number;
  };
  obstacles: {
    darkBlocks?: { row: number; col: number }[];
    illusionStones?: { row: number; col: number; layers: number }[];
    lamps?: { row: number; col: number }[];
    chains?: { row: number; col: number }[];
  };
  availableSymbols: SymbolType[];
  karmaReward: number;
  starThresholds: [number, number, number]; // moves remaining for 1, 2, 3 stars
}

export const SYMBOL_CONFIG: Record<SymbolType, { emoji: string; color: string; name: string }> = {
  lotus: { emoji: '🪷', color: '#EC4899', name: 'Sacred Lotus' },
  om: { emoji: '🕉️', color: '#8B5CF6', name: 'Om Symbol' },
  rudraksha: { emoji: '📿', color: '#F59E0B', name: 'Rudraksha' },
  diya: { emoji: '🪔', color: '#FBBF24', name: 'Sacred Lamp' },
  chakra: { emoji: '☸️', color: '#3B82F6', name: 'Dharma Chakra' },
  yantra: { emoji: '🔯', color: '#10B981', name: 'Sacred Yantra' },
  trishul: { emoji: '🔱', color: '#EF4444', name: 'Divine Trishul' },
  shankh: { emoji: '🐚', color: '#F472B6', name: 'Sacred Conch' },
};

export const DIVINE_MATCH_LEVELS: LevelConfig[] = [
  // Level 1: Introduction - Simple matching
  {
    id: 1,
    name: 'Awakening',
    description: 'Match symbols to begin your spiritual journey',
    taskType: 'clear_darkness',
    gridSize: { rows: 6, cols: 6 },
    movesLimit: 15,
    targets: { darkBlocks: 5 },
    obstacles: {
      darkBlocks: [
        { row: 2, col: 2 }, { row: 2, col: 3 },
        { row: 3, col: 2 }, { row: 3, col: 3 },
        { row: 2, col: 4 },
      ],
    },
    availableSymbols: ['lotus', 'om', 'rudraksha', 'diya'],
    karmaReward: 25,
    starThresholds: [3, 7, 12],
  },
  // Level 2: Break Illusion
  {
    id: 2,
    name: 'Breaking Maya',
    description: 'Shatter the illusions blocking your path',
    taskType: 'break_illusion',
    gridSize: { rows: 6, cols: 6 },
    movesLimit: 18,
    targets: { illusionStones: 4 },
    obstacles: {
      illusionStones: [
        { row: 1, col: 2, layers: 2 },
        { row: 1, col: 3, layers: 1 },
        { row: 4, col: 2, layers: 2 },
        { row: 4, col: 3, layers: 1 },
      ],
    },
    availableSymbols: ['lotus', 'om', 'chakra', 'yantra'],
    karmaReward: 35,
    starThresholds: [4, 9, 14],
  },
  // Level 3: Light the Lamps
  {
    id: 3,
    name: 'Temple Illumination',
    description: 'Light all sacred lamps to awaken the temple',
    taskType: 'activate_lamps',
    gridSize: { rows: 7, cols: 6 },
    movesLimit: 20,
    targets: { lampsToLight: 4 },
    obstacles: {
      lamps: [
        { row: 0, col: 1 }, { row: 0, col: 4 },
        { row: 6, col: 1 }, { row: 6, col: 4 },
      ],
    },
    availableSymbols: ['lotus', 'om', 'rudraksha', 'diya', 'chakra'],
    karmaReward: 40,
    starThresholds: [5, 10, 16],
  },
  // Level 4: Collect Divine Items
  {
    id: 4,
    name: 'Sacred Collection',
    description: 'Guide the divine elements to safety',
    taskType: 'collect_items',
    gridSize: { rows: 7, cols: 6 },
    movesLimit: 22,
    targets: {
      itemsToCollect: [
        { type: 'lotus', count: 3 },
        { type: 'rudraksha', count: 2 },
      ],
    },
    obstacles: {},
    availableSymbols: ['lotus', 'om', 'rudraksha', 'diya', 'chakra'],
    karmaReward: 45,
    starThresholds: [6, 12, 18],
  },
  // Level 5: Purify the Mist
  {
    id: 5,
    name: 'Mind Purification',
    description: 'Clear the dark mist before it spreads',
    taskType: 'purify_mist',
    gridSize: { rows: 6, cols: 6 },
    movesLimit: 16,
    targets: { mistToClear: 8 },
    obstacles: {
      darkBlocks: [
        { row: 2, col: 2 }, { row: 2, col: 3 },
        { row: 3, col: 2 }, { row: 3, col: 3 },
      ],
    },
    availableSymbols: ['lotus', 'om', 'rudraksha', 'yantra', 'trishul'],
    karmaReward: 50,
    starThresholds: [4, 8, 13],
  },
  // Level 6: Timed Challenge
  {
    id: 6,
    name: 'Swift Devotion',
    description: 'Complete the puzzle before time runs out',
    taskType: 'timed_challenge',
    gridSize: { rows: 6, cols: 6 },
    timeLimit: 60,
    targets: { darkBlocks: 10 },
    obstacles: {
      darkBlocks: [
        { row: 1, col: 1 }, { row: 1, col: 4 },
        { row: 2, col: 2 }, { row: 2, col: 3 },
        { row: 3, col: 1 }, { row: 3, col: 4 },
        { row: 4, col: 2 }, { row: 4, col: 3 },
        { row: 5, col: 1 }, { row: 5, col: 4 },
      ],
    },
    availableSymbols: ['lotus', 'om', 'rudraksha', 'diya', 'chakra', 'yantra'],
    karmaReward: 60,
    starThresholds: [20, 35, 50],
  },
  // Level 7: Unlock Chains
  {
    id: 7,
    name: 'Liberation',
    description: 'Free the sacred symbols from their chains',
    taskType: 'unlock_chains',
    gridSize: { rows: 7, cols: 7 },
    movesLimit: 25,
    targets: { chainsToBreak: 6 },
    obstacles: {
      chains: [
        { row: 1, col: 1 }, { row: 1, col: 5 },
        { row: 3, col: 2 }, { row: 3, col: 4 },
        { row: 5, col: 1 }, { row: 5, col: 5 },
      ],
    },
    availableSymbols: ['lotus', 'om', 'rudraksha', 'diya', 'chakra', 'trishul'],
    karmaReward: 55,
    starThresholds: [6, 13, 20],
  },
  // Level 8: Combined Challenge
  {
    id: 8,
    name: 'Divine Harmony',
    description: 'Clear darkness and light the lamps',
    taskType: 'clear_darkness',
    gridSize: { rows: 7, cols: 7 },
    movesLimit: 28,
    targets: { darkBlocks: 8, lampsToLight: 2 },
    obstacles: {
      darkBlocks: [
        { row: 2, col: 2 }, { row: 2, col: 3 }, { row: 2, col: 4 },
        { row: 3, col: 2 }, { row: 3, col: 4 },
        { row: 4, col: 2 }, { row: 4, col: 3 }, { row: 4, col: 4 },
      ],
      lamps: [
        { row: 0, col: 3 }, { row: 6, col: 3 },
      ],
    },
    availableSymbols: ['lotus', 'om', 'rudraksha', 'diya', 'chakra', 'yantra', 'trishul'],
    karmaReward: 70,
    starThresholds: [8, 16, 24],
  },
];

export const getLevel = (levelId: number): LevelConfig | undefined => {
  return DIVINE_MATCH_LEVELS.find(l => l.id === levelId);
};

export const getTotalLevels = () => DIVINE_MATCH_LEVELS.length;
