import { useState, useCallback, useEffect, useRef } from 'react';
import { LevelConfig, SymbolType, SYMBOL_CONFIG } from '@/data/divineMatchLevels';

export interface Cell {
  id: string;
  symbol: SymbolType | null;
  row: number;
  col: number;
  isDarkBlock: boolean;
  isIllusionStone: boolean;
  illusionLayers: number;
  isLamp: boolean;
  lampLit: boolean;
  isChained: boolean;
  isMist: boolean;
  isCollectible: boolean;
  isMatched: boolean;
  isSelected: boolean;
  isSpecial: 'mantra_burst' | 'chakra_explosion' | 'om_resonance' | null;
}

export interface GameState {
  grid: Cell[][];
  movesRemaining: number;
  timeRemaining: number;
  score: number;
  isPlaying: boolean;
  isComplete: boolean;
  isVictory: boolean;
  progress: {
    darkBlocksCleared: number;
    illusionsBroken: number;
    lampsLit: number;
    itemsCollected: Record<string, number>;
    mistCleared: number;
    chainsUnlocked: number;
  };
  combo: number;
  stars: number;
}

const createEmptyGrid = (rows: number, cols: number): Cell[][] => {
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => ({
      id: `${row}-${col}`,
      symbol: null,
      row,
      col,
      isDarkBlock: false,
      isIllusionStone: false,
      illusionLayers: 0,
      isLamp: false,
      lampLit: false,
      isChained: false,
      isMist: false,
      isCollectible: false,
      isMatched: false,
      isSelected: false,
      isSpecial: null,
    }))
  );
};

const getRandomSymbol = (symbols: SymbolType[]): SymbolType => {
  return symbols[Math.floor(Math.random() * symbols.length)];
};

