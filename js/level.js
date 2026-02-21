// Level management and level data
import { TILE_SIZE, WATER_BASE_SPEED, WATER_ACCEL, WATER_DELAY_FRAMES } from './config.js';

// Level data format:
// tiles: 2D array - 0=empty, 1=solid, 2=grass, 3=platform
// enemies: [{type, col, row}]
// items: [{type, col, row}]
// playerStart: {col, row}
// name, theme

function generateLevel(config) {
  const { width, height, platforms, enemies, items, playerStart, name, theme } = config;

  // Initialize empty tile array
  const tiles = [];
  for (let r = 0; r < height; r++) {
    tiles.push(new Array(width).fill(0));
  }

  // Add walls on sides
  for (let r = 0; r < height; r++) {
    tiles[r][0] = 1;
    tiles[r][width - 1] = 1;
  }

  // Add floor
  for (let c = 0; c < width; c++) {
    tiles[height - 1][c] = 1;
    tiles[height - 2][c] = 2; // grass on top
  }

  // Add platforms from config
  for (const plat of platforms) {
    for (let c = plat.col; c < plat.col + plat.w; c++) {
      if (c >= 0 && c < width && plat.row >= 0 && plat.row < height) {
        tiles[plat.row][c] = plat.type || 3; // default to one-way platform
      }
    }
  }

  return {
    width,
    height,
    tiles,
    enemies: enemies || [],
    items: items || [],
    playerStart: playerStart || { col: 10, row: height - 3 },
    name: name || 'Unknown Island',
    displayName: config.displayName || name || 'Unknown Island',
    theme: theme || 'forest',
    difficulty: config.difficulty || 1,
    waterDelay: config.waterDelay || WATER_DELAY_FRAMES,
  };
}

// ====== LEVEL 1: INSECT ISLAND ======
const level1Config = {
  name: 'Insect Island - Round 1',
  displayName: 'Insect Island 1',
  theme: 'forest',
  difficulty: 1,
  waterDelay: 540,
  width: 20,
  height: 60,
  playerStart: { col: 10, row: 57 },
  platforms: [
    // Bottom area - safe intro zone
    { col: 4, row: 55, w: 5, type: 3 },
    { col: 12, row: 55, w: 5, type: 3 },

    // First climbing section
    { col: 2, row: 51, w: 6, type: 3 },
    { col: 13, row: 51, w: 5, type: 3 },
    { col: 7, row: 48, w: 6, type: 3 },
    { col: 2, row: 45, w: 5, type: 3 },
    { col: 14, row: 45, w: 4, type: 3 },

    // Middle section
    { col: 8, row: 42, w: 5, type: 3 },
    { col: 3, row: 39, w: 4, type: 3 },
    { col: 14, row: 39, w: 4, type: 3 },
    { col: 7, row: 36, w: 6, type: 2 }, // solid grass platform
    { col: 2, row: 33, w: 5, type: 3 },
    { col: 13, row: 33, w: 5, type: 3 },

    // Upper section
    { col: 6, row: 30, w: 8, type: 3 },
    { col: 2, row: 27, w: 4, type: 3 },
    { col: 14, row: 27, w: 4, type: 3 },
    { col: 8, row: 24, w: 5, type: 3 },
    { col: 3, row: 21, w: 6, type: 2 },
    { col: 12, row: 21, w: 6, type: 3 },

    // Top section
    { col: 7, row: 18, w: 6, type: 3 },
    { col: 2, row: 15, w: 5, type: 3 },
    { col: 13, row: 15, w: 5, type: 3 },
    { col: 6, row: 12, w: 8, type: 3 },
    { col: 3, row: 9, w: 4, type: 3 },
    { col: 13, row: 9, w: 4, type: 3 },

    // Goal platform
    { col: 7, row: 6, w: 6, type: 2 },
    { col: 7, row: 7, w: 6, type: 1 },
  ],
  enemies: [
    { type: 'walker', col: 5, row: 54 },
    { type: 'walker', col: 14, row: 54 },
    { type: 'walker', col: 3, row: 50 },
    { type: 'flyer', col: 10, row: 46 },
    { type: 'walker', col: 15, row: 44 },
    { type: 'walker', col: 9, row: 41 },
    { type: 'flyer', col: 5, row: 37 },
    { type: 'jumper', col: 8, row: 35 },
    { type: 'walker', col: 14, row: 32 },
    { type: 'walker', col: 3, row: 32 },
    { type: 'flyer', col: 10, row: 28 },
    { type: 'walker', col: 9, row: 23 },
    { type: 'jumper', col: 4, row: 20 },
    { type: 'walker', col: 14, row: 20 },
    { type: 'flyer', col: 8, row: 16 },
    { type: 'shooter', col: 15, row: 8 },
  ],
  items: [
    { type: 'apple', col: 6, row: 54 },
    { type: 'cherry', col: 15, row: 50 },
    { type: 'diamond', col: 9, row: 47 },
    { type: 'apple', col: 3, row: 44 },
    { type: 'melon', col: 10, row: 41 },
    { type: 'cherry', col: 4, row: 38 },
    { type: 'diamond', col: 8, row: 35 },
    { type: 'shoe', col: 15, row: 32 },
    { type: 'apple', col: 3, row: 26 },
    { type: 'diamond', col: 9, row: 23 },
    { type: 'cherry', col: 14, row: 14 },
    { type: 'potion', col: 4, row: 8 },
    { type: 'diamond', col: 9, row: 5 },
  ],
};

