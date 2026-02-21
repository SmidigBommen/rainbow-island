// Player character with polished platformer physics
import {
  GRAVITY, MAX_FALL_SPEED, FALL_GRAVITY_MULT,
  PLAYER_MAX_SPEED, PLAYER_ACCEL, PLAYER_DECEL,
  PLAYER_AIR_ACCEL, PLAYER_AIR_DECEL,
  PLAYER_JUMP_VEL, PLAYER_JUMP_CUT_MULT,
  COYOTE_FRAMES, JUMP_BUFFER_FRAMES,
  PLAYER_WIDTH, PLAYER_HEIGHT,
  TILE_SIZE, GAME_WIDTH, GAME_HEIGHT,
} from './config.js';
import * as Input from './input.js';
import { resolveEntityTileCollision, clamp, approach } from './utils.js';
import { sfxJump } from './audio.js';
import { spawnJumpDust, spawnLandDust } from './particles.js';

export function createPlayer(x, y) {
  return {
    x, y,
    vx: 0,
    vy: 0,
    // Hitbox offset from sprite position
    hitboxOffX: 3,
    hitboxOffY: 4,
    hitboxW: PLAYER_WIDTH,
    hitboxH: PLAYER_HEIGHT,
    // Sprite dimensions
    spriteW: 16,
    spriteH: 24,
    // State
    onGround: false,
    wasOnGround: false,
    facingRight: true,
    // Coyote time and jump buffer
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    // Animation
    animState: 'idle',
    animFrame: 0,
    animTimer: 0,
    // Abilities
    maxRainbows: 2,
    speedBoost: 0,
    // Combat
    lives: 3,
    invincible: 0,
    dead: false,
    deathTimer: 0,
    // Shooting
    shootCooldown: 0,
    shootAnimTimer: 0,
    // Score
    score: 0,
    diamonds: 0,
    // Effects
    flashTimer: 0,
  };
}

