// Temple Labyrinth — "Path to the Garbhagriha"
// Data: Vastu elements, logic puzzles, sutras

export type VastuElement = 'earth' | 'water' | 'fire' | 'air' | 'space';

export interface MazeCell {
  row: number;
  col: number;
  walls: { top: boolean; right: boolean; bottom: boolean; left: boolean };
  element: VastuElement;
  isStart: boolean;
  isEnd: boolean;
  isGateway: boolean;
  visited?: boolean;
}

export interface LogicPuzzle {
  question: string;
  options: string[];
  correctIndex: number;
  hint: string;
  level: number;
}

export interface Sutra {
  sanskrit: string;
  english: string;
  coding: string;
}

// Vastu element properties
export const ELEMENT_CONFIG: Record<VastuElement, {
  emoji: string;
  color: string;
  bgClass: string;
  borderClass: string;
  name: string;
  nameHi: string;
}> = {
  earth: { emoji: '🜃', color: '#8B6914', bgClass: 'bg-yellow-900/30', borderClass: 'border-yellow-700/40', name: 'Prithvi', nameHi: 'पृथ्वी' },
  water: { emoji: '🜄', color: '#1E90FF', bgClass: 'bg-blue-500/20', borderClass: 'border-blue-500/30', name: 'Jala', nameHi: 'जल' },
  fire:  { emoji: '🜂', color: '#FF4500', bgClass: 'bg-red-500/20', borderClass: 'border-red-500/30', name: 'Agni', nameHi: 'अग्नि' },
  air:   { emoji: '🜁', color: '#90EE90', bgClass: 'bg-green-400/20', borderClass: 'border-green-400/30', name: 'Vayu', nameHi: 'वायु' },
  space: { emoji: '✦', color: '#DDA0DD', bgClass: 'bg-purple-400/20', borderClass: 'border-purple-400/30', name: 'Akasha', nameHi: 'आकाश' },
};

// Element compatibility matrix — true = harmonic flow, false = costs Prana
export const ELEMENT_HARMONY: Record<VastuElement, VastuElement[]> = {
  earth: ['earth', 'air', 'space'],
  water: ['water', 'space', 'earth'],
  fire:  ['fire', 'air', 'space'],
  air:   ['air', 'space', 'earth', 'fire'],
  space: ['earth', 'water', 'fire', 'air', 'space'],
};

export const PRANA_COST_DISHARMONY = 8;
export const PRANA_REGEN_HARMONY = 2;
export const STARTING_PRANA = 100;

// Assign Vastu element based on position in grid (Vastu Purusha Mandala mapping)
export function getVastuElement(row: number, col: number, size: number): VastuElement {
  const centerR = (size - 1) / 2;
  const centerC = (size - 1) / 2;
  const dr = row - centerR;
  const dc = col - centerC;
  const dist = Math.sqrt(dr * dr + dc * dc);

  // Center = Space
  if (dist < size * 0.2) return 'space';
  // North = Water
  if (dr < -size * 0.2 && Math.abs(dc) < size * 0.35) return 'water';
  // South = Fire
  if (dr > size * 0.2 && Math.abs(dc) < size * 0.35) return 'fire';
  // East = Air
  if (dc > size * 0.2 && Math.abs(dr) < size * 0.35) return 'air';
  // West = Earth
  if (dc < -size * 0.2 && Math.abs(dr) < size * 0.35) return 'earth';

  // Corners/edges — alternating
  const angle = Math.atan2(dr, dc);
  if (angle < -Math.PI / 2) return 'earth';
  if (angle < 0) return 'water';
  if (angle < Math.PI / 2) return 'air';
  return 'fire';
}

// Level configs
export const LEVEL_CONFIGS = [
  { size: 5, name: 'Outer Wall', nameHi: 'बाहरी दीवार', prakara: 'Prathama Prakara' },
  { size: 6, name: 'Truth Chamber', nameHi: 'सत्य कक्ष', prakara: 'Dvitiya Prakara' },
  { size: 7, name: 'Recursive Passage', nameHi: 'पुनरावर्ती मार्ग', prakara: 'Tritiya Prakara' },
  { size: 8, name: 'Set Sanctum', nameHi: 'समुच्चय गर्भ', prakara: 'Chaturtha Prakara' },
  { size: 9, name: 'The Garbhagriha', nameHi: 'गर्भगृह', prakara: 'Pancha Prakara' },
];