// ====== LEVEL 2: INSECT ISLAND - ROUND 2 ======
const level2Config = {
  name: 'Insect Island - Round 2',
  displayName: 'Insect Island 2',
  theme: 'forest',
  difficulty: 1,
  waterDelay: 510,
  width: 20,
  height: 65,
  playerStart: { col: 3, row: 62 },
  platforms: [
    // Bottom area
    { col: 6, row: 60, w: 4, type: 3 },
    { col: 13, row: 59, w: 5, type: 3 },

    // Zigzag section
    { col: 2, row: 56, w: 5, type: 3 },
    { col: 11, row: 53, w: 6, type: 3 },
    { col: 3, row: 50, w: 5, type: 3 },
    { col: 13, row: 47, w: 5, type: 3 },
    { col: 5, row: 44, w: 4, type: 2 },
    { col: 12, row: 44, w: 4, type: 1 },

    // Vertical corridor with platforms
    { col: 8, row: 41, w: 4, type: 3 },
    { col: 3, row: 38, w: 4, type: 3 },
    { col: 14, row: 38, w: 4, type: 3 },
    { col: 7, row: 35, w: 6, type: 3 },
    { col: 2, row: 32, w: 5, type: 2 },
    { col: 13, row: 32, w: 5, type: 3 },

    // Challenge section
    { col: 8, row: 29, w: 4, type: 3 },
    { col: 3, row: 26, w: 3, type: 3 },
    { col: 15, row: 26, w: 3, type: 3 },
    { col: 8, row: 23, w: 4, type: 3 },
    { col: 4, row: 20, w: 5, type: 3 },
    { col: 12, row: 20, w: 5, type: 3 },

    // Upper area
    { col: 7, row: 17, w: 6, type: 3 },
    { col: 2, row: 14, w: 4, type: 3 },
    { col: 14, row: 14, w: 4, type: 3 },
    { col: 6, row: 11, w: 8, type: 3 },
    { col: 3, row: 8, w: 5, type: 3 },
    { col: 12, row: 8, w: 5, type: 3 },

    // Goal
    { col: 7, row: 5, w: 6, type: 2 },
    { col: 7, row: 6, w: 6, type: 1 },
  ],
  enemies: [
    { type: 'walker', col: 7, row: 59 },
    { type: 'walker', col: 14, row: 58 },
    { type: 'flyer', col: 6, row: 54 },
    { type: 'walker', col: 12, row: 52 },
    { type: 'jumper', col: 4, row: 49 },
    { type: 'walker', col: 14, row: 46 },
    { type: 'flyer', col: 7, row: 42 },
    { type: 'walker', col: 9, row: 40 },
    { type: 'shooter', col: 4, row: 37 },
    { type: 'walker', col: 15, row: 37 },
    { type: 'jumper', col: 9, row: 34 },
    { type: 'flyer', col: 3, row: 30 },
    { type: 'walker', col: 14, row: 31 },
    { type: 'walker', col: 9, row: 28 },
    { type: 'flyer', col: 4, row: 24 },
    { type: 'jumper', col: 13, row: 19 },
    { type: 'shooter', col: 3, row: 13 },
    { type: 'walker', col: 15, row: 13 },
    { type: 'flyer', col: 8, row: 10 },
    { type: 'jumper', col: 14, row: 7 },
  ],
  items: [
    { type: 'apple', col: 8, row: 59 },
    { type: 'diamond', col: 13, row: 52 },
    { type: 'cherry', col: 5, row: 49 },
    { type: 'apple', col: 15, row: 46 },
    { type: 'shoe', col: 9, row: 40 },
    { type: 'diamond', col: 8, row: 34 },
    { type: 'melon', col: 4, row: 31 },
    { type: 'cherry', col: 16, row: 25 },
    { type: 'potion', col: 5, row: 19 },
    { type: 'diamond', col: 8, row: 16 },
    { type: 'heart', col: 3, row: 13 },
    { type: 'diamond', col: 9, row: 10 },
    { type: 'star', col: 9, row: 4 },
  ],
};