export function updatePlayer(player, level, rainbows) {
  if (player.dead) {
    player.deathTimer--;
    player.vy += GRAVITY;
    player.y += player.vy;
    return;
  }

  // Invincibility frames
  if (player.invincible > 0) {
    player.invincible--;
    player.flashTimer++;
  } else {
    player.flashTimer = 0;
  }

  // Shoot cooldown
  if (player.shootCooldown > 0) player.shootCooldown--;
  if (player.shootAnimTimer > 0) player.shootAnimTimer--;

  const maxSpeed = PLAYER_MAX_SPEED + (player.speedBoost > 0 ? 0.8 : 0);
  const wasOnGround = player.onGround;

  // --- Horizontal movement ---
  const moveDir = (Input.rightDown() ? 1 : 0) - (Input.leftDown() ? 1 : 0);

  if (moveDir !== 0) {
    player.facingRight = moveDir > 0;
    const accel = player.onGround ? PLAYER_ACCEL : PLAYER_AIR_ACCEL;
    // Extra acceleration when changing direction
    if (Math.sign(player.vx) === -moveDir && player.vx !== 0) {
      player.vx = approach(player.vx, moveDir * maxSpeed, accel * 2.5);
    } else {
      player.vx = approach(player.vx, moveDir * maxSpeed, accel);
    }
  } else {
    const decel = player.onGround ? PLAYER_DECEL : PLAYER_AIR_DECEL;
    player.vx = approach(player.vx, 0, decel);
  }

  // --- Coyote time ---
  if (player.onGround) {
    player.coyoteTimer = COYOTE_FRAMES;
  } else if (player.coyoteTimer > 0) {
    player.coyoteTimer--;
  }

  // --- Jump buffer ---
  if (Input.jumpPressed()) {
    player.jumpBufferTimer = JUMP_BUFFER_FRAMES;
  } else if (player.jumpBufferTimer > 0) {
    player.jumpBufferTimer--;
  }

  // --- Jump ---
  if (player.jumpBufferTimer > 0 && player.coyoteTimer > 0) {
    player.vy = PLAYER_JUMP_VEL;
    player.onGround = false;
    player.coyoteTimer = 0;
    player.jumpBufferTimer = 0;
    sfxJump();
    spawnJumpDust(player.x + player.spriteW / 2, player.y + player.spriteH);
  }

  // --- Variable jump height (release early = less height) ---
  if (Input.jumpReleased() && player.vy < 0) {
    player.vy *= PLAYER_JUMP_CUT_MULT;
  }

  // --- Gravity ---
  if (player.vy > 0) {
    // Faster falling for snappy feel
    player.vy += GRAVITY * FALL_GRAVITY_MULT;
  } else {
    player.vy += GRAVITY;
  }
  player.vy = Math.min(player.vy, MAX_FALL_SPEED);

  // --- Tile collision ---
  const result = resolveEntityTileCollision(player, level);
  player.x = result.x;
  player.y = result.y;
  player.vx = result.vx;
  player.vy = result.vy;
  player.onGround = result.onGround;

  // --- Rainbow platform collision ---
  if (!player.onGround && player.vy >= 0) {
    for (const rb of rainbows) {
      if (!rb.active || rb.falling) continue;
      for (let si = 0; si < rb.segments.length; si++) {
        const seg = rb.segments[si];
        const nextSeg = rb.segments[si + 1];
        const segW = nextSeg ? Math.ceil(Math.abs(nextSeg.x - seg.x)) + 1 : 4;
        const rainbowTop = seg.y - 7; // Top of rainbow bands
        const segBox = {
          x: seg.x, y: rainbowTop,
          w: segW, h: 6,
        };
        const feetBox = {
          x: player.x + player.hitboxOffX,
          y: player.y + player.hitboxOffY + player.hitboxH - 4,
          w: player.hitboxW,
          h: 6,
        };
        if (feetBox.x < segBox.x + segBox.w &&
            feetBox.x + feetBox.w > segBox.x &&
            feetBox.y < segBox.y + segBox.h &&
            feetBox.y + feetBox.h > segBox.y) {
          // Land on top of rainbow
          player.y = rainbowTop - player.hitboxOffY - player.hitboxH + 2;
          player.vy = 0;
          player.onGround = true;
          player.coyoteTimer = COYOTE_FRAMES;
          break;
        }
      }
      if (player.onGround) break;
    }
  }

  // --- Landing effects ---
  if (player.onGround && !wasOnGround && player.vy >= 0) {
    spawnLandDust(player.x + player.spriteW / 2, player.y + player.spriteH);
  }

  // --- Keep in bounds horizontally ---
  if (player.x < 0) {
    player.x = 0;
    player.vx = 0;
  }
  if (player.x + player.spriteW > level.width * TILE_SIZE) {
    player.x = level.width * TILE_SIZE - player.spriteW;
    player.vx = 0;
  }

  // --- Update animation ---
  updateAnimation(player);

  // Speed boost timer
  if (player.speedBoost > 0) player.speedBoost--;
}

function updateAnimation(player) {
  player.animTimer++;

  if (player.shootAnimTimer > 0) {
    player.animState = 'shoot';
    player.animFrame = 0;
  } else if (!player.onGround) {
    if (player.vy < 0) {
      player.animState = 'jump';
    } else {
      player.animState = 'fall';
    }
    player.animFrame = 0;
  } else if (Math.abs(player.vx) > 0.3) {
    player.animState = 'run';
    if (player.animTimer > 6) {
      player.animTimer = 0;
      player.animFrame = (player.animFrame + 1) % 4;
    }
  } else {
    player.animState = 'idle';
    if (player.animTimer > 30) {
      player.animTimer = 0;
      player.animFrame = (player.animFrame + 1) % 2;
    }
  }
}

export function hurtPlayer(player) {
  if (player.invincible > 0 || player.dead) return false;

  player.lives--;
  if (player.lives <= 0) {
    player.dead = true;
    player.deathTimer = 120;
    player.vy = PLAYER_JUMP_VEL;
    return true;
  }
  player.invincible = 90; // 1.5 seconds
  player.vy = PLAYER_JUMP_VEL * 0.5;
  return false;
}

export function getPlayerCenter(player) {
  return {
    x: player.x + player.spriteW / 2,
    y: player.y + player.spriteH / 2,
  };
}

export function getPlayerHitbox(player) {
  return {
    x: player.x + player.hitboxOffX,
    y: player.y + player.hitboxOffY,
    w: player.hitboxW,
    h: player.hitboxH,
  };
}
