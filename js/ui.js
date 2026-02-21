// UI system - HUD, menus, score popups, leaderboard
import { GAME_WIDTH, GAME_HEIGHT, COLORS, VERSION } from './config.js';
import { drawRectScreen, drawText, drawTextOutline } from './renderer.js';
import { getSprites } from './sprites.js';
import { loadLeaderboard, getInitialString } from './leaderboard.js';

// Score popup system
const scorePopups = [];

export function addScorePopup(x, y, score, cameraY) {
  scorePopups.push({
    x,
    y: y - cameraY,
    text: '+' + score,
    life: 60,
    maxLife: 60,
  });
}

export function updateScorePopups() {
  for (let i = scorePopups.length - 1; i >= 0; i--) {
    const popup = scorePopups[i];
    popup.y -= 0.5;
    popup.life--;
    if (popup.life <= 0) {
      scorePopups.splice(i, 1);
    }
  }
}

export function drawScorePopups() {
  for (const popup of scorePopups) {
    const alpha = Math.min(1, popup.life / 20);
    const color = `rgba(255, 215, 0, ${alpha})`;
    drawTextOutline(popup.text, popup.x, popup.y, color, `rgba(0,0,0,${alpha})`, 8, 'center');
  }
}

// HUD
export function drawHUD(player, levelName, time) {
  // Semi-transparent top bar
  drawRectScreen(0, 0, GAME_WIDTH, 20, 'rgba(0, 0, 0, 0.6)');

  // Score
  drawText('SCORE', 4, 2, '#AAAAAA', 6, 'left');
  drawText(String(player.score).padStart(8, '0'), 4, 10, '#FFFFFF', 7, 'left');

  // Lives
  const sprites = getSprites();
  if (sprites) {
    for (let i = 0; i < player.lives; i++) {
      drawRectScreen(GAME_WIDTH / 2 - 20 + i * 12, 5, 10, 10, 'transparent');
      // Draw small hearts
      const hx = GAME_WIDTH / 2 - 20 + i * 12;
      drawSmallHeart(hx, 5);
    }
  }

  // Diamonds
  drawText(`DIA:${player.diamonds}`, GAME_WIDTH - 4, 2, '#66EEFF', 6, 'right');

  // Level name
  drawText(levelName, GAME_WIDTH - 4, 11, '#AAAAAA', 6, 'right');
}

function drawSmallHeart(x, y) {
  const ctx = document.getElementById('game').getContext('2d');
  ctx.fillStyle = '#FF4466';
  ctx.fillRect(x + 1, y, 3, 1);
  ctx.fillRect(x + 5, y, 3, 1);
  ctx.fillRect(x, y + 1, 9, 1);
  ctx.fillRect(x, y + 2, 9, 2);
  ctx.fillRect(x + 1, y + 4, 7, 1);
  ctx.fillRect(x + 2, y + 5, 5, 1);
  ctx.fillRect(x + 3, y + 6, 3, 1);
  ctx.fillRect(x + 4, y + 7, 1, 1);
  // Highlight
  ctx.fillStyle = '#FF8899';
  ctx.fillRect(x + 2, y + 1, 2, 1);
}

// Water warning
export function drawWaterWarning(time) {
  if (Math.floor(time / 15) % 2 === 0) {
    drawRectScreen(0, GAME_HEIGHT - 24, GAME_WIDTH, 24, 'rgba(200, 0, 0, 0.7)');
    drawTextOutline('WATER RISING!', GAME_WIDTH / 2, GAME_HEIGHT - 20, '#FFFFFF', '#880000', 10, 'center');
  }
}