// ====== LEVEL 3: COMBAT ISLAND ======
const level3Config = {
  name: 'Combat Island - Round 1',
  displayName: 'Combat Island 1',
  theme: 'cave',
  difficulty: 2,
  waterDelay: 480,
  width: 20,
  height: 70,
  playerStart: { col: 10, row: 67 },
  platforms: [
    // Bottom area
    { col: 4, row: 65, w: 5, type: 3 },
    { col: 12, row: 65, w: 5, type: 3 },

    // Tighter climbing section
    { col: 6, row: 62, w: 3, type: 3 },
    { col: 12, row: 60, w: 3, type: 3 },
    { col: 3, row: 58, w: 3, type: 3 },
    { col: 15, row: 56, w: 3, type: 3 },
    { col: 8, row: 54, w: 4, type: 2 },

    // Arena section
    { col: 2, row: 51, w: 7, type: 2 },
    { col: 11, row: 51, w: 7, type: 2 },
    { col: 6, row: 48, w: 8, type: 3 },
    { col: 2, row: 45, w: 4, type: 3 },
    { col: 14, row: 45, w: 4, type: 3 },

    // Gauntlet
    { col: 7, row: 42, w: 6, type: 3 },
    { col: 3, row: 39, w: 3, type: 3 },
    { col: 14, row: 39, w: 3, type: 3 },
    { col: 8, row: 36, w: 4, type: 3 },
    { col: 2, row: 33, w: 4, type: 3 },
    { col: 14, row: 33, w: 4, type: 3 },
    { col: 7, row: 30, w: 6, type: 2 },

    // Upper gauntlet
    { col: 3, row: 27, w: 4, type: 3 },
    { col: 13, row: 27, w: 4, type: 3 },
    { col: 8, row: 24, w: 4, type: 3 },
    { col: 3, row: 21, w: 3, type: 3 },
    { col: 14, row: 21, w: 3, type: 3 },
    { col: 8, row: 18, w: 4, type: 3 },
    { col: 3, row: 15, w: 4, type: 3 },
    { col: 13, row: 15, w: 4, type: 3 },

    // Top
    { col: 6, row: 12, w: 8, type: 3 },
    { col: 3, row: 9, w: 5, type: 3 },
    { col: 12, row: 9, w: 5, type: 3 },
    { col: 7, row: 6, w: 6, type: 2 },
    { col: 7, row: 7, w: 6, type: 1 },
  ],
  enemies: [
    { type: 'walker', col: 5, row: 64 },
    { type: 'walker', col: 14, row: 64 },
    { type: 'jumper', col: 7, row: 61 },
    { type: 'flyer', col: 13, row: 58 },
    { type: 'walker', col: 4, row: 57 },
    { type: 'shooter', col: 16, row: 55 },
    { type: 'walker', col: 3, row: 50 },
    { type: 'walker', col: 15, row: 50 },
    { type: 'jumper', col: 8, row: 47 },
    { type: 'flyer', col: 12, row: 44 },
    { type: 'shooter', col: 3, row: 44 },
    { type: 'walker', col: 8, row: 41 },
    { type: 'jumper', col: 4, row: 38 },
    { type: 'flyer', col: 15, row: 38 },
    { type: 'shooter', col: 9, row: 35 },
    { type: 'walker', col: 3, row: 32 },
    { type: 'walker', col: 15, row: 32 },
    { type: 'jumper', col: 8, row: 29 },
    { type: 'flyer', col: 4, row: 26 },
    { type: 'shooter', col: 14, row: 26 },
    { type: 'walker', col: 9, row: 23 },
    { type: 'jumper', col: 4, row: 20 },
    { type: 'flyer', col: 15, row: 20 },
    { type: 'shooter', col: 9, row: 17 },
    { type: 'walker', col: 4, row: 14 },
    { type: 'walker', col: 14, row: 14 },
    { type: 'jumper', col: 8, row: 11 },
    { type: 'shooter', col: 4, row: 8 },
    { type: 'shooter', col: 14, row: 8 },
  ],
  items: [
    { type: 'apple', col: 6, row: 64 },
    { type: 'diamond', col: 8, row: 53 },
    { type: 'cherry', col: 4, row: 50 },
    { type: 'shoe', col: 9, row: 47 },
    { type: 'diamond', col: 15, row: 44 },
    { type: 'melon', col: 9, row: 41 },
    { type: 'potion', col: 4, row: 38 },
    { type: 'diamond', col: 9, row: 35 },
    { type: 'cherry', col: 4, row: 32 },
    { type: 'diamond', col: 9, row: 29 },
    { type: 'heart', col: 4, row: 26 },
    { type: 'diamond', col: 9, row: 23 },
    { type: 'melon', col: 9, row: 17 },
    { type: 'diamond', col: 8, row: 11 },
    { type: 'star', col: 9, row: 5 },
  ],
};

