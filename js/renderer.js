import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE, COLORS } from './config.js';
import { getSprites } from './sprites.js';
import { clamp } from './utils.js';

let canvas, ctx;
let cameraY = 0;
let targetCameraY = 0;
let shakeX = 0, shakeY = 0;
let shakeTimer = 0;

export function initRenderer() {
  canvas = document.getElementById('game');
  canvas.width = GAME_WIDTH;
  canvas.height = GAME_HEIGHT;
  ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
  const windowW = window.innerWidth;
  const windowH = window.innerHeight;
  const scale = Math.min(
    Math.floor(windowW / GAME_WIDTH),
    Math.floor(windowH / GAME_HEIGHT)
  ) || 1;
  canvas.style.width = (GAME_WIDTH * scale) + 'px';
  canvas.style.height = (GAME_HEIGHT * scale) + 'px';
  canvas.style.imageRendering = 'pixelated';
}

export function getCanvas() { return canvas; }
export function getCtx() { return ctx; }

// Camera
export function setCameraTarget(y) {
  targetCameraY = y;
}

export function updateCamera() {
  // Smooth camera follow
  cameraY += (targetCameraY - cameraY) * 0.1;

  // Screen shake
  if (shakeTimer > 0) {
    shakeTimer--;
    shakeX = (Math.random() - 0.5) * shakeTimer * 0.5;
    shakeY = (Math.random() - 0.5) * shakeTimer * 0.5;
  } else {
    shakeX = 0;
    shakeY = 0;
  }
}

export function getCameraY() { return cameraY; }

export function screenShake(frames) {
  shakeTimer = frames;
}

// Clear screen
export function clear(color = COLORS.sky) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
}

// Draw sky gradient
export function drawSkyGradient(levelHeight) {
  const grad = ctx.createLinearGradient(0, -cameraY, 0, levelHeight - cameraY);
  grad.addColorStop(0, '#4A7FB5');
  grad.addColorStop(0.5, '#87CEEB');
  grad.addColorStop(1, '#B8E0F0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Draw some background clouds
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  const cloudY = (-cameraY * 0.3) % (GAME_HEIGHT + 100);
  drawCloud(30, cloudY + 50);
  drawCloud(200, cloudY + 180);
  drawCloud(100, cloudY + 350);
  drawCloud(250, cloudY + 80);
  drawCloud(60, cloudY + 280);
}

function drawCloud(x, y) {
  ctx.fillRect(x, y, 30, 8);
  ctx.fillRect(x + 5, y - 4, 20, 6);
  ctx.fillRect(x + 10, y - 7, 12, 5);
  ctx.fillRect(x - 3, y + 2, 10, 4);
}

// Draw tiles
export function drawTiles(level) {
  const sprites = getSprites();
  if (!sprites) return;

  const startRow = Math.max(0, Math.floor(cameraY / TILE_SIZE));
  const endRow = Math.min(level.height, Math.ceil((cameraY + GAME_HEIGHT) / TILE_SIZE) + 1);

  for (let row = startRow; row < endRow; row++) {
    for (let col = 0; col < level.width; col++) {
      const tile = level.tiles[row][col];
      if (tile === 0) continue;

      const screenX = col * TILE_SIZE + Math.round(shakeX);
      const screenY = row * TILE_SIZE - Math.round(cameraY) + Math.round(shakeY);

      if (tile === 1) {
        ctx.drawImage(sprites.tiles.solid, screenX, screenY);
      } else if (tile === 2) {
        ctx.drawImage(sprites.tiles.grass, screenX, screenY);
      } else if (tile === 3) {
        ctx.drawImage(sprites.tiles.platform, screenX, screenY);
      }
    }
  }
}

// Draw sprite with optional flip
export function drawSprite(sprite, x, y, flipX = false) {
  const screenX = Math.round(x + shakeX);
  const screenY = Math.round(y - cameraY + shakeY);

  if (screenY < -sprite.height - 10 || screenY > GAME_HEIGHT + 10) return;

  if (flipX) {
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(sprite, -screenX - sprite.width, screenY);
    ctx.restore();
  } else {
    ctx.drawImage(sprite, screenX, screenY);
  }
}

// Draw a rectangle in world space
export function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(
    Math.round(x + shakeX),
    Math.round(y - cameraY + shakeY),
    w, h
  );
}

