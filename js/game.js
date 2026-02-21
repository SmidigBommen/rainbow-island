// Main game state and logic
import {
  GAME_WIDTH, GAME_HEIGHT, TILE_SIZE, FRAME_TIME,
  STATE_TITLE, STATE_PLAYING, STATE_LEVEL_INTRO, STATE_LEVEL_CLEAR,
  STATE_GAME_OVER, STATE_ENTER_INITIALS, STATE_LEADERBOARD, STATE_PAUSED,
  STATE_LEVEL_SELECT,
} from './config.js';
import * as Input from './input.js';
import { initRenderer, clear, drawSkyGradient, drawTiles, drawSprite, drawRect, drawRainbow, drawParticles, drawWater, setCameraTarget, updateCamera, getCameraY, screenShake } from './renderer.js';
import { generateAllSprites, getSprites } from './sprites.js';
import { initAudio, resumeAudio, sfxLevelClear, sfxGameOver, sfxPlayerHit, sfxPlayerDie, sfxMenuSelect, sfxDeny, sfxSplash, sfxWaterWarning } from './audio.js';
import { updateParticles, getParticles, clearParticles, spawnEnemyDeath, spawnSplash } from './particles.js';
import { createPlayer, updatePlayer, hurtPlayer, getPlayerCenter, getPlayerHitbox } from './player.js';
import { createRainbowManager, shootRainbow, updateRainbows, makeRainbowFall, getRainbowHitboxes } from './rainbow.js';
import { createEnemy, updateEnemy, hitEnemy, getEnemyHitbox, updateProjectiles, createProjectile } from './enemies.js';
import { createItem, updateItem, collectItem, getItemHitbox, spawnEnemyDrops } from './items.js';
import { loadLevel, getLevelCount, createWater, updateWater, isInWater, getAllLevelInfo } from './level.js';
import { drawHUD, drawTitleScreen, drawLevelIntro, drawLevelClear, drawGameOver, drawPauseScreen, drawWaterWarning, drawEnterInitials, drawLeaderboardScreen, drawLevelSelectScreen, addScorePopup, updateScorePopups, drawScorePopups } from './ui.js';
import { aabbOverlap } from './utils.js';
import { isHighScore, addScore, getRank, loadLeaderboard, createInitialEntry, updateInitialEntry, getInitialString } from './leaderboard.js';
import { loadProgress, unlockNextLevel } from './progress.js';

let gameState = STATE_TITLE;
let stateTimer = 0;
let globalTime = 0;

// Game objects
let player = null;
let level = null;
let currentLevelIndex = 0;
let rainbowManager = null;
let enemies = [];
let items = [];
let projectiles = [];
let water = null;
let waterWarningPlayed = false;

// Goal
let goalReached = false;

// Leaderboard
let initialEntry = null;
let leaderboardEntries = null;
let leaderboardHighlightIndex = -1;

// Level select
let levelSelectCursor = 0;
let levelSelectProgress = null;
let levelSelectLevels = null;

export function initGame() {
  initRenderer();
  initAudio();
  generateAllSprites();
  Input.initInput();
  gameState = STATE_TITLE;
  stateTimer = 0;
}

let lastFrameTime = 0;

export function gameLoop(timestamp) {
  requestAnimationFrame(gameLoop);

  const elapsed = timestamp - lastFrameTime;
  if (elapsed < FRAME_TIME) return;
  lastFrameTime = timestamp - (elapsed % FRAME_TIME);

  globalTime++;
  stateTimer++;

  update();
  render();

  Input.clearFrameInput();
}

function update() {
  switch (gameState) {
    case STATE_TITLE:
      updateTitle();
      break;
    case STATE_LEVEL_INTRO:
      updateLevelIntro();
      break;
    case STATE_PLAYING:
      updatePlaying();
      break;
    case STATE_LEVEL_CLEAR:
      updateLevelClear();
      break;
    case STATE_GAME_OVER:
      updateGameOver();
      break;
    case STATE_ENTER_INITIALS:
      updateEnterInitials();
      break;
    case STATE_LEADERBOARD:
      updateLeaderboard();
      break;
    case STATE_LEVEL_SELECT:
      updateLevelSelect();
      break;
    case STATE_PAUSED:
      updatePaused();
      break;
  }
}