// Logic puzzles per level
export const PUZZLES: LogicPuzzle[][] = [
  // Level 1: Basic Boolean Logic (AND/OR/NOT)
  [
    { question: 'What is TRUE AND FALSE?', options: ['TRUE', 'FALSE', 'NULL', 'UNDEFINED'], correctIndex: 1, hint: 'AND requires both operands to be TRUE', level: 1 },
    { question: 'What is NOT (TRUE OR FALSE)?', options: ['TRUE', 'FALSE', 'ERROR', 'NULL'], correctIndex: 1, hint: 'OR returns TRUE if any operand is TRUE, then NOT inverts it', level: 1 },
    { question: 'If A=1, B=0: What is A OR B?', options: ['0', '1', '-1', 'NULL'], correctIndex: 1, hint: 'OR returns 1 if any input is 1', level: 1 },
  ],
  // Level 2: Truth Tables & Equivalences
  [
    { question: 'Which is equivalent to NOT (A AND B)?', options: ['(NOT A) OR (NOT B)', '(NOT A) AND (NOT B)', 'A OR B', 'A AND (NOT B)'], correctIndex: 0, hint: 'De Morgan\'s Law: ¬(A∧B) = ¬A∨¬B', level: 2 },
    { question: 'A XOR B is TRUE when:', options: ['A and B are same', 'A and B are different', 'Both are TRUE', 'Both are FALSE'], correctIndex: 1, hint: 'XOR = exclusive OR, true when inputs differ', level: 2 },
    { question: 'P → Q is FALSE only when:', options: ['P=T, Q=T', 'P=T, Q=F', 'P=F, Q=T', 'P=F, Q=F'], correctIndex: 1, hint: 'Implication is false only when premise is true and conclusion is false', level: 2 },
  ],
  // Level 3: Recursion & Patterns
  [
    { question: 'What is fibonacci(5)?', options: ['3', '5', '8', '13'], correctIndex: 1, hint: 'fib(n) = fib(n-1) + fib(n-2), fib(0)=0, fib(1)=1', level: 3 },
    { question: 'What is the base case for factorial(n)?', options: ['n == 0 → return 1', 'n == 1 → return n', 'n < 0 → return 0', 'n == 2 → return 2'], correctIndex: 0, hint: 'factorial(0) = 1 by definition', level: 3 },
    { question: 'Recursion without a base case causes:', options: ['Compilation error', 'Stack overflow', 'Segfault', 'Infinite loop'], correctIndex: 1, hint: 'Each recursive call adds to the call stack', level: 3 },
  ],
  // Level 4: Set Theory
  [
    { question: 'A = {1,2,3}, B = {2,3,4}. A ∩ B = ?', options: ['{1,4}', '{2,3}', '{1,2,3,4}', '{3}'], correctIndex: 1, hint: 'Intersection = elements in both sets', level: 4 },
    { question: 'If |A| = 5, |B| = 3, |A∩B| = 2, then |A∪B| = ?', options: ['8', '6', '5', '10'], correctIndex: 1, hint: '|A∪B| = |A| + |B| - |A∩B|', level: 4 },
    { question: 'The power set of {a, b} has how many elements?', options: ['2', '3', '4', '8'], correctIndex: 2, hint: 'Power set has 2^n elements', level: 4 },
  ],
  // Level 5: Zero-Knowledge / Cryptographic / Shunya
  [
    { question: 'In a zero-knowledge proof, the prover reveals:', options: ['The secret', 'Nothing about the secret', 'A hash of the secret', 'The key'], correctIndex: 1, hint: 'Zero-knowledge = prove knowledge without revealing it', level: 5 },
    { question: 'The concept of Zero (Shunya) in computing represents:', options: ['Nothing', 'False / Off state', 'The void', 'All of the above'], correctIndex: 3, hint: 'Shunya is the foundation — 0 means many things', level: 5 },
    { question: 'SHA-256 produces a hash of fixed length:', options: ['128 bits', '256 bits', '512 bits', '64 bits'], correctIndex: 1, hint: 'SHA-256 → 256-bit output', level: 5 },
  ],
];

// Sutras — blending ancient wisdom with coding
export const SUTRAS: Sutra[] = [
  {
    sanskrit: 'योगः कर्मसु कौशलम्',
    english: 'Yoga is skill in action.',
    coding: 'Clean code is like a clean mind; both require constant Vairagya (detachment) from the unnecessary.',
  },
  {
    sanskrit: 'अणोरणीयान् महतो महीयान्',
    english: 'Smaller than the smallest, greater than the greatest.',
    coding: 'The best algorithms handle both edge cases and scale — from O(1) to O(n).',
  },
  {
    sanskrit: 'नेति नेति',
    english: 'Not this, not this.',
    coding: 'Debugging is the art of Neti Neti — eliminating what the bug is NOT until truth remains.',
  },
  {
    sanskrit: 'सत्यमेव जयते',
    english: 'Truth alone triumphs.',
    coding: 'In testing, only assertions that reflect true behavior survive. Write tests that seek Satya.',
  },
  {
    sanskrit: 'शून्यं सर्वस्य मूलम्',
    english: 'Zero is the root of everything.',
    coding: 'From Aryabhata\'s Shunya to binary — zero is the foundation of all computation.',
  },
];

