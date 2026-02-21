// Enemy types and AI
import {
  ENEMY_WALKER_SPEED, ENEMY_FLYER_SPEED, ENEMY_JUMPER_SPEED,
  ENEMY_PROJECTILE_SPEED, GRAVITY, MAX_FALL_SPEED, TILE_SIZE,
  SCORE_ENEMY_KILL, SCORE_CHAIN_MULT,
} from './config.js';
import { resolveEntityTileCollision, getTileAt, isTileSolid, randFloat, randInt, aabbOverlap } from './utils.js';
import { sfxEnemyHit, sfxEnemyDie } from './audio.js';
import { spawnEnemyDeath } from './particles.js';

export function createEnemy(type, x, y) {
  const base = {
    type,
    x, y,
    vx: 0,
    vy: 0,
    hitboxOffX: 2,
    hitboxOffY: 2,
    hitboxW: 12,
    hitboxH: 12,
    spriteW: 16,
    spriteH: 16,
    active: true,
    facingRight: Math.random() > 0.5,
    animFrame: 0,
    animTimer: 0,
    hp: 1,
    flashTimer: 0,
    deathTimer: 0,
    // Drop info
    dropType: null,
  };

  switch (type) {
    case 'walker':
      base.vx = (base.facingRight ? 1 : -1) * ENEMY_WALKER_SPEED;
      base.dropType = 'fruit';
      break;
    case 'flyer':
      base.vx = (base.facingRight ? 1 : -1) * ENEMY_FLYER_SPEED;
      base.baseY = y;
      base.flyTimer = randFloat(0, Math.PI * 2);
      base.hitboxOffY = 0;
      base.dropType = 'fruit';
      break;
    case 'jumper':
      base.jumpTimer = randInt(30, 90);
      base.dropType = 'diamond';
      break;
    case 'shooter':
      base.shootTimer = randInt(60, 120);
      base.shootCooldown = 120;
      base.dropType = 'fruit';
      break;
  }

  return base;
}

export function updateEnemy(enemy, level, playerX, playerY, projectiles) {
  if (!enemy.active) return;

  if (enemy.flashTimer > 0) enemy.flashTimer--;

  // Animation
  enemy.animTimer++;
  if (enemy.animTimer > 12) {
    enemy.animTimer = 0;
    enemy.animFrame = (enemy.animFrame + 1) % 2;
  }

  switch (enemy.type) {
    case 'walker':
      updateWalker(enemy, level);
      break;
    case 'flyer':
      updateFlyer(enemy, level, playerX);
      break;
    case 'jumper':
      updateJumper(enemy, level, playerX, playerY);
      break;
    case 'shooter':
      updateShooter(enemy, level, playerX, playerY, projectiles);
      break;
  }
}

function updateWalker(enemy, level) {
  // Apply gravity
  enemy.vy += GRAVITY;
  enemy.vy = Math.min(enemy.vy, MAX_FALL_SPEED);

  // Move
  enemy.vx = (enemy.facingRight ? 1 : -1) * ENEMY_WALKER_SPEED;

  // Resolve collision
  const result = resolveEntityTileCollision(enemy, level);
  enemy.x = result.x;
  enemy.y = result.y;

  if (result.hitWall) {
    enemy.facingRight = !enemy.facingRight;
    enemy.vx = -enemy.vx;
  }

  enemy.vy = result.vy;

  // Check for edge - turn around if about to walk off a platform
  if (result.onGround) {
    const checkX = enemy.facingRight
      ? enemy.x + enemy.spriteW + 2
      : enemy.x - 2;
    const checkY = enemy.y + enemy.spriteH + 2;
    const col = Math.floor(checkX / TILE_SIZE);
    const row = Math.floor(checkY / TILE_SIZE);
    const tileBelow = getTileAt(level, col, row);
    if (!isTileSolid(tileBelow) && tileBelow !== 3) {
      enemy.facingRight = !enemy.facingRight;
    }
  }
}

function updateFlyer(enemy, level, playerX) {
  enemy.flyTimer += 0.04;

  // Fly in sine wave pattern
  enemy.vx = (enemy.facingRight ? 1 : -1) * ENEMY_FLYER_SPEED;
  enemy.y = enemy.baseY + Math.sin(enemy.flyTimer) * 20;

  enemy.x += enemy.vx;

  // Bounce off walls
  if (enemy.x < 0 || enemy.x + enemy.spriteW > level.width * TILE_SIZE) {
    enemy.facingRight = !enemy.facingRight;
    enemy.x = Math.max(0, Math.min(enemy.x, level.width * TILE_SIZE - enemy.spriteW));
  }

  // Occasionally change direction toward player
  if (Math.random() < 0.005) {
    enemy.facingRight = playerX > enemy.x;
  }
}