function render() {
  switch (gameState) {
    case STATE_TITLE:
      drawTitleScreen(globalTime);
      break;
    case STATE_LEVEL_INTRO:
      renderPlaying();
      drawLevelIntro(level.name, currentLevelIndex, stateTimer);
      break;
    case STATE_PLAYING:
      renderPlaying();
      break;
    case STATE_LEVEL_CLEAR:
      renderPlaying();
      drawLevelClear(player.score, player.diamonds, stateTimer);
      break;
    case STATE_GAME_OVER:
      renderPlaying();
      drawGameOver(player ? player.score : 0, stateTimer);
      break;
    case STATE_ENTER_INITIALS:
      drawEnterInitials(player ? player.score : 0, getRank(player ? player.score : 0), initialEntry, stateTimer);
      break;
    case STATE_LEADERBOARD:
      drawLeaderboardScreen(leaderboardEntries || loadLeaderboard(), leaderboardHighlightIndex, stateTimer);
      break;
    case STATE_LEVEL_SELECT:
      drawLevelSelectScreen(levelSelectLevels, levelSelectProgress, levelSelectCursor, globalTime);
      break;
    case STATE_PAUSED:
      renderPlaying();
      drawPauseScreen();
      break;
  }
}

// ====== STATE HANDLERS ======

function updateTitle() {
  if (Input.startPressed()) {
    resumeAudio();
    sfxMenuSelect();
    enterLevelSelect();
  }
}

function updateLevelIntro() {
  if (stateTimer > 120 || (stateTimer > 30 && Input.startPressed())) {
    gameState = STATE_PLAYING;
    stateTimer = 0;
  }
}

function updateLevelClear() {
  if (stateTimer > 150 && Input.startPressed()) {
    sfxMenuSelect();
    unlockNextLevel(currentLevelIndex);
    currentLevelIndex++;
    if (currentLevelIndex >= getLevelCount()) {
      // Game won! Return to level select
      enterLevelSelect();
    } else {
      loadCurrentLevel();
      gameState = STATE_LEVEL_INTRO;
      stateTimer = 0;
    }
  }
}

function updateGameOver() {
  if (stateTimer > 120 && Input.startPressed()) {
    sfxMenuSelect();
    const score = player ? player.score : 0;
    if (isHighScore(score)) {
      // Go to initials entry
      initialEntry = createInitialEntry();
      gameState = STATE_ENTER_INITIALS;
      stateTimer = 0;
    } else {
      // Show leaderboard briefly then back to title
      leaderboardEntries = loadLeaderboard();
      leaderboardHighlightIndex = -1;
      gameState = STATE_LEADERBOARD;
      stateTimer = 0;
    }
  }
}

function updateEnterInitials() {
  if (!initialEntry) return;

  updateInitialEntry(
    initialEntry,
    Input.wasPressed('ArrowUp') || Input.wasPressed('KeyW'),
    Input.wasPressed('ArrowDown') || Input.wasPressed('KeyS'),
    Input.wasPressed('ArrowLeft') || Input.wasPressed('KeyA'),
    Input.wasPressed('ArrowRight') || Input.wasPressed('KeyD'),
    Input.wasPressed('Enter') || Input.wasPressed('Space')
  );

  if (initialEntry.done) {
    const name = getInitialString(initialEntry);
    const score = player ? player.score : 0;
    leaderboardEntries = addScore(name, score);
    // Find the index of the new entry
    leaderboardHighlightIndex = leaderboardEntries.findIndex(e => e.name === name && e.score === score);
    sfxMenuSelect();
    gameState = STATE_LEADERBOARD;
    stateTimer = 0;
  }
}

function updateLeaderboard() {
  if (stateTimer > 60 && Input.startPressed()) {
    sfxMenuSelect();
    enterLevelSelect();
  }
}

function updatePaused() {
  if (Input.pausePressed()) {
    gameState = STATE_PLAYING;
    stateTimer = 0;
  }
}

