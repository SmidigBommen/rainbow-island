// Rainbow weapon - can be used as weapon and platform
import {
  RAINBOW_SPEED, RAINBOW_LIFETIME, RAINBOW_WIDTH, RAINBOW_HEIGHT,
  RAINBOW_ARC_SEGMENTS, COLORS, TILE_SIZE,
} from './config.js';
import { sfxRainbow, sfxRainbowCrumble } from './audio.js';
import { spawnRainbowSparkle, spawnRainbowCrumble } from './particles.js';
import { isTileSolid, getTileAt } from './utils.js';

export function createRainbowManager() {
  return {
    rainbows: [],
    maxRainbows: 2,
  };
}

export function shootRainbow(manager, x, y, facingRight, level) {
  // Count active rainbows
  const activeCount = manager.rainbows.filter(r => r.active).length;
  if (activeCount >= manager.maxRainbows) return false;

  const rainbow = {
    active: true,
    x, y,
    dir: facingRight ? 1 : -1,
    segments: [],
    buildProgress: 0,
    maxSegments: 24, // More segments for smooth arc
    lifetime: RAINBOW_LIFETIME,
    falling: false,
    fallSpeed: 0,
    segWidth: 4, // Narrower segments, but more of them
    alpha: 1,
    damageActive: true,
  };

  // Build arc segments
  buildRainbowArc(rainbow, level);

  manager.rainbows.push(rainbow);
  sfxRainbow();
  return true;
}

function buildRainbowArc(rainbow, level) {
  // Rainbow arcs upward and forward, like a bridge
  const startX = rainbow.x;
  const startY = rainbow.y;
  const dir = rainbow.dir;

  const totalSegs = rainbow.maxSegments;
  const arcWidth = 70;  // Total horizontal span
  const arcHeight = 48; // Peak height of the arc
  const segments = [];

  for (let i = 0; i < totalSegs; i++) {
    const t = i / (totalSegs - 1);
    const arcX = startX + dir * t * arcWidth;
    const arcY = startY - Math.sin(t * Math.PI) * arcHeight;

    // Check if segment hits a solid tile
    const col = Math.floor(arcX / TILE_SIZE);
    const row = Math.floor((arcY - 8) / TILE_SIZE); // Check slightly above for rainbow height
    if (isTileSolid(getTileAt(level, col, row))) {
      break; // Stop building at solid tile
    }

    segments.push({ x: arcX, y: arcY });
  }

  rainbow.segments = segments;
}

export function updateRainbows(manager, level) {
  for (let i = manager.rainbows.length - 1; i >= 0; i--) {
    const rb = manager.rainbows[i];
    if (!rb.active) continue;

    rb.lifetime--;

    if (rb.falling) {
      // Rainbow is falling after being jumped on
      rb.fallSpeed += 0.3;
      for (const seg of rb.segments) {
        seg.y += rb.fallSpeed;
      }
      rb.alpha -= 0.02;

      // Check if fallen off screen or faded
      if (rb.alpha <= 0 || (rb.segments.length > 0 && rb.segments[0].y > level.height * TILE_SIZE)) {
        rb.active = false;
      }
    } else {
      // Flash before disappearing
      if (rb.lifetime < 60) {
        rb.alpha = 0.3 + 0.7 * Math.abs(Math.sin(rb.lifetime * 0.2));
      }

      // Sparkle effect
      if (rb.lifetime % 10 === 0 && rb.segments.length > 0) {
        const seg = rb.segments[Math.floor(Math.random() * rb.segments.length)];
        spawnRainbowSparkle(seg.x + rb.segWidth / 2, seg.y);
      }

      if (rb.lifetime <= 0) {
        // Rainbow crumbles
        spawnRainbowCrumble(rb.segments);
        sfxRainbowCrumble();
        rb.active = false;
      }
    }
  }

  // Clean up inactive rainbows
  manager.rainbows = manager.rainbows.filter(r => r.active);
}

export function makeRainbowFall(rainbow) {
  if (!rainbow.falling) {
    rainbow.falling = true;
    rainbow.fallSpeed = 0;
    rainbow.damageActive = true; // Can damage enemies while falling
  }
}

export function getRainbowHitboxes(rainbow) {
  if (!rainbow.active) return [];
  return rainbow.segments.map((seg, i) => {
    const nextSeg = rainbow.segments[i + 1];
    const w = nextSeg ? Math.ceil(Math.abs(nextSeg.x - seg.x)) + 1 : 4;
    return {
      x: seg.x,
      y: seg.y - 8, // Top of rainbow bands
      w: w,
      h: 16, // Full rainbow height for collision
    };
  });
}
