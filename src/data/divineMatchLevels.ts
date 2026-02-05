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
  // Level 9: Multi-layer Illusions
  {
    id: 9,
    name: 'Depths of Maya',
    description: 'Break through multiple layers of illusion',
    taskType: 'break_illusion',
    gridSize: { rows: 7, cols: 7 },
    movesLimit: 30,
    targets: { illusionStones: 8 },
    obstacles: {
      illusionStones: [
        { row: 1, col: 1, layers: 3 }, { row: 1, col: 5, layers: 2 },
        { row: 2, col: 3, layers: 3 }, { row: 3, col: 1, layers: 2 },
        { row: 3, col: 5, layers: 3 }, { row: 4, col: 3, layers: 2 },
        { row: 5, col: 1, layers: 2 }, { row: 5, col: 5, layers: 3 },
      ],
    },
    availableSymbols: ['lotus', 'om', 'chakra', 'yantra', 'trishul'],
    karmaReward: 75,
    starThresholds: [8, 16, 25],
  },
  // Level 10: Chained Temple
  {
    id: 10,
    name: 'Bound Sanctuary',
    description: 'Free the temple from all its chains',
    taskType: 'unlock_chains',
    gridSize: { rows: 7, cols: 7 },
    movesLimit: 28,
    targets: { chainsToBreak: 10 },
    obstacles: {
      chains: [
        { row: 0, col: 3 }, { row: 1, col: 1 }, { row: 1, col: 5 },
        { row: 2, col: 3 }, { row: 3, col: 0 }, { row: 3, col: 6 },
        { row: 4, col: 3 }, { row: 5, col: 1 }, { row: 5, col: 5 },
        { row: 6, col: 3 },
      ],
    },
    availableSymbols: ['lotus', 'om', 'rudraksha', 'diya', 'chakra', 'shankh'],
    karmaReward: 80,
    starThresholds: [7, 15, 23],
  },
  // Level 11: Mist and Darkness
  {
    id: 11,
    name: 'Twilight Fog',
    description: 'Clear the mist before it consumes the temple',
    taskType: 'purify_mist',
    gridSize: { rows: 7, cols: 7 },
    movesLimit: 22,
    targets: { mistToClear: 12 },
    obstacles: {
      darkBlocks: [
        { row: 2, col: 2 }, { row: 2, col: 3 }, { row: 2, col: 4 },
        { row: 3, col: 2 }, { row: 3, col: 3 }, { row: 3, col: 4 },
        { row: 4, col: 2 }, { row: 4, col: 3 }, { row: 4, col: 4 },
      ],
    },
    availableSymbols: ['lotus', 'om', 'rudraksha', 'yantra', 'trishul', 'shankh'],
    karmaReward: 85,
    starThresholds: [5, 12, 18],
  },
  // Level 12: Collection Quest
  {
    id: 12,
    name: 'Sacred Gathering',
    description: 'Collect all the divine offerings',
    taskType: 'collect_items',
    gridSize: { rows: 8, cols: 7 },
    movesLimit: 30,
    targets: {
      itemsToCollect: [
        { type: 'lotus', count: 5 },
        { type: 'rudraksha', count: 4 },
        { type: 'diya', count: 3 },
      ],
    },
    obstacles: {
      darkBlocks: [
        { row: 3, col: 0 }, { row: 3, col: 6 },
        { row: 4, col: 0 }, { row: 4, col: 6 },
      ],
    },
    availableSymbols: ['lotus', 'om', 'rudraksha', 'diya', 'chakra', 'yantra'],
    karmaReward: 90,
    starThresholds: [8, 18, 26],
  },
  // Level 13: Speed Devotion
  {
    id: 13,
    name: 'Rapid Awakening',
    description: 'Clear all obstacles before time expires',
    taskType: 'timed_challenge',
    gridSize: { rows: 7, cols: 7 },
    timeLimit: 75,
    targets: { darkBlocks: 15, lampsToLight: 4 },
    obstacles: {
      darkBlocks: [
        { row: 1, col: 1 }, { row: 1, col: 3 }, { row: 1, col: 5 },
        { row: 2, col: 2 }, { row: 2, col: 4 },
        { row: 3, col: 1 }, { row: 3, col: 3 }, { row: 3, col: 5 },
        { row: 4, col: 2 }, { row: 4, col: 4 },
        { row: 5, col: 1 }, { row: 5, col: 3 }, { row: 5, col: 5 },
        { row: 6, col: 2 }, { row: 6, col: 4 },
      ],
      lamps: [
        { row: 0, col: 0 }, { row: 0, col: 6 },
        { row: 6, col: 0 }, { row: 6, col: 6 },
      ],
    },
    availableSymbols: ['lotus', 'om', 'rudraksha', 'diya', 'chakra', 'yantra', 'trishul'],
    karmaReward: 100,
    starThresholds: [25, 45, 65],
  },
  // Level 14: Triple Threat
  {
    id: 14,
    name: 'Convergence',
    description: 'Clear darkness, break illusions, and light lamps',
    taskType: 'clear_darkness',
    gridSize: { rows: 8, cols: 7 },
    movesLimit: 35,
    targets: { darkBlocks: 10, illusionStones: 4, lampsToLight: 3 },
    obstacles: {
      darkBlocks: [
        { row: 2, col: 1 }, { row: 2, col: 2 }, { row: 2, col: 4 }, { row: 2, col: 5 },
        { row: 4, col: 1 }, { row: 4, col: 2 }, { row: 4, col: 4 }, { row: 4, col: 5 },
        { row: 6, col: 2 }, { row: 6, col: 4 },
      ],
      illusionStones: [
        { row: 3, col: 0, layers: 2 }, { row: 3, col: 6, layers: 2 },
        { row: 5, col: 0, layers: 3 }, { row: 5, col: 6, layers: 3 },
      ],
      lamps: [
        { row: 0, col: 3 }, { row: 4, col: 3 }, { row: 7, col: 3 },
      ],
    },
    availableSymbols: ['lotus', 'om', 'rudraksha', 'diya', 'chakra', 'yantra', 'trishul'],
    karmaReward: 110,
    starThresholds: [10, 20, 30],
  },
  // Level 15: Fortress of Chains
  {
    id: 15,
    name: 'Liberation Path',
    description: 'Break chains while clearing spreading darkness',
    taskType: 'unlock_chains',
    gridSize: { rows: 8, cols: 8 },
    movesLimit: 32,
    targets: { chainsToBreak: 12, darkBlocks: 8 },
    obstacles: {
      chains: [
        { row: 1, col: 1 }, { row: 1, col: 6 },
        { row: 2, col: 3 }, { row: 2, col: 4 },
        { row: 3, col: 1 }, { row: 3, col: 6 },
        { row: 4, col: 1 }, { row: 4, col: 6 },
        { row: 5, col: 3 }, { row: 5, col: 4 },
        { row: 6, col: 1 }, { row: 6, col: 6 },
      ],
      darkBlocks: [
        { row: 3, col: 3 }, { row: 3, col: 4 },
        { row: 4, col: 3 }, { row: 4, col: 4 },
        { row: 2, col: 2 }, { row: 2, col: 5 },
        { row: 5, col: 2 }, { row: 5, col: 5 },
      ],
    },
    availableSymbols: ['lotus', 'om', 'rudraksha', 'diya', 'chakra', 'yantra', 'trishul', 'shankh'],
    karmaReward: 120,
    starThresholds: [9, 18, 27],
  },
  // Level 16: Temple Restoration
  {
    id: 16,
    name: 'Divine Restoration',
    description: 'Light all eight sacred lamps',
    taskType: 'activate_lamps',
    gridSize: { rows: 8, cols: 8 },
    movesLimit: 35,
    targets: { lampsToLight: 8 },
    obstacles: {
      lamps: [
        { row: 0, col: 0 }, { row: 0, col: 7 },
        { row: 2, col: 3 }, { row: 2, col: 4 },
        { row: 5, col: 3 }, { row: 5, col: 4 },
        { row: 7, col: 0 }, { row: 7, col: 7 },
      ],
      illusionStones: [
        { row: 1, col: 1, layers: 2 }, { row: 1, col: 6, layers: 2 },
        { row: 6, col: 1, layers: 2 }, { row: 6, col: 6, layers: 2 },
      ],
    },
    availableSymbols: ['lotus', 'om', 'rudraksha', 'diya', 'chakra', 'yantra', 'trishul', 'shankh'],
    karmaReward: 130,
    starThresholds: [10, 20, 30],
  },
  // Level 17: Mist Storm
  {
    id: 17,
    name: 'Tempest of Doubt',
    description: 'Purify the overwhelming mist with chains blocking your path',
    taskType: 'purify_mist',
    gridSize: { rows: 8, cols: 8 },
    movesLimit: 28,
    targets: { mistToClear: 16, chainsToBreak: 6 },
    obstacles: {
      darkBlocks: [
        { row: 2, col: 2 }, { row: 2, col: 3 }, { row: 2, col: 4 }, { row: 2, col: 5 },
        { row: 3, col: 2 }, { row: 3, col: 5 },
        { row: 4, col: 2 }, { row: 4, col: 5 },
        { row: 5, col: 2 }, { row: 5, col: 3 }, { row: 5, col: 4 }, { row: 5, col: 5 },
      ],
      chains: [
        { row: 1, col: 3 }, { row: 1, col: 4 },
        { row: 3, col: 3 }, { row: 4, col: 4 },
        { row: 6, col: 3 }, { row: 6, col: 4 },
      ],
    },
    availableSymbols: ['lotus', 'om', 'rudraksha', 'diya', 'chakra', 'yantra', 'trishul', 'shankh'],
    karmaReward: 140,
    starThresholds: [7, 15, 23],
  },
  // Level 18: Ultimate Collection
  {
    id: 18,
    name: 'Divine Treasury',
    description: 'Gather all sacred symbols through the obstacles',
    taskType: 'collect_items',
    gridSize: { rows: 9, cols: 8 },
    movesLimit: 40,
    targets: {
      itemsToCollect: [
        { type: 'lotus', count: 6 },
        { type: 'rudraksha', count: 5 },
        { type: 'om', count: 4 },
        { type: 'shankh', count: 3 },
      ],
    },
    obstacles: {
      darkBlocks: [
        { row: 3, col: 2 }, { row: 3, col: 5 },
        { row: 5, col: 2 }, { row: 5, col: 5 },
      ],
      illusionStones: [
        { row: 4, col: 0, layers: 2 }, { row: 4, col: 7, layers: 2 },
      ],
      chains: [
        { row: 2, col: 3 }, { row: 2, col: 4 },
        { row: 6, col: 3 }, { row: 6, col: 4 },
      ],
    },
    availableSymbols: ['lotus', 'om', 'rudraksha', 'diya', 'chakra', 'yantra', 'trishul', 'shankh'],
    karmaReward: 150,
    starThresholds: [12, 24, 35],
  },
  // Level 19: Time Crisis
  {
    id: 19,
    name: 'Sacred Urgency',
    description: 'Complete all objectives before time runs out',
    taskType: 'timed_challenge',
    gridSize: { rows: 8, cols: 8 },
    timeLimit: 90,
    targets: { darkBlocks: 12, illusionStones: 6, lampsToLight: 4 },
    obstacles: {
      darkBlocks: [
        { row: 1, col: 2 }, { row: 1, col: 5 },
        { row: 2, col: 1 }, { row: 2, col: 3 }, { row: 2, col: 4 }, { row: 2, col: 6 },
        { row: 5, col: 1 }, { row: 5, col: 3 }, { row: 5, col: 4 }, { row: 5, col: 6 },
        { row: 6, col: 2 }, { row: 6, col: 5 },
      ],
      illusionStones: [
        { row: 3, col: 2, layers: 2 }, { row: 3, col: 5, layers: 2 },
        { row: 4, col: 2, layers: 3 }, { row: 4, col: 5, layers: 3 },
        { row: 3, col: 0, layers: 2 }, { row: 4, col: 7, layers: 2 },
      ],
      lamps: [
        { row: 0, col: 0 }, { row: 0, col: 7 },
        { row: 7, col: 0 }, { row: 7, col: 7 },
      ],
    },
    availableSymbols: ['lotus', 'om', 'rudraksha', 'diya', 'chakra', 'yantra', 'trishul', 'shankh'],
    karmaReward: 175,
    starThresholds: [30, 55, 80],
  },
  // Level 20: Ultimate Challenge
  {
    id: 20,
    name: 'Enlightenment',
    description: 'Master all obstacles in the final challenge',
    taskType: 'clear_darkness',
    gridSize: { rows: 9, cols: 9 },
    movesLimit: 45,
    targets: { darkBlocks: 16, illusionStones: 6, lampsToLight: 6, chainsToBreak: 8 },
    obstacles: {
      darkBlocks: [
        { row: 2, col: 2 }, { row: 2, col: 3 }, { row: 2, col: 5 }, { row: 2, col: 6 },
        { row: 3, col: 2 }, { row: 3, col: 6 },
        { row: 4, col: 3 }, { row: 4, col: 4 }, { row: 4, col: 5 },
        { row: 5, col: 2 }, { row: 5, col: 6 },
        { row: 6, col: 2 }, { row: 6, col: 3 }, { row: 6, col: 5 }, { row: 6, col: 6 },
        { row: 4, col: 0 },
      ],
      illusionStones: [
        { row: 1, col: 4, layers: 3 }, { row: 7, col: 4, layers: 3 },
        { row: 4, col: 1, layers: 2 }, { row: 4, col: 7, layers: 2 },
        { row: 3, col: 3, layers: 2 }, { row: 5, col: 5, layers: 2 },
      ],
      lamps: [
        { row: 0, col: 0 }, { row: 0, col: 4 }, { row: 0, col: 8 },
        { row: 8, col: 0 }, { row: 8, col: 4 }, { row: 8, col: 8 },
      ],
      chains: [
        { row: 1, col: 1 }, { row: 1, col: 7 },
        { row: 3, col: 4 }, { row: 5, col: 4 },
        { row: 7, col: 1 }, { row: 7, col: 7 },
        { row: 4, col: 2 }, { row: 4, col: 6 },
      ],
    },
    availableSymbols: ['lotus', 'om', 'rudraksha', 'diya', 'chakra', 'yantra', 'trishul', 'shankh'],
    karmaReward: 250,
    starThresholds: [15, 28, 40],
  },
];

export const getLevel = (levelId: number): LevelConfig | undefined => {
  return DIVINE_MATCH_LEVELS.find(l => l.id === levelId);
};

export const getTotalLevels = () => DIVINE_MATCH_LEVELS.length;