// Draw a rectangle in screen space (for UI)
export function drawRectScreen(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

// Draw text in screen space
export function drawText(text, x, y, color = '#FFFFFF', size = 8, align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${size}px monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  ctx.fillText(text, x, y);
}

// Draw text with outline
export function drawTextOutline(text, x, y, color = '#FFFFFF', outlineColor = '#000000', size = 8, align = 'center') {
  ctx.font = `bold ${size}px monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  // Outline
  ctx.fillStyle = outlineColor;
  for (let ox = -1; ox <= 1; ox++) {
    for (let oy = -1; oy <= 1; oy++) {
      if (ox === 0 && oy === 0) continue;
      ctx.fillText(text, x + ox, y + oy);
    }
  }
  // Text
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

// Draw water with reflection
export function drawWater(waterY, time) {
  const screenWaterY = waterY - cameraY;
  if (screenWaterY > GAME_HEIGHT) return;

  const drawY = Math.max(0, Math.round(screenWaterY + shakeY));
  const bodyY = drawY + 6;
  const reflectionH = GAME_HEIGHT - bodyY;

  // Reflection: flip the scene above water into the area below
  if (reflectionH > 0 && drawY > 0) {
    // How many pixels above water to capture for reflection
    const captureH = Math.min(drawY, reflectionH);

    ctx.save();

    // Clip to water body area
    ctx.beginPath();
    ctx.rect(0, bodyY, GAME_WIDTH, reflectionH);
    ctx.clip();

    // Draw flipped scene: scanline-by-scanline with wave distortion
    for (let row = 0; row < captureH; row++) {
      const srcY = drawY - 1 - row; // mirror from water line upward
      if (srcY < 0) break;
      const dstY = bodyY + row;

      // Horizontal wave distortion
      const waveOff = Math.sin(row * 0.08 + time * 0.04) * (2 + row * 0.02);

      ctx.drawImage(
        canvas,
        0, srcY, GAME_WIDTH, 1,                           // source: 1px strip
        Math.round(waveOff), dstY, GAME_WIDTH, 1           // dest: shifted strip
      );
    }

    ctx.restore();

    // Blue tint overlay on the reflection
    ctx.fillStyle = 'rgba(20, 50, 140, 0.55)';
    ctx.fillRect(0, bodyY, GAME_WIDTH, reflectionH);

    // Fade the reflection: darker the further from surface
    const fadeGrad = ctx.createLinearGradient(0, bodyY, 0, bodyY + reflectionH);
    fadeGrad.addColorStop(0, 'rgba(15, 30, 80, 0.0)');
    fadeGrad.addColorStop(1, 'rgba(15, 30, 80, 0.7)');
    ctx.fillStyle = fadeGrad;
    ctx.fillRect(0, bodyY, GAME_WIDTH, reflectionH);
  } else if (reflectionH > 0) {
    // Water is at the very top or above - just fill solid
    ctx.fillStyle = 'rgba(34, 68, 170, 0.85)';
    ctx.fillRect(0, bodyY, GAME_WIDTH, reflectionH);
  }

  // Water surface (wavy line)
  ctx.fillStyle = COLORS.waterSurface;
  for (let x = 0; x < GAME_WIDTH; x += 2) {
    const waveOffset = Math.sin(x * 0.1 + time * 0.05) * 3;
    ctx.fillRect(x, drawY + waveOffset, 2, 4);
  }

  // Highlight on waves
  ctx.fillStyle = COLORS.waterHighlight;
  for (let x = 0; x < GAME_WIDTH; x += 8) {
    const waveOffset = Math.sin(x * 0.1 + time * 0.05) * 3;
    ctx.fillRect(x, drawY + waveOffset, 3, 1);
  }

  // Bubbles
  if (reflectionH > 4) {
    ctx.fillStyle = 'rgba(100, 170, 255, 0.3)';
    for (let i = 0; i < 10; i++) {
      const bx = (i * 37 + Math.sin(time * 0.02 + i) * 10) % GAME_WIDTH;
      const by = bodyY + ((i * 23 + time * 0.3) % Math.max(1, reflectionH));
      const br = 1 + (i % 3);
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Draw rainbow arc
export function drawRainbow(rainbow) {
  const colors = COLORS.rainbow;
  const segments = rainbow.segments;
  if (!segments || segments.length < 2) return;

  const bandH = 2; // Height of each color band
  const numBands = colors.length; // 7 bands
  const halfHeight = Math.floor(numBands * bandH / 2);

  ctx.globalAlpha = rainbow.alpha || 1;

  // Draw outline/shadow first for definition
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const sx = Math.round(seg.x + shakeX);
    const sy = Math.round(seg.y - cameraY + shakeY);
    const nextSeg = segments[i + 1];
    const w = nextSeg ? Math.ceil(Math.abs(nextSeg.x - seg.x)) + 1 : 3;
    ctx.fillRect(sx - 1, sy - halfHeight - 1, w + 2, numBands * bandH + 2);
  }

  // Draw each segment as a vertical column of all 7 rainbow bands
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const sx = Math.round(seg.x + shakeX);
    const sy = Math.round(seg.y - cameraY + shakeY);

    // Calculate width to next segment (fill gaps)
    const nextSeg = segments[i + 1];
    const w = nextSeg ? Math.ceil(Math.abs(nextSeg.x - seg.x)) + 1 : 3;

    // Draw all 7 color bands
    for (let band = 0; band < numBands; band++) {
      ctx.fillStyle = colors[band];
      ctx.fillRect(sx, sy - halfHeight + band * bandH, w, bandH);
    }
  }

  // White highlight on top edge
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const sx = Math.round(seg.x + shakeX);
    const sy = Math.round(seg.y - cameraY + shakeY);
    const nextSeg = segments[i + 1];
    const w = nextSeg ? Math.ceil(Math.abs(nextSeg.x - seg.x)) + 1 : 3;
    ctx.fillRect(sx, sy - halfHeight, w, 1);
  }

  ctx.globalAlpha = 1;
}

// Draw particles
export function drawParticles(particles) {
  for (const p of particles) {
    const screenX = Math.round(p.x + shakeX);
    const screenY = Math.round(p.y - cameraY + shakeY);
    ctx.globalAlpha = p.alpha || 1;
    ctx.fillStyle = p.color;
    ctx.fillRect(screenX, screenY, p.size || 2, p.size || 2);
  }
  ctx.globalAlpha = 1;
}