function updateJumper(enemy, level, playerX, playerY) {
  // Apply gravity
  enemy.vy += GRAVITY;
  enemy.vy = Math.min(enemy.vy, MAX_FALL_SPEED);

  // Resolve collision
  const result = resolveEntityTileCollision(enemy, level);
  enemy.x = result.x;
  enemy.y = result.y;
  enemy.vy = result.vy;

  if (result.onGround) {
    enemy.jumpTimer--;
    if (enemy.jumpTimer <= 0) {
      // Jump toward player
      enemy.vy = -5 - Math.random() * 2;
      enemy.vx = (playerX > enemy.x ? 1 : -1) * ENEMY_JUMPER_SPEED * (1 + Math.random());
      enemy.facingRight = enemy.vx > 0;
      enemy.jumpTimer = randInt(40, 80);
    } else {
      enemy.vx *= 0.8; // Friction on ground
    }
  }

  if (result.hitWall) {
    enemy.vx = -enemy.vx;
    enemy.facingRight = !enemy.facingRight;
  }
}

function updateShooter(enemy, level, playerX, playerY, projectiles) {
  // Stationary enemy that shoots at player
  enemy.facingRight = playerX > enemy.x;

  enemy.shootTimer--;
  if (enemy.shootTimer <= 0) {
    enemy.shootTimer = enemy.shootCooldown;

    // Fire projectile toward player
    const dx = playerX - enemy.x;
    const dy = playerY - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0 && dist < 200) { // Only shoot if player is nearby
      const pvx = (dx / dist) * ENEMY_PROJECTILE_SPEED;
      const pvy = (dy / dist) * ENEMY_PROJECTILE_SPEED;
      projectiles.push(createProjectile(
        enemy.x + enemy.spriteW / 2,
        enemy.y + enemy.spriteH / 2,
        pvx, pvy
      ));
    }
  }

  // Slight gravity
  enemy.vy += GRAVITY;
  enemy.vy = Math.min(enemy.vy, MAX_FALL_SPEED);
  const result = resolveEntityTileCollision(enemy, level);
  enemy.x = result.x;
  enemy.y = result.y;
  enemy.vy = result.vy;
}

// Projectiles
export function createProjectile(x, y, vx, vy) {
  return {
    x, y, vx, vy,
    w: 6, h: 6,
    active: true,
    lifetime: 180,
  };
}

export function updateProjectiles(projectiles, level) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.lifetime--;

    // Check tile collision
    const col = Math.floor(p.x / TILE_SIZE);
    const row = Math.floor(p.y / TILE_SIZE);
    if (isTileSolid(getTileAt(level, col, row))) {
      p.active = false;
    }

    if (p.lifetime <= 0) {
      p.active = false;
    }

    if (!p.active) {
      projectiles.splice(i, 1);
    }
  }
}

// Damage an enemy
export function hitEnemy(enemy, chainCount = 0) {
  if (!enemy.active) return 0;

  enemy.hp--;
  if (enemy.hp <= 0) {
    enemy.active = false;
    sfxEnemyDie();
    const color = getEnemyColor(enemy.type);
    spawnEnemyDeath(
      enemy.x + enemy.spriteW / 2,
      enemy.y + enemy.spriteH / 2,
      color
    );
    // Score with chain multiplier
    return Math.floor(SCORE_ENEMY_KILL * Math.pow(SCORE_CHAIN_MULT, chainCount));
  } else {
    enemy.flashTimer = 10;
    sfxEnemyHit();
    return 0;
  }
}

function getEnemyColor(type) {
  switch (type) {
    case 'walker': return '#44BB44';
    case 'flyer': return '#FFCC00';
    case 'jumper': return '#4488FF';
    case 'shooter': return '#AA44CC';
    default: return '#FFFFFF';
  }
}

export function getEnemyHitbox(enemy) {
  return {
    x: enemy.x + enemy.hitboxOffX,
    y: enemy.y + enemy.hitboxOffY,
    w: enemy.hitboxW,
    h: enemy.hitboxH,
  };
}