export const useDivineMatchGame = (level: LevelConfig) => {
  const [gameState, setGameState] = useState<GameState>(() => initializeGame(level));
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  function initializeGame(levelConfig: LevelConfig): GameState {
    const grid = createEmptyGrid(levelConfig.gridSize.rows, levelConfig.gridSize.cols);
    
    // Place obstacles
    levelConfig.obstacles.darkBlocks?.forEach(({ row, col }) => {
      if (grid[row]?.[col]) {
        grid[row][col].isDarkBlock = true;
      }
    });
    
    levelConfig.obstacles.illusionStones?.forEach(({ row, col, layers }) => {
      if (grid[row]?.[col]) {
        grid[row][col].isIllusionStone = true;
        grid[row][col].illusionLayers = layers;
      }
    });
    
    levelConfig.obstacles.lamps?.forEach(({ row, col }) => {
      if (grid[row]?.[col]) {
        grid[row][col].isLamp = true;
      }
    });
    
    levelConfig.obstacles.chains?.forEach(({ row, col }) => {
      if (grid[row]?.[col]) {
        grid[row][col].isChained = true;
      }
    });

    // Fill with symbols (ensuring no initial matches)
    for (let row = 0; row < levelConfig.gridSize.rows; row++) {
      for (let col = 0; col < levelConfig.gridSize.cols; col++) {
        let symbol: SymbolType;
        let attempts = 0;
        do {
          symbol = getRandomSymbol(levelConfig.availableSymbols);
          attempts++;
        } while (wouldCreateMatch(grid, row, col, symbol) && attempts < 50);
        grid[row][col].symbol = symbol;
      }
    }

    return {
      grid,
      movesRemaining: levelConfig.movesLimit || 999,
      timeRemaining: levelConfig.timeLimit || 0,
      score: 0,
      isPlaying: true,
      isComplete: false,
      isVictory: false,
      progress: {
        darkBlocksCleared: 0,
        illusionsBroken: 0,
        lampsLit: 0,
        itemsCollected: {},
        mistCleared: 0,
        chainsUnlocked: 0,
      },
      combo: 0,
      stars: 0,
    };
  }

  function wouldCreateMatch(grid: Cell[][], row: number, col: number, symbol: SymbolType): boolean {
    // Check horizontal
    let hCount = 1;
    if (col >= 2 && grid[row][col - 1]?.symbol === symbol && grid[row][col - 2]?.symbol === symbol) {
      hCount = 3;
    }
    // Check vertical
    let vCount = 1;
    if (row >= 2 && grid[row - 1]?.[col]?.symbol === symbol && grid[row - 2]?.[col]?.symbol === symbol) {
      vCount = 3;
    }
    return hCount >= 3 || vCount >= 3;
  }

  // Play sound effect
  const playSound = useCallback((type: 'match' | 'combo' | 'special' | 'victory' | 'select') => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;
      
      const frequencies: Record<string, number[]> = {
        match: [523, 659, 784],
        combo: [523, 659, 784, 1047],
        special: [392, 523, 659, 784, 1047],
        victory: [523, 659, 784, 1047, 1319],
        select: [440],
      };
      
      const freqs = frequencies[type];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = type === 'special' ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.3);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.3);
      });
    } catch (error) {
      console.log('Audio not available');
    }
  }, []);

  // Timer for timed levels
  useEffect(() => {
    if (level.timeLimit && gameState.isPlaying && !gameState.isComplete) {
      timerRef.current = setInterval(() => {
        setGameState(prev => {
          const newTime = prev.timeRemaining - 1;
          if (newTime <= 0) {
            return { ...prev, timeRemaining: 0, isPlaying: false, isComplete: true, isVictory: false };
          }
          return { ...prev, timeRemaining: newTime };
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [level.timeLimit, gameState.isPlaying, gameState.isComplete]);

  // Check for matches on the grid
  const findMatches = useCallback((grid: Cell[][]): { row: number; col: number }[] => {
    const matches: Set<string> = new Set();
    const rows = grid.length;
    const cols = grid[0].length;

    // Check horizontal matches
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols - 2; col++) {
        const symbol = grid[row][col].symbol;
        if (symbol && 
            grid[row][col + 1]?.symbol === symbol && 
            grid[row][col + 2]?.symbol === symbol &&
            !grid[row][col].isChained &&
            !grid[row][col + 1].isChained &&
            !grid[row][col + 2].isChained) {
          matches.add(`${row}-${col}`);
          matches.add(`${row}-${col + 1}`);
          matches.add(`${row}-${col + 2}`);
          // Check for 4 or 5 in a row
          if (col + 3 < cols && grid[row][col + 3]?.symbol === symbol && !grid[row][col + 3].isChained) {
            matches.add(`${row}-${col + 3}`);
          }
          if (col + 4 < cols && grid[row][col + 4]?.symbol === symbol && !grid[row][col + 4].isChained) {
            matches.add(`${row}-${col + 4}`);
          }
        }
      }
    }

    // Check vertical matches
    for (let row = 0; row < rows - 2; row++) {
      for (let col = 0; col < cols; col++) {
        const symbol = grid[row][col].symbol;
        if (symbol && 
            grid[row + 1]?.[col]?.symbol === symbol && 
            grid[row + 2]?.[col]?.symbol === symbol &&
            !grid[row][col].isChained &&
            !grid[row + 1][col].isChained &&
            !grid[row + 2][col].isChained) {
          matches.add(`${row}-${col}`);
          matches.add(`${row + 1}-${col}`);
          matches.add(`${row + 2}-${col}`);
          // Check for 4 or 5 in a column
          if (row + 3 < rows && grid[row + 3]?.[col]?.symbol === symbol && !grid[row + 3][col].isChained) {
            matches.add(`${row + 3}-${col}`);
          }
          if (row + 4 < rows && grid[row + 4]?.[col]?.symbol === symbol && !grid[row + 4][col].isChained) {
            matches.add(`${row + 4}-${col}`);
          }
        }
      }
    }

    return Array.from(matches).map(key => {
      const [row, col] = key.split('-').map(Number);
      return { row, col };
    });
  }, []);

  // Process matches and update game state
  const processMatches = useCallback((grid: Cell[][], matches: { row: number; col: number }[]) => {
    if (matches.length === 0) return { grid, matchCount: 0, progress: {} };

    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    const progressUpdate: Partial<GameState['progress']> = {};
    let matchCount = matches.length;

    // Create special symbols for 4+ matches
    if (matches.length >= 5) {
      const centerMatch = matches[Math.floor(matches.length / 2)];
      newGrid[centerMatch.row][centerMatch.col].isSpecial = 'chakra_explosion';
    } else if (matches.length === 4) {
      const centerMatch = matches[1];
      newGrid[centerMatch.row][centerMatch.col].isSpecial = 'mantra_burst';
    }

    // Clear matched cells and affect adjacent obstacles
    matches.forEach(({ row, col }) => {
      const cell = newGrid[row][col];
      
      // Check adjacent cells for obstacles
      const adjacents = [
        { r: row - 1, c: col },
        { r: row + 1, c: col },
        { r: row, c: col - 1 },
        { r: row, c: col + 1 },
      ];

      adjacents.forEach(({ r, c }) => {
        if (r >= 0 && r < newGrid.length && c >= 0 && c < newGrid[0].length) {
          const adjCell = newGrid[r][c];
          
          // Clear dark blocks
          if (adjCell.isDarkBlock) {
            adjCell.isDarkBlock = false;
            progressUpdate.darkBlocksCleared = (progressUpdate.darkBlocksCleared || 0) + 1;
          }
          
          // Reduce illusion stone layers
          if (adjCell.isIllusionStone && adjCell.illusionLayers > 0) {
            adjCell.illusionLayers--;
            if (adjCell.illusionLayers === 0) {
              adjCell.isIllusionStone = false;
              progressUpdate.illusionsBroken = (progressUpdate.illusionsBroken || 0) + 1;
            }
          }
          
          // Light lamps
          if (adjCell.isLamp && !adjCell.lampLit) {
            adjCell.lampLit = true;
            progressUpdate.lampsLit = (progressUpdate.lampsLit || 0) + 1;
          }
          
          // Clear mist
          if (adjCell.isMist) {
            adjCell.isMist = false;
            progressUpdate.mistCleared = (progressUpdate.mistCleared || 0) + 1;
          }
          
          // Break chains
          if (adjCell.isChained) {
            adjCell.isChained = false;
            progressUpdate.chainsUnlocked = (progressUpdate.chainsUnlocked || 0) + 1;
          }
        }
      });

      // Clear the matched cell symbol
      if (!cell.isSpecial) {
        cell.symbol = null;
        cell.isMatched = true;
      }
    });

    return { grid: newGrid, matchCount, progress: progressUpdate };
  }, []);

  // Drop symbols to fill gaps
  const dropSymbols = useCallback((grid: Cell[][]): Cell[][] => {
    const newGrid = grid.map(row => row.map(cell => ({ ...cell, isMatched: false })));
    const cols = newGrid[0].length;
    const rows = newGrid.length;

    for (let col = 0; col < cols; col++) {
      // Collect non-null symbols from bottom to top
      const symbols: (SymbolType | null)[] = [];
      const specials: (Cell['isSpecial'])[] = [];
      
      for (let row = rows - 1; row >= 0; row--) {
        if (newGrid[row][col].symbol !== null) {
          symbols.push(newGrid[row][col].symbol);
          specials.push(newGrid[row][col].isSpecial);
        }
      }

      // Place symbols from bottom to top
      for (let row = rows - 1; row >= 0; row--) {
        const symbolIndex = rows - 1 - row;
        if (symbolIndex < symbols.length) {
          newGrid[row][col].symbol = symbols[symbolIndex];
          newGrid[row][col].isSpecial = specials[symbolIndex];
        } else {
          // Fill with new symbol
          newGrid[row][col].symbol = getRandomSymbol(level.availableSymbols);
          newGrid[row][col].isSpecial = null;
        }
      }
    }

    return newGrid;
  }, [level.availableSymbols]);

  // Swap two cells
  const swapCells = useCallback((row1: number, col1: number, row2: number, col2: number) => {
    setGameState(prev => {
      if (!prev.isPlaying || prev.isComplete) return prev;

      const newGrid = prev.grid.map(row => row.map(cell => ({ ...cell })));
      
      // Swap symbols
      const temp = newGrid[row1][col1].symbol;
      const tempSpecial = newGrid[row1][col1].isSpecial;
      newGrid[row1][col1].symbol = newGrid[row2][col2].symbol;
      newGrid[row1][col1].isSpecial = newGrid[row2][col2].isSpecial;
      newGrid[row2][col2].symbol = temp;
      newGrid[row2][col2].isSpecial = tempSpecial;

      // Check for matches
      const matches = findMatches(newGrid);
      
      if (matches.length === 0) {
        // Swap back if no match
        newGrid[row2][col2].symbol = newGrid[row1][col1].symbol;
        newGrid[row2][col2].isSpecial = newGrid[row1][col1].isSpecial;
        newGrid[row1][col1].symbol = temp;
        newGrid[row1][col1].isSpecial = tempSpecial;
        return prev;
      }

      playSound(matches.length >= 4 ? 'combo' : 'match');

      // Process matches
      const { grid: processedGrid, progress } = processMatches(newGrid, matches);
      const droppedGrid = dropSymbols(processedGrid);

      // Update progress
      const newProgress = { ...prev.progress };
      Object.entries(progress).forEach(([key, value]) => {
        (newProgress as any)[key] = ((newProgress as any)[key] || 0) + (value || 0);
      });

      // Check win condition
      let isVictory = false;
      if (level.taskType === 'clear_darkness') {
        isVictory = newProgress.darkBlocksCleared >= (level.targets.darkBlocks || 0);
      } else if (level.taskType === 'break_illusion') {
        isVictory = newProgress.illusionsBroken >= (level.targets.illusionStones || 0);
      } else if (level.taskType === 'activate_lamps') {
        isVictory = newProgress.lampsLit >= (level.targets.lampsToLight || 0);
      } else if (level.taskType === 'unlock_chains') {
        isVictory = newProgress.chainsUnlocked >= (level.targets.chainsToBreak || 0);
      }

      const newMovesRemaining = prev.movesRemaining - 1;
      const isComplete = isVictory || newMovesRemaining <= 0;
      
      // Calculate stars
      let stars = 0;
      if (isVictory) {
        if (newMovesRemaining >= level.starThresholds[2]) stars = 3;
        else if (newMovesRemaining >= level.starThresholds[1]) stars = 2;
        else if (newMovesRemaining >= level.starThresholds[0]) stars = 1;
      }

      if (isVictory) {
        playSound('victory');
      }

      return {
        ...prev,
        grid: droppedGrid,
        movesRemaining: newMovesRemaining,
        score: prev.score + matches.length * 10 * (prev.combo + 1),
        progress: newProgress,
        combo: matches.length >= 4 ? prev.combo + 1 : 0,
        isComplete,
        isVictory,
        isPlaying: !isComplete,
        stars,
      };
    });
  }, [findMatches, processMatches, dropSymbols, level, playSound]);

  // Handle cell click
  const handleCellClick = useCallback((row: number, col: number) => {
    const cell = gameState.grid[row]?.[col];
    if (!cell || !gameState.isPlaying) return;

    playSound('select');

    if (selectedCell === null) {
      setSelectedCell({ row, col });
      setGameState(prev => {
        const newGrid = prev.grid.map(r => r.map(c => ({ ...c, isSelected: false })));
        newGrid[row][col].isSelected = true;
        return { ...prev, grid: newGrid };
      });
    } else {
      // Check if adjacent
      const isAdjacent = 
        (Math.abs(selectedCell.row - row) === 1 && selectedCell.col === col) ||
        (Math.abs(selectedCell.col - col) === 1 && selectedCell.row === row);

      if (isAdjacent) {
        swapCells(selectedCell.row, selectedCell.col, row, col);
      }

      setSelectedCell(null);
      setGameState(prev => ({
        ...prev,
        grid: prev.grid.map(r => r.map(c => ({ ...c, isSelected: false }))),
      }));
    }
  }, [gameState.grid, gameState.isPlaying, selectedCell, swapCells, playSound]);

  // Reset game
  const resetGame = useCallback(() => {
    setGameState(initializeGame(level));
    setSelectedCell(null);
  }, [level]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return {
    gameState,
    handleCellClick,
    resetGame,
    level,
  };
};

export default useDivineMatchGame;