// ====== LEVEL 4: COMBAT ISLAND 2 ======
const level4Config = {
  name: 'Combat Island - Round 2',
  displayName: 'Combat Island 2',
  theme: 'cave',
  difficulty: 3,
  waterDelay: 450,
  width: 20,
  height: 65,
  playerStart: { col: 10, row: 62 },
  platforms: [
    // Bottom area
    { col: 3, row: 60, w: 5, type: 3 },
    { col: 13, row: 60, w: 5, type: 3 },

    // Tight zigzag climbing
    { col: 7, row: 57, w: 4, type: 3 },
    { col: 2, row: 54, w: 3, type: 3 },
    { col: 15, row: 54, w: 3, type: 3 },
    { col: 8, row: 51, w: 4, type: 2 },
    { col: 3, row: 48, w: 4, type: 3 },
    { col: 14, row: 48, w: 4, type: 3 },

    // Arena
    { col: 7, row: 45, w: 6, type: 3 },
    { col: 2, row: 42, w: 4, type: 2 },
    { col: 14, row: 42, w: 4, type: 2 },
    { col: 8, row: 39, w: 4, type: 3 },
    { col: 3, row: 36, w: 3, type: 3 },
    { col: 14, row: 36, w: 3, type: 3 },

    // Gauntlet
    { col: 7, row: 33, w: 6, type: 2 },
    { col: 2, row: 30, w: 4, type: 3 },
    { col: 14, row: 30, w: 4, type: 3 },
    { col: 8, row: 27, w: 4, type: 3 },
    { col: 3, row: 24, w: 3, type: 3 },
    { col: 14, row: 24, w: 3, type: 3 },

    // Upper section
    { col: 7, row: 21, w: 6, type: 3 },
    { col: 2, row: 18, w: 4, type: 3 },
    { col: 14, row: 18, w: 4, type: 3 },
    { col: 8, row: 15, w: 4, type: 3 },
    { col: 3, row: 12, w: 5, type: 3 },
    { col: 12, row: 12, w: 5, type: 3 },

    // Goal
    { col: 7, row: 8, w: 6, type: 2 },
    { col: 7, row: 9, w: 6, type: 1 },
  ],
  enemies: [
    { type: 'walker', col: 4, row: 59 },
    { type: 'walker', col: 14, row: 59 },
    { type: 'jumper', col: 8, row: 56 },
    { type: 'shooter', col: 3, row: 53 },
    { type: 'flyer', col: 16, row: 53 },
    { type: 'walker', col: 9, row: 50 },
    { type: 'jumper', col: 4, row: 47 },
    { type: 'shooter', col: 15, row: 47 },
    { type: 'flyer', col: 8, row: 44 },
    { type: 'walker', col: 3, row: 41 },
    { type: 'walker', col: 15, row: 41 },
    { type: 'shooter', col: 9, row: 38 },
    { type: 'jumper', col: 4, row: 35 },
    { type: 'flyer', col: 15, row: 35 },
    { type: 'walker', col: 8, row: 32 },
    { type: 'shooter', col: 3, row: 29 },
    { type: 'shooter', col: 15, row: 29 },
    { type: 'jumper', col: 9, row: 26 },
    { type: 'flyer', col: 4, row: 23 },
    { type: 'walker', col: 15, row: 23 },
    { type: 'shooter', col: 8, row: 20 },
    { type: 'jumper', col: 3, row: 17 },
    { type: 'flyer', col: 15, row: 17 },
    { type: 'shooter', col: 9, row: 14 },
    { type: 'shooter', col: 4, row: 11 },
    { type: 'walker', col: 14, row: 11 },
  ],
  items: [
    { type: 'apple', col: 5, row: 59 },
    { type: 'diamond', col: 9, row: 50 },
    { type: 'cherry', col: 4, row: 47 },
    { type: 'shoe', col: 9, row: 44 },
    { type: 'diamond', col: 15, row: 41 },
    { type: 'potion', col: 4, row: 35 },
    { type: 'diamond', col: 8, row: 32 },
    { type: 'melon', col: 9, row: 26 },
    { type: 'heart', col: 3, row: 29 },
    { type: 'diamond', col: 9, row: 20 },
    { type: 'cherry', col: 4, row: 17 },
    { type: 'diamond', col: 9, row: 14 },
    { type: 'star', col: 9, row: 7 },
  ],
};