function updatePlaying() {
  if (Input.pausePressed()) {
    gameState = STATE_PAUSED;
    stateTimer = 0;
    return;
  }

  // Update player
  updatePlayer(player, level, rainbowManager.rainbows);

  // Shoot rainbow
  if (Input.shootPressed() && player.shootCooldown <= 0 && !player.dead) {
    const px = player.x + player.spriteW / 2;
    const py = player.y + 6;
    if (shootRainbow(rainbowManager, px, py, player.facingRight, level)) {
      player.shootCooldown = 15;
      player.shootAnimTimer = 15;
    }
  }

  // Update rainbows
  updateRainbows(rainbowManager, level);

  // Update enemies
  const playerCenter = getPlayerCenter(player);
  for (const enemy of enemies) {
    updateEnemy(enemy, level, playerCenter.x, playerCenter.y, projectiles);
  }

  // Update projectiles
  updateProjectiles(projectiles, level);

  // Update items
  for (const item of items) {
    updateItem(item, level);
  }

  // Update water
  updateWater(water);
  if (water.warningShown && !waterWarningPlayed) {
    sfxWaterWarning();
    waterWarningPlayed = true;
  }

  // Update particles
  updateParticles();
  updateScorePopups();

  // Update camera
  updateCamera();

  // ====== COLLISION DETECTION ======

  if (!player.dead) {
    const playerHitbox = getPlayerHitbox(player);

    // Rainbow vs Enemies
    for (const rb of rainbowManager.rainbows) {
      if (!rb.active || !rb.damageActive) continue;
      const rbHitboxes = getRainbowHitboxes(rb);

      let chainCount = 0;
      for (const enemy of enemies) {
        if (!enemy.active) continue;
        const enemyHitbox = getEnemyHitbox(enemy);

        for (const rbHit of rbHitboxes) {
          if (aabbOverlap(rbHit, enemyHitbox)) {
            const score = hitEnemy(enemy, chainCount);
            if (score > 0) {
              player.score += score;
              addScorePopup(enemy.x + 8, enemy.y, score, getCameraY());
              chainCount++;

              // Spawn drops
              const drops = spawnEnemyDrops(enemy.type, enemy.x, enemy.y);
              items.push(...drops);
            }
            break;
          }
        }
      }

      // If rainbow is falling, mark it as no longer able to damage after first hit cycle
      if (rb.falling && chainCount > 0) {
        // Allow continued damage while falling (chain kills!)
      }
    }

    // Player vs Enemies
    for (const enemy of enemies) {
      if (!enemy.active) continue;
      const enemyHitbox = getEnemyHitbox(enemy);

      if (aabbOverlap(playerHitbox, enemyHitbox)) {
        const died = hurtPlayer(player);
        if (died) {
          sfxPlayerDie();
          screenShake(15);
        } else {
          sfxPlayerHit();
          screenShake(8);
        }
      }
    }

    // Player vs Projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const proj = projectiles[i];
      const projBox = { x: proj.x - 3, y: proj.y - 3, w: proj.w, h: proj.h };
      if (aabbOverlap(playerHitbox, projBox)) {
        const died = hurtPlayer(player);
        if (died) {
          sfxPlayerDie();
          screenShake(15);
        } else {
          sfxPlayerHit();
          screenShake(8);
        }
        projectiles.splice(i, 1);
      }
    }

    // Player vs Items
    for (const item of items) {
      if (!item.active) continue;
      const itemHitbox = getItemHitbox(item);
      if (aabbOverlap(playerHitbox, itemHitbox)) {
        const result = collectItem(item, player);
        if (result) {
          if (result.score > 0) {
            addScorePopup(item.x + 6, item.y, result.score, getCameraY());
          }
          // Star power-up: kill all visible enemies
          if (result.powerup === 'star') {
            for (const enemy of enemies) {
              if (!enemy.active) continue;
              const score = hitEnemy(enemy, 0);
              if (score > 0) {
                player.score += score;
                const drops = spawnEnemyDrops(enemy.type, enemy.x, enemy.y);
                items.push(...drops);
              }
            }
            screenShake(10);
          }
          // Update rainbow manager max
          if (result.powerup === 'rainbow') {
            rainbowManager.maxRainbows = player.maxRainbows;
          }
        }
      }
    }

    // Player standing on rainbow - rainbow starts to crumble, then falls
    for (const rb of rainbowManager.rainbows) {
      if (!rb.active || rb.falling) continue;
      if (player.onGround) {
        let standingOnThis = false;
        for (const seg of rb.segments) {
          const segBox = { x: seg.x, y: seg.y - 2, w: rb.segWidth || 8, h: 6 };
          const feetBox = {
            x: player.x + player.hitboxOffX,
            y: player.y + player.hitboxOffY + player.hitboxH - 2,
            w: player.hitboxW,
            h: 4,
          };
          if (aabbOverlap(feetBox, segBox)) {
            standingOnThis = true;
            break;
          }
        }
        if (standingOnThis) {
          if (!rb.stoodOnTimer) {
            rb.stoodOnTimer = 25; // Brief delay before falling
          }
          rb.stoodOnTimer--;
          if (rb.stoodOnTimer <= 0) {
            // Rainbow falls - damages enemies below!
            makeRainbowFall(rb);
          }
        }
      }
    }

    // Check if player reached goal (top of level)
    if (!goalReached && player.y < 8 * TILE_SIZE) {
      goalReached = true;
      sfxLevelClear();
      gameState = STATE_LEVEL_CLEAR;
      stateTimer = 0;
    }

    // Player falls into water
    if (water.active && isInWater(player.y + player.spriteH, water)) {
      spawnSplash(player.x + player.spriteW / 2, water.y);
      sfxSplash();
      player.dead = true;
      player.lives--;
      player.deathTimer = 120;
      player.vy = -5;
      screenShake(15);
      if (player.lives <= 0) {
        sfxGameOver();
      }
    }
  }

  // Check player death
  if (player.dead && player.deathTimer <= 0) {
    if (player.lives <= 0) {
      gameState = STATE_GAME_OVER;
      stateTimer = 0;
      sfxGameOver();
    } else {
      // Respawn
      respawnPlayer();
    }
  }

  // Clean up dead enemies and items
  enemies = enemies.filter(e => e.active);
  items = items.filter(i => i.active);

  // Camera follows player (keep player in lower portion of screen)
  const targetY = player.y - GAME_HEIGHT * 0.6;
  const maxCameraY = level.height * TILE_SIZE - GAME_HEIGHT;
  setCameraTarget(Math.max(0, Math.min(targetY, maxCameraY)));
}