// Maze generation using Recursive Backtracking
export function generateMaze(size: number): MazeCell[][] {
  const grid: MazeCell[][] = [];

  // Initialize grid with all walls
  for (let r = 0; r < size; r++) {
    grid[r] = [];
    for (let c = 0; c < size; c++) {
      grid[r][c] = {
        row: r,
        col: c,
        walls: { top: true, right: true, bottom: true, left: true },
        element: getVastuElement(r, c, size),
        isStart: r === 0 && c === 0,
        isEnd: r === size - 1 && c === size - 1,
        isGateway: false,
        visited: false,
      };
    }
  }

  // Recursive backtracking
  const stack: [number, number][] = [];
  const start = grid[0][0];
  start.visited = true;
  stack.push([0, 0]);

  while (stack.length > 0) {
    const [cr, cc] = stack[stack.length - 1];
    const neighbors: [number, number, string, string][] = [];

    // Check unvisited neighbors
    if (cr > 0 && !grid[cr - 1][cc].visited) neighbors.push([cr - 1, cc, 'top', 'bottom']);
    if (cr < size - 1 && !grid[cr + 1][cc].visited) neighbors.push([cr + 1, cc, 'bottom', 'top']);
    if (cc > 0 && !grid[cr][cc - 1].visited) neighbors.push([cr, cc - 1, 'left', 'right']);
    if (cc < size - 1 && !grid[cr][cc + 1].visited) neighbors.push([cr, cc + 1, 'right', 'left']);

    if (neighbors.length > 0) {
      const [nr, nc, wall, opposite] = neighbors[Math.floor(Math.random() * neighbors.length)];
      // Remove walls between current and chosen
      (grid[cr][cc].walls as any)[wall] = false;
      (grid[nr][nc].walls as any)[opposite] = false;
      grid[nr][nc].visited = true;
      stack.push([nr, nc]);
    } else {
      stack.pop();
    }
  }

  // Mark gateway near the center
  const mid = Math.floor(size / 2);
  grid[mid][mid].isGateway = true;

  // Clean visited flags
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      grid[r][c].visited = false;
    }
  }

  return grid;
}

// A* pathfinding for hint system
export function findShortestPath(
  grid: MazeCell[][],
  start: [number, number],
  end: [number, number]
): [number, number][] {
  const size = grid.length;
  const heuristic = (a: [number, number], b: [number, number]) =>
    Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);

  const openSet = new Set<string>();
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();

  const key = (r: number, c: number) => `${r},${c}`;
  const startKey = key(...start);
  const endKey = key(...end);

  openSet.add(startKey);
  gScore.set(startKey, 0);
  fScore.set(startKey, heuristic(start, end));

  while (openSet.size > 0) {
    // Find node with lowest fScore
    let current = '';
    let lowestF = Infinity;
    for (const k of openSet) {
      const f = fScore.get(k) ?? Infinity;
      if (f < lowestF) { lowestF = f; current = k; }
    }

    if (current === endKey) {
      // Reconstruct path
      const path: [number, number][] = [];
      let c = current;
      while (c) {
        const [r, col] = c.split(',').map(Number);
        path.unshift([r, col]);
        c = cameFrom.get(c)!;
      }
      return path;
    }

    openSet.delete(current);
    const [cr, cc] = current.split(',').map(Number);
    const cell = grid[cr][cc];

    const dirs: { dr: number; dc: number; wall: keyof MazeCell['walls'] }[] = [
      { dr: -1, dc: 0, wall: 'top' },
      { dr: 1, dc: 0, wall: 'bottom' },
      { dr: 0, dc: -1, wall: 'left' },
      { dr: 0, dc: 1, wall: 'right' },
    ];

    for (const { dr, dc, wall } of dirs) {
      const nr = cr + dr;
      const nc = cc + dc;
      if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
      if (cell.walls[wall]) continue; // Wall blocks

      const nk = key(nr, nc);
      const tentativeG = (gScore.get(current) ?? Infinity) + 1;

      if (tentativeG < (gScore.get(nk) ?? Infinity)) {
        cameFrom.set(nk, current);
        gScore.set(nk, tentativeG);
        fScore.set(nk, tentativeG + heuristic([nr, nc], end));
        openSet.add(nk);
      }
    }
  }

  return []; // No path found
}

// Audio frequencies for each element (harmonic feedback)
export const ELEMENT_FREQUENCIES: Record<VastuElement, number> = {
  earth: 136.1, // Earth OM
  water: 285,
  fire: 396,
  air: 528,
  space: 963,
};