// Title screen
export function drawTitleScreen(time) {
  // Background
  const ctx = document.getElementById('game').getContext('2d');

  // Gradient background
  const grad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
  grad.addColorStop(0, '#1a1a3e');
  grad.addColorStop(0.5, '#2a2a5e');
  grad.addColorStop(1, '#1a1a3e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Stars
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < 50; i++) {
    const sx = (i * 73 + Math.sin(time * 0.01 + i) * 2) % GAME_WIDTH;
    const sy = (i * 37 + Math.cos(time * 0.015 + i) * 2) % (GAME_HEIGHT * 0.6);
    const size = (i % 3 === 0) ? 2 : 1;
    ctx.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(time * 0.02 + i * 0.5));
    ctx.fillRect(sx, sy, size, size);
  }
  ctx.globalAlpha = 1;

  // Rainbow title decoration
  const rainbow = COLORS.rainbow;
  const titleY = 100;
  for (let i = 0; i < rainbow.length; i++) {
    ctx.fillStyle = rainbow[i];
    const y = titleY - 30 + i * 4;
    const waveOff = Math.sin(time * 0.03 + i * 0.5) * 10;
    ctx.fillRect(40 + waveOff, y, GAME_WIDTH - 80 - waveOff * 2, 3);
  }

  // Title text
  drawTextOutline('RAINBOW', GAME_WIDTH / 2, titleY - 5, '#FFFFFF', '#222244', 20, 'center');
  drawTextOutline('ISLANDS', GAME_WIDTH / 2, titleY + 20, '#FFD700', '#222244', 20, 'center');

  // Subtitle
  drawTextOutline('A Bubble Adventure', GAME_WIDTH / 2, titleY + 55, '#88BBFF', '#222244', 8, 'center');

  // Top scores preview
  const scores = loadLeaderboard();
  if (scores.length > 0) {
    drawText('HIGH SCORES', GAME_WIDTH / 2, titleY + 75, '#FFD700', 7, 'center');
    const showCount = Math.min(5, scores.length);
    for (let i = 0; i < showCount; i++) {
      const entry = scores[i];
      const y = titleY + 88 + i * 12;
      const rankColor = i === 0 ? '#FFD700' : i === 1 ? '#CCCCCC' : i === 2 ? '#CC8844' : '#888888';
      drawText(`${i + 1}.`, GAME_WIDTH / 2 - 60, y, rankColor, 7, 'left');
      drawText(entry.name, GAME_WIDTH / 2 - 40, y, rankColor, 7, 'left');
      drawText(String(entry.score).padStart(8, '0'), GAME_WIDTH / 2 + 60, y, rankColor, 7, 'right');
    }
  }

  // Instructions
  const blink = Math.sin(time * 0.05) > 0;
  if (blink) {
    drawTextOutline('PRESS ENTER TO START', GAME_WIDTH / 2, GAME_HEIGHT - 100, '#FFFFFF', '#000000', 10, 'center');
  }

  // Controls
  drawText('Arrow Keys / WASD - Move', GAME_WIDTH / 2, GAME_HEIGHT - 70, '#666666', 6, 'center');
  drawText('Space / Z / Up - Jump    X / C - Rainbow', GAME_WIDTH / 2, GAME_HEIGHT - 58, '#666666', 6, 'center');

  // Version
  drawText('v' + VERSION, GAME_WIDTH - 4, GAME_HEIGHT - 10, '#444444', 6, 'right');
}