function renderPlaying() {
  if (!level) return;

  // Sky gradient
  drawSkyGradient(level.height * TILE_SIZE);

  // Tiles
  drawTiles(level);

  // Items
  const sprites = getSprites();
  for (const item of items) {
    if (!item.active) continue;
    // Flash when about to disappear
    if (item.lifetime < 120 && Math.floor(item.flashTimer / 4) % 2 === 0) continue;
    if (sprites && sprites.items[item.spriteName]) {
      drawSprite(sprites.items[item.spriteName], item.x, item.y);
    }
  }

  // Rainbows
  for (const rb of rainbowManager.rainbows) {
    if (rb.active) {
      drawRainbow(rb);
    }
  }

  // Enemies
  for (const enemy of enemies) {
    if (!enemy.active) continue;
    if (enemy.flashTimer > 0 && Math.floor(enemy.flashTimer / 2) % 2 === 0) continue;
    if (sprites && sprites.enemies[enemy.type]) {
      const frame = sprites.enemies[enemy.type][enemy.animFrame % sprites.enemies[enemy.type].length];
      drawSprite(frame, enemy.x, enemy.y, !enemy.facingRight);
    }
  }

  // Projectiles
  if (sprites) {
    for (const proj of projectiles) {
      drawSprite(sprites.projectile, proj.x - 3, proj.y - 3);
    }
  }

  // Player
  if (!player.dead || player.deathTimer > 0) {
    // Invincibility flashing
    if (player.invincible > 0 && Math.floor(player.flashTimer / 3) % 2 === 0) {
      // Skip drawing (flash effect)
    } else if (sprites) {
      const frames = sprites.player[player.animState];
      if (frames) {
        const frame = frames[player.animFrame % frames.length];
        drawSprite(frame, player.x, player.y, !player.facingRight);
      }
    }
  }

  // Particles
  drawParticles(getParticles());

  // Water
  if (water) {
    drawWater(water.y, globalTime);
  }

  // Water warning
  if (water && water.warningShown && water.delay > 0) {
    drawWaterWarning(globalTime);
  }

  // HUD
  if (player) {
    drawHUD(player, level.name, globalTime);
  }

  // Score popups
  drawScorePopups();
}