// ====== LEVEL 5: MONSTER ISLAND 1 ======
const level5Config = {
  name: 'Monster Island - Round 1',
  displayName: 'Monster Island 1',
  theme: 'volcano',
  difficulty: 3,
  waterDelay: 420,
  width: 20,
  height: 70,
  playerStart: { col: 10, row: 67 },
  platforms: [
    // Bottom area - volcanic cavern
    { col: 3, row: 65, w: 6, type: 3 },
    { col: 12, row: 65, w: 6, type: 3 },

    // Staggered climbing
    { col: 7, row: 62, w: 4, type: 3 },
    { col: 2, row: 59, w: 4, type: 3 },
    { col: 14, row: 59, w: 4, type: 3 },
    { col: 8, row: 56, w: 5, type: 2 },
    { col: 3, row: 53, w: 3, type: 3 },
    { col: 14, row: 53, w: 3, type: 3 },

    // Mid section
    { col: 7, row: 50, w: 6, type: 3 },
    { col: 2, row: 47, w: 5, type: 2 },
    { col: 13, row: 47, w: 5, type: 2 },
    { col: 8, row: 44, w: 4, type: 3 },
    { col: 3, row: 41, w: 3, type: 3 },
    { col: 14, row: 41, w: 3, type: 3 },

    // Challenge zone
    { col: 7, row: 38, w: 6, type: 3 },
    { col: 2, row: 35, w: 4, type: 3 },
    { col: 14, row: 35, w: 4, type: 3 },
    { col: 8, row: 32, w: 4, type: 2 },
    { col: 3, row: 29, w: 3, type: 3 },
    { col: 14, row: 29, w: 3, type: 3 },

    // Upper area
    { col: 7, row: 26, w: 6, type: 3 },
    { col: 2, row: 23, w: 4, type: 3 },
    { col: 14, row: 23, w: 4, type: 3 },
    { col: 8, row: 20, w: 4, type: 3 },
    { col: 3, row: 17, w: 5, type: 3 },
    { col: 12, row: 17, w: 5, type: 3 },
    { col: 7, row: 14, w: 6, type: 3 },
    { col: 3, row: 11, w: 4, type: 3 },
    { col: 13, row: 11, w: 4, type: 3 },

    // Goal
    { col: 7, row: 7, w: 6, type: 2 },
    { col: 7, row: 8, w: 6, type: 1 },
  ],
  enemies: [
    { type: 'walker', col: 4, row: 64 },
    { type: 'walker', col: 14, row: 64 },
    { type: 'jumper', col: 8, row: 61 },
    { type: 'flyer', col: 3, row: 58 },
    { type: 'shooter', col: 15, row: 58 },
    { type: 'walker', col: 9, row: 55 },
    { type: 'jumper', col: 4, row: 52 },
    { type: 'jumper', col: 15, row: 52 },
    { type: 'flyer', col: 8, row: 49 },
    { type: 'shooter', col: 3, row: 46 },
    { type: 'walker', col: 14, row: 46 },
    { type: 'jumper', col: 9, row: 43 },
    { type: 'flyer', col: 4, row: 40 },
    { type: 'shooter', col: 15, row: 40 },
    { type: 'walker', col: 8, row: 37 },
    { type: 'jumper', col: 3, row: 34 },
    { type: 'shooter', col: 15, row: 34 },
    { type: 'flyer', col: 9, row: 31 },
    { type: 'walker', col: 4, row: 28 },
    { type: 'shooter', col: 15, row: 28 },
    { type: 'jumper', col: 8, row: 25 },
    { type: 'flyer', col: 3, row: 22 },
    { type: 'walker', col: 15, row: 22 },
    { type: 'shooter', col: 9, row: 19 },
    { type: 'jumper', col: 4, row: 16 },
    { type: 'flyer', col: 14, row: 16 },
    { type: 'shooter', col: 4, row: 10 },
    { type: 'shooter', col: 14, row: 10 },
  ],
  items: [
    { type: 'apple', col: 5, row: 64 },
    { type: 'cherry', col: 15, row: 64 },
    { type: 'diamond', col: 9, row: 55 },
    { type: 'shoe', col: 4, row: 52 },
    { type: 'diamond', col: 9, row: 49 },
    { type: 'melon', col: 14, row: 46 },
    { type: 'potion', col: 9, row: 43 },
    { type: 'diamond', col: 8, row: 37 },
    { type: 'heart', col: 3, row: 34 },
    { type: 'diamond', col: 9, row: 31 },
    { type: 'cherry', col: 4, row: 28 },
    { type: 'diamond', col: 9, row: 25 },
    { type: 'melon', col: 9, row: 19 },
    { type: 'diamond', col: 8, row: 13 },
    { type: 'star', col: 9, row: 6 },
  ],
};

