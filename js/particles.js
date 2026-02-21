// Particle system for visual effects
import { COLORS } from './config.js';
import { randFloat, randInt } from './utils.js';

const particles = [];

export function addParticle(x, y, vx, vy, color, life = 30, size = 2, gravity = 0.1) {
  particles.push({
    x, y, vx, vy, color, life, maxLife: life, size, gravity,
    alpha: 1,
  });
}

export function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.life--;
    p.alpha = Math.max(0, p.life / p.maxLife);
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

export function getParticles() {
  return particles;
}

export function clearParticles() {
  particles.length = 0;
}

// Pre-built particle effects
export function spawnJumpDust(x, y) {
  for (let i = 0; i < 5; i++) {
    addParticle(
      x + randFloat(-4, 4), y,
      randFloat(-1, 1), randFloat(-1, 0),
      '#CCBB99', randInt(10, 20), randInt(1, 3), 0.05
    );
  }
}

export function spawnLandDust(x, y) {
  for (let i = 0; i < 8; i++) {
    addParticle(
      x + randFloat(-6, 6), y,
      randFloat(-1.5, 1.5), randFloat(-2, -0.5),
      '#CCBB99', randInt(10, 25), randInt(1, 3), 0.08
    );
  }
}

export function spawnRainbowSparkle(x, y) {
  const colors = COLORS.rainbow;
  for (let i = 0; i < 6; i++) {
    addParticle(
      x + randFloat(-3, 3), y + randFloat(-3, 3),
      randFloat(-1, 1), randFloat(-2, 0),
      colors[randInt(0, colors.length - 1)],
      randInt(15, 30), randInt(1, 3), 0.03
    );
  }
}

export function spawnRainbowCrumble(segments) {
  const colors = COLORS.rainbow;
  for (const seg of segments) {
    for (let i = 0; i < 2; i++) {
      addParticle(
        seg.x + randFloat(0, 8), seg.y + randFloat(-2, 4),
        randFloat(-1.5, 1.5), randFloat(-2, 1),
        colors[randInt(0, colors.length - 1)],
        randInt(15, 30), randInt(1, 3), 0.15
      );
    }
  }
}

export function spawnEnemyDeath(x, y, color) {
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    addParticle(
      x, y,
      Math.cos(angle) * randFloat(1, 3),
      Math.sin(angle) * randFloat(1, 3),
      color, randInt(20, 40), randInt(2, 4), 0.05
    );
  }
  // Stars
  for (let i = 0; i < 4; i++) {
    addParticle(
      x + randFloat(-8, 8), y + randFloat(-8, 8),
      randFloat(-0.5, 0.5), randFloat(-2, -1),
      '#FFFF00', randInt(20, 35), 3, 0.02
    );
  }
}

export function spawnItemCollect(x, y, color) {
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    addParticle(
      x, y,
      Math.cos(angle) * randFloat(0.5, 2),
      Math.sin(angle) * randFloat(0.5, 2),
      color, randInt(15, 25), 2, 0.02
    );
  }
}

export function spawnSplash(x, y) {
  for (let i = 0; i < 10; i++) {
    addParticle(
      x + randFloat(-10, 10), y,
      randFloat(-1.5, 1.5), randFloat(-4, -1),
      '#66AAFF', randInt(15, 30), randInt(2, 4), 0.15
    );
  }
}

export function spawnScorePopup(x, y, score) {
  // Simple score popup using particles as text markers
  addParticle(x, y, 0, -0.8, '#FFD700', 60, 1, 0);
}