// ====== GAME MANAGEMENT ======

function enterLevelSelect() {
  levelSelectProgress = loadProgress();
  levelSelectLevels = getAllLevelInfo();
  // Keep cursor on last selected or find first unlocked
  if (!levelSelectProgress[levelSelectCursor]) {
    levelSelectCursor = 0;
  }
  gameState = STATE_LEVEL_SELECT;
  stateTimer = 0;
}

function updateLevelSelect() {
  const cols = 2;
  const totalLevels = levelSelectLevels.length;

  if (Input.wasPressed('ArrowRight') || Input.wasPressed('KeyD')) {
    if (levelSelectCursor % cols < cols - 1 && levelSelectCursor + 1 < totalLevels) {
      levelSelectCursor++;
      sfxMenuSelect();
    }
  }
  if (Input.wasPressed('ArrowLeft') || Input.wasPressed('KeyA')) {
    if (levelSelectCursor % cols > 0) {
      levelSelectCursor--;
      sfxMenuSelect();
    }
  }
  if (Input.wasPressed('ArrowDown') || Input.wasPressed('KeyS')) {
    if (levelSelectCursor + cols < totalLevels) {
      levelSelectCursor += cols;
      sfxMenuSelect();
    }
  }
  if (Input.wasPressed('ArrowUp') || Input.wasPressed('KeyW')) {
    if (levelSelectCursor - cols >= 0) {
      levelSelectCursor -= cols;
      sfxMenuSelect();
    }
  }

  if (Input.wasPressed('Enter') || Input.wasPressed('Space')) {
    if (levelSelectProgress[levelSelectCursor]) {
      sfxMenuSelect();
      startFromLevelSelect(levelSelectCursor);
    } else {
      sfxDeny();
    }
  }

  if (Input.pausePressed()) {
    sfxMenuSelect();
    gameState = STATE_TITLE;
    stateTimer = 0;
  }
}

function startFromLevelSelect(index) {
  currentLevelIndex = index;
  player = null; // Reset so loadCurrentLevel creates fresh
  loadCurrentLevel();
  player.score = 0;
  player.lives = 3;
  player.diamonds = 0;
  gameState = STATE_LEVEL_INTRO;
  stateTimer = 0;
}

function loadCurrentLevel() {
  level = loadLevel(currentLevelIndex);
  if (!level) {
    gameState = STATE_TITLE;
    return;
  }

  // Create player at start position
  const startX = level.playerStart.col * TILE_SIZE;
  const startY = level.playerStart.row * TILE_SIZE;

  if (!player) {
    player = createPlayer(startX, startY);
  } else {
    // Keep score and lives
    const score = player.score;
    const lives = player.lives;
    const diamonds = player.diamonds;
    player = createPlayer(startX, startY);
    player.score = score;
    player.lives = lives;
    player.diamonds = diamonds;
  }

  // Create rainbow manager
  rainbowManager = createRainbowManager();

  // Spawn enemies
  enemies = level.enemies.map(e =>
    createEnemy(e.type, e.col * TILE_SIZE, e.row * TILE_SIZE)
  );

  // Spawn items
  items = level.items.map(i =>
    createItem(i.type, i.col * TILE_SIZE, i.row * TILE_SIZE)
  );

  // Projectiles
  projectiles = [];

  // Water
  water = createWater(level.height, level.waterDelay);
  waterWarningPlayed = false;

  // Goal
  goalReached = false;

  // Clear particles
  clearParticles();

  // Set camera
  setCameraTarget(player.y - GAME_HEIGHT * 0.6);
}

function respawnPlayer() {
  const startX = level.playerStart.col * TILE_SIZE;
  const startY = level.playerStart.row * TILE_SIZE;
  player.x = startX;
  player.y = startY;
  player.vx = 0;
  player.vy = 0;
  player.dead = false;
  player.invincible = 120;
  player.onGround = false;
  player.coyoteTimer = 0;
  player.jumpBufferTimer = 0;

  // Reset camera
  setCameraTarget(player.y - GAME_HEIGHT * 0.6);
}

export function getGameState() {
  return gameState;
}