// ====== LEVEL 6: MONSTER ISLAND 2 ======
const level6Config = {
  name: 'Monster Island - Round 2',
  displayName: 'Monster Island 2',
  theme: 'volcano',
  difficulty: 4,
  waterDelay: 390,
  width: 20,
  height: 75,
  playerStart: { col: 3, row: 72 },
  platforms: [
    // Bottom area
    { col: 6, row: 70, w: 4, type: 3 },
    { col: 13, row: 69, w: 5, type: 3 },

    // Narrow climbing
    { col: 2, row: 66, w: 3, type: 3 },
    { col: 15, row: 64, w: 3, type: 3 },
    { col: 7, row: 62, w: 3, type: 3 },
    { col: 2, row: 60, w: 3, type: 3 },
    { col: 15, row: 58, w: 3, type: 3 },
    { col: 8, row: 56, w: 4, type: 2 },

    // Mid arena
    { col: 2, row: 53, w: 5, type: 2 },
    { col: 13, row: 53, w: 5, type: 2 },
    { col: 7, row: 50, w: 6, type: 3 },
    { col: 3, row: 47, w: 3, type: 3 },
    { col: 14, row: 47, w: 3, type: 3 },
    { col: 8, row: 44, w: 4, type: 3 },

    // Gauntlet
    { col: 2, row: 41, w: 4, type: 3 },
    { col: 14, row: 41, w: 4, type: 3 },
    { col: 7, row: 38, w: 6, type: 2 },
    { col: 3, row: 35, w: 3, type: 3 },
    { col: 14, row: 35, w: 3, type: 3 },
    { col: 8, row: 32, w: 4, type: 3 },
    { col: 2, row: 29, w: 4, type: 3 },
    { col: 14, row: 29, w: 4, type: 3 },

    // Upper
    { col: 7, row: 26, w: 6, type: 3 },
    { col: 2, row: 23, w: 4, type: 3 },
    { col: 14, row: 23, w: 4, type: 3 },
    { col: 8, row: 20, w: 4, type: 3 },
    { col: 3, row: 17, w: 4, type: 3 },
    { col: 13, row: 17, w: 4, type: 3 },
    { col: 7, row: 14, w: 6, type: 3 },
    { col: 3, row: 11, w: 4, type: 3 },
    { col: 13, row: 11, w: 4, type: 3 },

    // Goal
    { col: 7, row: 7, w: 6, type: 2 },
    { col: 7, row: 8, w: 6, type: 1 },
  ],
  enemies: [
    { type: 'walker', col: 7, row: 69 },
    { type: 'jumper', col: 14, row: 68 },
    { type: 'flyer', col: 3, row: 65 },
    { type: 'shooter', col: 16, row: 63 },
    { type: 'walker', col: 8, row: 61 },
    { type: 'jumper', col: 3, row: 59 },
    { type: 'shooter', col: 16, row: 57 },
    { type: 'flyer', col: 9, row: 55 },
    { type: 'walker', col: 3, row: 52 },
    { type: 'walker', col: 14, row: 52 },
    { type: 'shooter', col: 8, row: 49 },
    { type: 'jumper', col: 4, row: 46 },
    { type: 'flyer', col: 15, row: 46 },
    { type: 'shooter', col: 9, row: 43 },
    { type: 'walker', col: 3, row: 40 },
    { type: 'jumper', col: 15, row: 40 },
    { type: 'flyer', col: 8, row: 37 },
    { type: 'shooter', col: 4, row: 34 },
    { type: 'shooter', col: 15, row: 34 },
    { type: 'jumper', col: 9, row: 31 },
    { type: 'walker', col: 3, row: 28 },
    { type: 'walker', col: 15, row: 28 },
    { type: 'flyer', col: 8, row: 25 },
    { type: 'shooter', col: 3, row: 22 },
    { type: 'shooter', col: 15, row: 22 },
    { type: 'jumper', col: 9, row: 19 },
    { type: 'flyer', col: 4, row: 16 },
    { type: 'walker', col: 14, row: 16 },
    { type: 'shooter', col: 8, row: 13 },
    { type: 'shooter', col: 4, row: 10 },
    { type: 'shooter', col: 14, row: 10 },
  ],
  items: [
    { type: 'apple', col: 8, row: 69 },
    { type: 'diamond', col: 9, row: 55 },
    { type: 'cherry', col: 3, row: 52 },
    { type: 'shoe', col: 9, row: 49 },
    { type: 'diamond', col: 9, row: 43 },
    { type: 'potion', col: 4, row: 40 },
    { type: 'heart', col: 8, row: 37 },
    { type: 'diamond', col: 9, row: 31 },
    { type: 'melon', col: 3, row: 28 },
    { type: 'diamond', col: 9, row: 25 },
    { type: 'cherry', col: 9, row: 19 },
    { type: 'potion', col: 4, row: 16 },
    { type: 'diamond', col: 8, row: 13 },
    { type: 'star', col: 9, row: 6 },
  ],
};