// Level intro screen
export function drawLevelIntro(levelName, levelIndex, time) {
  drawRectScreen(0, 0, GAME_WIDTH, GAME_HEIGHT, 'rgba(0, 0, 0, 0.8)');

  // Rainbow decoration
  const rainbow = COLORS.rainbow;
  for (let i = 0; i < rainbow.length; i++) {
    const ctx = document.getElementById('game').getContext('2d');
    ctx.fillStyle = rainbow[i];
    const w = 100 + Math.sin(time * 0.05 + i) * 20;
    ctx.fillRect(GAME_WIDTH / 2 - w / 2, GAME_HEIGHT / 2 - 50 + i * 5, w, 3);
  }

  drawTextOutline(`ROUND ${levelIndex + 1}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, '#FFD700', '#000000', 16, 'center');
  drawTextOutline(levelName, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10, '#FFFFFF', '#000000', 10, 'center');

  if (time > 60) {
    const blink = Math.sin(time * 0.08) > 0;
    if (blink) {
      drawTextOutline('GET READY!', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, '#88FF88', '#000000', 10, 'center');
    }
  }
}

// Game over screen
export function drawGameOver(score, time) {
  drawRectScreen(0, 0, GAME_WIDTH, GAME_HEIGHT, 'rgba(0, 0, 0, 0.85)');

  drawTextOutline('GAME OVER', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, '#FF4444', '#000000', 20, 'center');
  drawTextOutline(`SCORE: ${score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10, '#FFD700', '#000000', 12, 'center');

  if (time > 120) {
    const blink = Math.sin(time * 0.06) > 0;
    if (blink) {
      drawTextOutline('PRESS ENTER TO RETRY', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, '#FFFFFF', '#000000', 8, 'center');
    }
  }
}

// Level clear screen
export function drawLevelClear(score, diamonds, time) {
  drawRectScreen(0, 0, GAME_WIDTH, GAME_HEIGHT, 'rgba(0, 0, 40, 0.85)');

  // Rainbow celebration
  const rainbow = COLORS.rainbow;
  const ctx = document.getElementById('game').getContext('2d');
  for (let i = 0; i < rainbow.length; i++) {
    ctx.fillStyle = rainbow[i];
    const w = 150 + Math.sin(time * 0.04 + i * 0.8) * 30;
    ctx.fillRect(GAME_WIDTH / 2 - w / 2, 60 + i * 6, w, 4);
  }

  drawTextOutline('LEVEL CLEAR!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, '#FFD700', '#000000', 16, 'center');

  if (time > 60) {
    drawTextOutline(`SCORE: ${score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, '#FFFFFF', '#000000', 10, 'center');
  }
  if (time > 90) {
    drawTextOutline(`DIAMONDS: ${diamonds}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10, '#66EEFF', '#000000', 10, 'center');
  }
  if (time > 150) {
    const blink = Math.sin(time * 0.06) > 0;
    if (blink) {
      drawTextOutline('PRESS ENTER', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, '#FFFFFF', '#000000', 8, 'center');
    }
  }
}

// Level select screen
export function drawLevelSelectScreen(levels, progress, selectedIndex, time) {
  const ctx = document.getElementById('game').getContext('2d');

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
  grad.addColorStop(0, '#1a1a3e');
  grad.addColorStop(0.5, '#2a2a5e');
  grad.addColorStop(1, '#1a1a3e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Stars
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < 40; i++) {
    const sx = (i * 73 + Math.sin(time * 0.01 + i) * 2) % GAME_WIDTH;
    const sy = (i * 37 + Math.cos(time * 0.015 + i) * 2) % 60;
    ctx.globalAlpha = 0.3 + 0.4 * Math.abs(Math.sin(time * 0.02 + i));
    ctx.fillRect(sx, sy, 1, 1);
  }
  ctx.globalAlpha = 1;

  // Header
  drawTextOutline('SELECT ISLAND', GAME_WIDTH / 2, 20, '#FFD700', '#000000', 14, 'center');

  // Rainbow decoration under header
  const rainbow = COLORS.rainbow;
  for (let i = 0; i < rainbow.length; i++) {
    ctx.fillStyle = rainbow[i];
    const w = 100 + Math.sin(time * 0.03 + i * 0.5) * 8;
    ctx.fillRect(GAME_WIDTH / 2 - w / 2, 38 + i * 2, w, 1);
  }

  // 2-column x 4-row grid
  const cols = 2;
  const rows = 4;
  const cellW = 140;
  const cellH = 86;
  const gapX = 10;
  const gapY = 6;
  const gridW = cols * cellW + (cols - 1) * gapX;
  const startX = (GAME_WIDTH - gridW) / 2;
  const startY = 58;

  // Theme colors
  const themeColors = {
    forest: { bg: '#1a3a1a', border: '#44AA44', label: '#88DD88' },
    cave: { bg: '#2a1a1a', border: '#AA6644', label: '#DDAA88' },
    volcano: { bg: '#3a1a0a', border: '#DD4422', label: '#FF8866' },
    sky: { bg: '#1a1a3a', border: '#4488FF', label: '#88BBFF' },
  };

  // Difficulty colors
  const diffColors = ['#44CC44', '#88CC44', '#CCCC44', '#CC8844', '#CC4444'];

  for (let i = 0; i < levels.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * (cellW + gapX);
    const y = startY + row * (cellH + gapY);
    const levelInfo = levels[i];
    const unlocked = progress[i];
    const selected = i === selectedIndex;
    const theme = themeColors[levelInfo.theme] || themeColors.forest;

    // Selected: animated rainbow border
    if (selected) {
      const borderW = 2;
      for (let b = 0; b < 4; b++) {
        const colorIdx = (Math.floor(time * 0.1) + b) % rainbow.length;
        ctx.fillStyle = rainbow[colorIdx];
        // Top
        ctx.fillRect(x - borderW + b * (cellW / 4), y - borderW, cellW / 4, borderW);
        // Bottom
        ctx.fillRect(x - borderW + b * (cellW / 4), y + cellH, cellW / 4, borderW);
        // Left
        ctx.fillRect(x - borderW, y - borderW + b * (cellH / 4), borderW, cellH / 4 + borderW);
        // Right
        ctx.fillRect(x + cellW, y - borderW + b * (cellH / 4), borderW, cellH / 4 + borderW);
      }
    }

    // Cell background
    ctx.fillStyle = unlocked ? theme.bg : '#111118';
    ctx.globalAlpha = selected ? 1.0 : (unlocked ? 0.8 : 0.5);
    ctx.fillRect(x, y, cellW, cellH);
    ctx.globalAlpha = 1;

    // Cell border
    ctx.strokeStyle = unlocked ? theme.border : '#333344';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, cellW, cellH);

    if (unlocked) {
      // Level number
      drawTextOutline(`${i + 1}`, x + 12, y + 4, theme.label, '#000000', 14, 'center');

      // Display name
      drawText(levelInfo.displayName, x + 24, y + 6, '#FFFFFF', 7, 'left');

      // Theme label
      drawText(levelInfo.theme.toUpperCase(), x + 24, y + 18, theme.label, 6, 'left');

      // Difficulty dots
      const dotY = y + 34;
      drawText('DIFF', x + 6, dotY - 1, '#888899', 5, 'left');
      for (let d = 0; d < 5; d++) {
        const dotX = x + 34 + d * 10;
        if (d < levelInfo.difficulty) {
          ctx.fillStyle = diffColors[d];
          ctx.fillRect(dotX, dotY, 6, 6);
        } else {
          ctx.fillStyle = '#333344';
          ctx.fillRect(dotX, dotY, 6, 6);
        }
      }

      // Height indicator
      drawText(`H:${levelInfo.height}`, x + 94, dotY - 1, '#666677', 5, 'left');

      // Water speed indicator
      const waterSpeed = 5 - Math.floor((levelInfo.difficulty - 1) * 1.0);
      const waterLabel = levelInfo.difficulty >= 5 ? 'FAST!' : levelInfo.difficulty >= 3 ? 'QUICK' : 'SLOW';
      drawText('WATER: ' + waterLabel, x + 6, y + 48, levelInfo.difficulty >= 4 ? '#FF8866' : '#668899', 5, 'left');

      // Mini preview - theme-colored bar
      ctx.fillStyle = theme.border;
      ctx.globalAlpha = 0.3;
      ctx.fillRect(x + 4, y + 60, cellW - 8, 20);
      ctx.globalAlpha = 1;

      // Decorative mini platforms
      ctx.fillStyle = theme.border;
      for (let p = 0; p < 4; p++) {
        const px = x + 10 + p * 30 + Math.sin(i * 2 + p) * 5;
        const py = y + 64 + Math.sin(p * 1.5 + i) * 4;
        ctx.fillRect(px, py, 12, 2);
      }
    } else {
      // Locked level
      // Level number (dimmed)
      drawText(`${i + 1}`, x + 12, y + 6, '#444455', 12, 'center');

      // Display name (dimmed)
      drawText(levelInfo.displayName, x + 24, y + 8, '#444455', 7, 'left');

      // Lock icon (pixel art)
      const lx = x + cellW / 2 - 6;
      const ly = y + 36;
      // Lock body
      ctx.fillStyle = '#555566';
      ctx.fillRect(lx, ly + 4, 12, 10);
      // Lock shackle
      ctx.fillStyle = '#444455';
      ctx.fillRect(lx + 2, ly, 2, 5);
      ctx.fillRect(lx + 8, ly, 2, 5);
      ctx.fillRect(lx + 2, ly, 8, 2);
      // Keyhole
      ctx.fillStyle = '#222233';
      ctx.fillRect(lx + 5, ly + 7, 2, 2);
      ctx.fillRect(lx + 5, ly + 9, 2, 3);

      drawText('LOCKED', x + cellW / 2, y + 60, '#444455', 6, 'center');
    }
  }

  // Footer
  drawText('ENTER: Play    ESC: Back', GAME_WIDTH / 2, GAME_HEIGHT - 22, '#888899', 7, 'center');

  // Arrow key hints
  const blink = Math.sin(time * 0.06) > 0;
  if (blink) {
    drawText('Use Arrow Keys to Select', GAME_WIDTH / 2, GAME_HEIGHT - 10, '#555566', 6, 'center');
  }
}

// Pause overlay
export function drawPauseScreen() {
  drawRectScreen(0, 0, GAME_WIDTH, GAME_HEIGHT, 'rgba(0, 0, 0, 0.6)');
  drawTextOutline('PAUSED', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 10, '#FFFFFF', '#000000', 16, 'center');
  drawText('Press ESC to resume', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, '#AAAAAA', 8, 'center');
}

// Enter initials screen (arcade style)
export function drawEnterInitials(score, rank, entry, time) {
  const ctx = document.getElementById('game').getContext('2d');

  // Background
  const grad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
  grad.addColorStop(0, '#1a1a3e');
  grad.addColorStop(1, '#0a0a1e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Rainbow decoration at top
  const rainbow = COLORS.rainbow;
  for (let i = 0; i < rainbow.length; i++) {
    ctx.fillStyle = rainbow[i];
    const w = 120 + Math.sin(time * 0.04 + i * 0.6) * 15;
    ctx.fillRect(GAME_WIDTH / 2 - w / 2, 30 + i * 4, w, 3);
  }

  drawTextOutline('NEW HIGH SCORE!', GAME_WIDTH / 2, 75, '#FFD700', '#000000', 14, 'center');
  drawTextOutline(`RANK #${rank}`, GAME_WIDTH / 2, 100, '#FF8844', '#000000', 10, 'center');
  drawTextOutline(`SCORE: ${score}`, GAME_WIDTH / 2, 120, '#FFFFFF', '#000000', 10, 'center');

  drawText('ENTER YOUR INITIALS', GAME_WIDTH / 2, 160, '#AAAAAA', 8, 'center');

  // Draw the three character slots
  const slotW = 28;
  const slotGap = 8;
  const totalW = slotW * 3 + slotGap * 2;
  const startX = GAME_WIDTH / 2 - totalW / 2;
  const slotY = 185;

  for (let i = 0; i < 3; i++) {
    const x = startX + i * (slotW + slotGap);
    const isActive = i === entry.pos;
    const char = String.fromCharCode(entry.chars[i]);

    // Slot background
    ctx.fillStyle = isActive ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(x, slotY, slotW, 36);

    // Slot border
    ctx.strokeStyle = isActive ? '#FFD700' : '#444466';
    ctx.lineWidth = isActive ? 2 : 1;
    ctx.strokeRect(x, slotY, slotW, 36);

    // Up arrow (if active)
    if (isActive) {
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(x + slotW / 2 - 3, slotY - 10, 6, 1);
      ctx.fillRect(x + slotW / 2 - 2, slotY - 11, 4, 1);
      ctx.fillRect(x + slotW / 2 - 1, slotY - 12, 2, 1);

      // Down arrow
      ctx.fillRect(x + slotW / 2 - 3, slotY + 42, 6, 1);
      ctx.fillRect(x + slotW / 2 - 2, slotY + 43, 4, 1);
      ctx.fillRect(x + slotW / 2 - 1, slotY + 44, 2, 1);
    }

    // Character - blink if active
    if (!isActive || Math.floor(entry.blinkTimer / 8) % 2 === 0) {
      const charColor = isActive ? '#FFD700' : '#FFFFFF';
      drawTextOutline(char, x + slotW / 2, slotY + 8, charColor, '#000000', 18, 'center');
    }
  }

  // Instructions
  drawText('UP/DOWN - Change Letter', GAME_WIDTH / 2, 260, '#666688', 7, 'center');
  drawText('LEFT/RIGHT - Move Slot', GAME_WIDTH / 2, 275, '#666688', 7, 'center');
  drawText('ENTER - Confirm', GAME_WIDTH / 2, 290, '#666688', 7, 'center');

  // Show current leaderboard below
  const scores = loadLeaderboard();
  drawLeaderboardTable(scores, 320, rank - 1, time);
}

// Full leaderboard screen
export function drawLeaderboardScreen(entries, highlightIndex, time) {
  const ctx = document.getElementById('game').getContext('2d');

  // Background
  const grad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
  grad.addColorStop(0, '#1a1a3e');
  grad.addColorStop(1, '#0a0a1e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Stars
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < 40; i++) {
    const sx = (i * 73 + Math.sin(time * 0.01 + i) * 2) % GAME_WIDTH;
    const sy = (i * 37 + Math.cos(time * 0.015 + i) * 2) % 80;
    ctx.globalAlpha = 0.3 + 0.4 * Math.abs(Math.sin(time * 0.02 + i));
    ctx.fillRect(sx, sy, 1, 1);
  }
  ctx.globalAlpha = 1;

  // Rainbow header
  const rainbow = COLORS.rainbow;
  for (let i = 0; i < rainbow.length; i++) {
    ctx.fillStyle = rainbow[i];
    ctx.fillRect(30, 25 + i * 3, GAME_WIDTH - 60, 2);
  }

  drawTextOutline('LEADERBOARD', GAME_WIDTH / 2, 55, '#FFD700', '#000000', 14, 'center');

  drawLeaderboardTable(entries, 90, highlightIndex, time);

  // Continue prompt
  if (time > 60) {
    const blink = Math.sin(time * 0.06) > 0;
    if (blink) {
      drawTextOutline('PRESS ENTER', GAME_WIDTH / 2, GAME_HEIGHT - 40, '#FFFFFF', '#000000', 10, 'center');
    }
  }
}

// Shared leaderboard table drawing
function drawLeaderboardTable(entries, startY, highlightIndex, time) {
  // Header
  drawText('RANK', GAME_WIDTH / 2 - 100, startY, '#888899', 7, 'left');
  drawText('NAME', GAME_WIDTH / 2 - 40, startY, '#888899', 7, 'left');
  drawText('SCORE', GAME_WIDTH / 2 + 100, startY, '#888899', 7, 'right');

  // Divider
  drawRectScreen(GAME_WIDTH / 2 - 110, startY + 12, 220, 1, '#333355');

  for (let i = 0; i < Math.min(10, entries.length); i++) {
    const entry = entries[i];
    const y = startY + 18 + i * 14;
    const isHighlight = i === highlightIndex;

    // Highlight background
    if (isHighlight) {
      const pulse = 0.15 + 0.1 * Math.sin(time * 0.08);
      drawRectScreen(GAME_WIDTH / 2 - 115, y - 2, 230, 14, `rgba(255, 215, 0, ${pulse})`);
    }

    // Rank colors
    let rankColor;
    if (i === 0) rankColor = '#FFD700';      // Gold
    else if (i === 1) rankColor = '#CCCCDD';  // Silver
    else if (i === 2) rankColor = '#CC8844';  // Bronze
    else rankColor = isHighlight ? '#FFEE88' : '#777788';

    const textColor = isHighlight ? '#FFFFFF' : rankColor;

    drawText(`${i + 1}.`, GAME_WIDTH / 2 - 100, y, rankColor, 7, 'left');
    drawText(entry.name, GAME_WIDTH / 2 - 40, y, textColor, 7, 'left');
    drawText(String(entry.score).padStart(8, '0'), GAME_WIDTH / 2 + 100, y, textColor, 7, 'right');
  }
}
