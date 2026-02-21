import { TILE_SIZE, TILE_EMPTY, TILE_PLATFORM } from './config.js';

// AABB collision check
export function aabbOverlap(a, b) {
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}

// Check if point is inside AABB
export function pointInRect(px, py, rect) {
  return px >= rect.x && px < rect.x + rect.w &&
         py >= rect.y && py < rect.y + rect.h;
}

// Clamp a value between min and max
export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// Linear interpolation
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Distance between two points
export function dist(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

// Get tile at world position from level data
export function getTile(level, worldX, worldY) {
  const col = Math.floor(worldX / TILE_SIZE);
  const row = Math.floor(worldY / TILE_SIZE);
  if (col < 0 || col >= level.width || row < 0 || row >= level.height) {
    // Out of bounds - top is empty, sides and bottom are solid
    if (row < 0) return TILE_EMPTY;
    return 1; // solid
  }
  return level.tiles[row][col];
}

// Check if a tile is solid for collision (not one-way platform)
export function isTileSolid(tileType) {
  return tileType === 1 || tileType === 2; // TILE_SOLID or TILE_GRASS
}

// Check if a tile is a platform (one-way)
export function isTilePlatform(tileType) {
  return tileType === TILE_PLATFORM;
}

// Resolve collision between entity and tiles
// Returns adjusted position and collision flags
export function resolveEntityTileCollision(entity, level) {
  const result = {
    x: entity.x,
    y: entity.y,
    vx: entity.vx,
    vy: entity.vy,
    onGround: false,
    hitCeiling: false,
    hitWall: false,
  };

  // Move horizontally first
  result.x += entity.vx;

  // Check horizontal collisions
  const hitboxX = result.x + entity.hitboxOffX;
  const hitboxY = entity.y + entity.hitboxOffY;
  const hitboxW = entity.hitboxW;
  const hitboxH = entity.hitboxH;

  // Check tiles the entity overlaps horizontally
  const startCol = Math.floor(hitboxX / TILE_SIZE);
  const endCol = Math.floor((hitboxX + hitboxW - 0.01) / TILE_SIZE);
  const startRow = Math.floor(hitboxY / TILE_SIZE);
  const endRow = Math.floor((hitboxY + hitboxH - 0.01) / TILE_SIZE);

  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const tile = getTileAt(level, col, row);
      if (isTileSolid(tile)) {
        // Resolve horizontal collision
        if (entity.vx > 0) {
          result.x = col * TILE_SIZE - entity.hitboxOffX - hitboxW;
        } else if (entity.vx < 0) {
          result.x = (col + 1) * TILE_SIZE - entity.hitboxOffX;
        }
        result.vx = 0;
        result.hitWall = true;
      }
    }
  }

  // Move vertically
  result.y += entity.vy;

  // Check vertical collisions
  const hitboxX2 = result.x + entity.hitboxOffX;
  const hitboxY2 = result.y + entity.hitboxOffY;

  const startCol2 = Math.floor(hitboxX2 / TILE_SIZE);
  const endCol2 = Math.floor((hitboxX2 + hitboxW - 0.01) / TILE_SIZE);
  const startRow2 = Math.floor(hitboxY2 / TILE_SIZE);
  const endRow2 = Math.floor((hitboxY2 + hitboxH - 0.01) / TILE_SIZE);

  for (let row = startRow2; row <= endRow2; row++) {
    for (let col = startCol2; col <= endCol2; col++) {
      const tile = getTileAt(level, col, row);

      if (isTileSolid(tile)) {
        if (entity.vy > 0) {
          result.y = row * TILE_SIZE - entity.hitboxOffY - hitboxH;
          result.onGround = true;
        } else if (entity.vy < 0) {
          result.y = (row + 1) * TILE_SIZE - entity.hitboxOffY;
          result.hitCeiling = true;
        }
        result.vy = 0;
      } else if (isTilePlatform(tile) && entity.vy > 0) {
        // One-way platform: only collide when falling and feet were above platform
        const platformTop = row * TILE_SIZE;
        const feetBefore = entity.y + entity.hitboxOffY + hitboxH;
        if (feetBefore <= platformTop + 2) { // small tolerance
          result.y = platformTop - entity.hitboxOffY - hitboxH;
          result.vy = 0;
          result.onGround = true;
        }
      }
    }
  }

  return result;
}

// Get tile by grid coordinates
export function getTileAt(level, col, row) {
  if (col < 0 || col >= level.width || row < 0 || row >= level.height) {
    if (row < 0) return TILE_EMPTY;
    if (col < 0 || col >= level.width) return 1; // walls
    return TILE_EMPTY;
  }
  return level.tiles[row][col];
}

// Random integer in range [min, max]
export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Random float in range [min, max)
export function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}

// Choose random element from array
export function choose(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Sign of a number (-1, 0, or 1)
export function sign(n) {
  return n > 0 ? 1 : n < 0 ? -1 : 0;
}

// Approach target value by amount
export function approach(current, target, amount) {
  if (current < target) {
    return Math.min(current + amount, target);
  } else if (current > target) {
    return Math.max(current - amount, target);
  }
  return target;
}