// ====== LEVEL 7: DOH'S ISLAND 1 ======
const level7Config = {
  name: "Doh's Island - Round 1",
  displayName: "Doh's Island 1",
  theme: 'sky',
  difficulty: 4,
  waterDelay: 360,
  width: 20,
  height: 70,
  playerStart: { col: 10, row: 67 },
  platforms: [
    // Bottom - sky fortress
    { col: 4, row: 65, w: 5, type: 3 },
    { col: 12, row: 65, w: 5, type: 3 },

    // Floating platforms - irregular spacing
    { col: 7, row: 62, w: 3, type: 3 },
    { col: 2, row: 59, w: 3, type: 3 },
    { col: 15, row: 60, w: 3, type: 3 },
    { col: 9, row: 57, w: 3, type: 3 },
    { col: 4, row: 54, w: 4, type: 2 },
    { col: 13, row: 55, w: 4, type: 3 },

    // Mid sky section
    { col: 8, row: 51, w: 4, type: 3 },
    { col: 2, row: 48, w: 4, type: 3 },
    { col: 14, row: 48, w: 4, type: 3 },
    { col: 7, row: 45, w: 6, type: 2 },
    { col: 3, row: 42, w: 3, type: 3 },
    { col: 14, row: 42, w: 3, type: 3 },

    // Challenge zone
    { col: 8, row: 39, w: 4, type: 3 },
    { col: 2, row: 36, w: 3, type: 3 },
    { col: 15, row: 36, w: 3, type: 3 },
    { col: 7, row: 33, w: 6, type: 3 },
    { col: 3, row: 30, w: 3, type: 3 },
    { col: 14, row: 30, w: 3, type: 3 },

    // Upper fortress
    { col: 8, row: 27, w: 4, type: 2 },
    { col: 2, row: 24, w: 4, type: 3 },
    { col: 14, row: 24, w: 4, type: 3 },
    { col: 7, row: 21, w: 6, type: 3 },
    { col: 3, row: 18, w: 4, type: 3 },
    { col: 13, row: 18, w: 4, type: 3 },
    { col: 7, row: 15, w: 6, type: 3 },
    { col: 3, row: 12, w: 4, type: 3 },
    { col: 13, row: 12, w: 4, type: 3 },

    // Goal
    { col: 7, row: 8, w: 6, type: 2 },
    { col: 7, row: 9, w: 6, type: 1 },
  ],
  enemies: [
    { type: 'walker', col: 5, row: 64 },
    { type: 'shooter', col: 14, row: 64 },
    { type: 'flyer', col: 8, row: 61 },
    { type: 'jumper', col: 3, row: 58 },
    { type: 'shooter', col: 16, row: 59 },
    { type: 'flyer', col: 10, row: 56 },
    { type: 'walker', col: 5, row: 53 },
    { type: 'shooter', col: 14, row: 54 },
    { type: 'jumper', col: 9, row: 50 },
    { type: 'flyer', col: 3, row: 47 },
    { type: 'shooter', col: 15, row: 47 },
    { type: 'walker', col: 8, row: 44 },
    { type: 'jumper', col: 4, row: 41 },
    { type: 'shooter', col: 15, row: 41 },
    { type: 'flyer', col: 9, row: 38 },
    { type: 'walker', col: 3, row: 35 },
    { type: 'shooter', col: 16, row: 35 },
    { type: 'jumper', col: 8, row: 32 },
    { type: 'flyer', col: 4, row: 29 },
    { type: 'shooter', col: 15, row: 29 },
    { type: 'walker', col: 9, row: 26 },
    { type: 'jumper', col: 3, row: 23 },
    { type: 'shooter', col: 15, row: 23 },
    { type: 'flyer', col: 8, row: 20 },
    { type: 'shooter', col: 4, row: 17 },
    { type: 'jumper', col: 14, row: 17 },
    { type: 'flyer', col: 8, row: 14 },
    { type: 'shooter', col: 4, row: 11 },
    { type: 'shooter', col: 14, row: 11 },
  ],
  items: [
    { type: 'apple', col: 6, row: 64 },
    { type: 'diamond', col: 10, row: 56 },
    { type: 'cherry', col: 5, row: 53 },
    { type: 'shoe', col: 9, row: 50 },
    { type: 'diamond', col: 8, row: 44 },
    { type: 'potion', col: 4, row: 41 },
    { type: 'heart', col: 9, row: 38 },
    { type: 'diamond', col: 8, row: 32 },
    { type: 'melon', col: 4, row: 29 },
    { type: 'diamond', col: 9, row: 26 },
    { type: 'potion', col: 8, row: 20 },
    { type: 'diamond', col: 8, row: 14 },
    { type: 'star', col: 9, row: 7 },
  ],
};

// ====== LEVEL 8: DOH'S ISLAND 2 (FINAL) ======
const level8Config = {
  name: "Doh's Island - Round 2",
  displayName: "Doh's Island 2",
  theme: 'sky',
  difficulty: 5,
  waterDelay: 300,
  width: 20,
  height: 80,
  playerStart: { col: 10, row: 77 },
  platforms: [
    // Bottom area
    { col: 4, row: 75, w: 4, type: 3 },
    { col: 12, row: 75, w: 4, type: 3 },

    // Punishing climb
    { col: 7, row: 72, w: 3, type: 3 },
    { col: 2, row: 69, w: 3, type: 3 },
    { col: 15, row: 70, w: 3, type: 3 },
    { col: 8, row: 67, w: 3, type: 3 },
    { col: 3, row: 64, w: 3, type: 3 },
    { col: 14, row: 65, w: 3, type: 3 },
    { col: 8, row: 62, w: 4, type: 2 },

    // Mid fortress
    { col: 2, row: 59, w: 4, type: 3 },
    { col: 14, row: 59, w: 4, type: 3 },
    { col: 7, row: 56, w: 6, type: 2 },
    { col: 3, row: 53, w: 3, type: 3 },
    { col: 14, row: 53, w: 3, type: 3 },
    { col: 8, row: 50, w: 4, type: 3 },

    // Gauntlet of shooters
    { col: 2, row: 47, w: 3, type: 3 },
    { col: 15, row: 47, w: 3, type: 3 },
    { col: 7, row: 44, w: 6, type: 3 },
    { col: 3, row: 41, w: 3, type: 3 },
    { col: 14, row: 41, w: 3, type: 3 },
    { col: 8, row: 38, w: 4, type: 2 },

    // Upper fortress
    { col: 2, row: 35, w: 4, type: 3 },
    { col: 14, row: 35, w: 4, type: 3 },
    { col: 7, row: 32, w: 6, type: 3 },
    { col: 3, row: 29, w: 3, type: 3 },
    { col: 14, row: 29, w: 3, type: 3 },
    { col: 8, row: 26, w: 4, type: 3 },
    { col: 2, row: 23, w: 4, type: 3 },
    { col: 14, row: 23, w: 4, type: 3 },

    // Final stretch
    { col: 7, row: 20, w: 6, type: 3 },
    { col: 3, row: 17, w: 4, type: 3 },
    { col: 13, row: 17, w: 4, type: 3 },
    { col: 7, row: 14, w: 6, type: 3 },
    { col: 3, row: 11, w: 4, type: 3 },
    { col: 13, row: 11, w: 4, type: 3 },

    // Goal
    { col: 7, row: 7, w: 6, type: 2 },
    { col: 7, row: 8, w: 6, type: 1 },
  ],
  enemies: [
    { type: 'walker', col: 5, row: 74 },
    { type: 'shooter', col: 13, row: 74 },
    { type: 'flyer', col: 8, row: 71 },
    { type: 'jumper', col: 3, row: 68 },
    { type: 'shooter', col: 16, row: 69 },
    { type: 'flyer', col: 9, row: 66 },
    { type: 'walker', col: 4, row: 63 },
    { type: 'shooter', col: 15, row: 64 },
    { type: 'jumper', col: 9, row: 61 },
    { type: 'flyer', col: 3, row: 58 },
    { type: 'shooter', col: 15, row: 58 },
    { type: 'walker', col: 8, row: 55 },
    { type: 'jumper', col: 4, row: 52 },
    { type: 'shooter', col: 15, row: 52 },
    { type: 'flyer', col: 9, row: 49 },
    { type: 'shooter', col: 3, row: 46 },
    { type: 'shooter', col: 16, row: 46 },
    { type: 'jumper', col: 8, row: 43 },
    { type: 'walker', col: 4, row: 40 },
    { type: 'shooter', col: 15, row: 40 },
    { type: 'flyer', col: 9, row: 37 },
    { type: 'shooter', col: 3, row: 34 },
    { type: 'shooter', col: 15, row: 34 },
    { type: 'jumper', col: 8, row: 31 },
    { type: 'flyer', col: 4, row: 28 },
    { type: 'shooter', col: 15, row: 28 },
    { type: 'walker', col: 9, row: 25 },
    { type: 'shooter', col: 3, row: 22 },
    { type: 'jumper', col: 15, row: 22 },
    { type: 'flyer', col: 8, row: 19 },
    { type: 'shooter', col: 4, row: 16 },
    { type: 'shooter', col: 14, row: 16 },
    { type: 'jumper', col: 8, row: 13 },
    { type: 'shooter', col: 4, row: 10 },
    { type: 'shooter', col: 14, row: 10 },
  ],
  items: [
    { type: 'apple', col: 6, row: 74 },
    { type: 'diamond', col: 9, row: 66 },
    { type: 'cherry', col: 4, row: 63 },
    { type: 'shoe', col: 9, row: 61 },
    { type: 'diamond', col: 8, row: 55 },
    { type: 'heart', col: 4, row: 52 },
    { type: 'potion', col: 9, row: 49 },
    { type: 'diamond', col: 8, row: 43 },
    { type: 'melon', col: 4, row: 40 },
    { type: 'heart', col: 9, row: 37 },
    { type: 'diamond', col: 8, row: 31 },
    { type: 'potion', col: 4, row: 28 },
    { type: 'diamond', col: 9, row: 25 },
    { type: 'melon', col: 8, row: 19 },
    { type: 'diamond', col: 8, row: 13 },
    { type: 'star', col: 9, row: 6 },
  ],
};

// All levels
const LEVEL_CONFIGS = [level1Config, level2Config, level3Config, level4Config, level5Config, level6Config, level7Config, level8Config];

export function getLevelCount() {
  return LEVEL_CONFIGS.length;
}

export function loadLevel(index) {
  if (index < 0 || index >= LEVEL_CONFIGS.length) {
    return null;
  }
  return generateLevel(LEVEL_CONFIGS[index]);
}

// Level info for level select screen
export function getLevelInfo(index) {
  if (index < 0 || index >= LEVEL_CONFIGS.length) return null;
  const cfg = LEVEL_CONFIGS[index];
  return {
    name: cfg.name,
    displayName: cfg.displayName || cfg.name,
    theme: cfg.theme,
    difficulty: cfg.difficulty || 1,
    height: cfg.height,
  };
}

export function getAllLevelInfo() {
  return LEVEL_CONFIGS.map((cfg, i) => getLevelInfo(i));
}

// Water system
export function createWater(levelHeight, waterDelay) {
  return {
    y: levelHeight * TILE_SIZE + 100, // starts below level
    baseSpeed: WATER_BASE_SPEED,
    speed: 0,
    accel: WATER_ACCEL,
    delay: waterDelay != null ? waterDelay : WATER_DELAY_FRAMES,
    active: false,
    warningShown: false,
  };
}

export function updateWater(water) {
  if (water.delay > 0) {
    water.delay--;
    if (water.delay === 120) {
      water.warningShown = true; // Show warning
    }
    return;
  }

  if (!water.active) {
    water.active = true;
    water.speed = water.baseSpeed;
  }

  water.speed += water.accel;
  water.y -= water.speed;
}

export function isInWater(y, water) {
  return y > water.y;
}
