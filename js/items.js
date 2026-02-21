// Item and power-up system
import {
  ITEM_GRAVITY, ITEM_BOUNCE, ITEM_LIFETIME, TILE_SIZE,
  SCORE_FRUIT, SCORE_DIAMOND,
} from './config.js';
import { resolveEntityTileCollision, randInt, randFloat } from './utils.js';
import { sfxCollectItem, sfxCollectDiamond, sfxPowerup } from './audio.js';
import { spawnItemCollect } from './particles.js';

const ITEM_TYPES = {
  apple: { score: SCORE_FRUIT[0], color: '#FF3333', sprite: 'apple' },
  cherry: { score: SCORE_FRUIT[1], color: '#FF2255', sprite: 'cherry' },
  melon: { score: SCORE_FRUIT[2], color: '#44CC44', sprite: 'melon' },
  diamond: { score: SCORE_DIAMOND, color: '#66EEFF', sprite: 'diamond' },
  shoe: { score: 50, color: '#DD4444', sprite: 'shoe', powerup: 'speed' },
  potion: { score: 50, color: '#AA88FF', sprite: 'potion', powerup: 'rainbow' },
  star: { score: 100, color: '#FFD700', sprite: 'star', powerup: 'star' },
  heart: { score: 0, color: '#FF4466', sprite: 'heart', powerup: '1up' },
};

export function createItem(type, x, y, fromEnemy = false) {
  const info = ITEM_TYPES[type] || ITEM_TYPES.apple;
  return {
    type,
    x, y,
    vx: fromEnemy ? randFloat(-1.5, 1.5) : 0,
    vy: fromEnemy ? randFloat(-4, -2) : 0,
    hitboxOffX: 0,
    hitboxOffY: 0,
    hitboxW: 12,
    hitboxH: 12,
    spriteW: 12,
    spriteH: 12,
    active: true,
    lifetime: ITEM_LIFETIME,
    onGround: false,
    score: info.score,
    color: info.color,
    spriteName: info.sprite,
    powerup: info.powerup || null,
    bounce: 2, // Number of bounces before settling
    flashTimer: 0,
  };
}

export function updateItem(item, level) {
  if (!item.active) return;

  item.lifetime--;
  if (item.lifetime <= 0) {
    item.active = false;
    return;
  }

  // Flash when about to disappear
  if (item.lifetime < 120) {
    item.flashTimer++;
  }

  // Physics
  item.vy += ITEM_GRAVITY;
  item.vy = Math.min(item.vy, 6);

  const result = resolveEntityTileCollision(item, level);
  item.x = result.x;
  item.y = result.y;
  item.vx = result.vx;

  if (result.onGround) {
    if (item.bounce > 0 && Math.abs(item.vy) > 1) {
      item.vy = ITEM_BOUNCE * (item.bounce / 3);
      item.bounce--;
    } else {
      item.vy = 0;
      item.vx *= 0.8;
    }
    item.onGround = true;
  } else {
    item.vy = result.vy;
    item.onGround = false;
  }
}

export function collectItem(item, player) {
  if (!item.active) return null;

  item.active = false;
  spawnItemCollect(item.x + 6, item.y + 6, item.color);

  const result = {
    score: item.score,
    type: item.type,
    powerup: item.powerup,
  };

  if (item.powerup) {
    sfxPowerup();
    switch (item.powerup) {
      case 'speed':
        player.speedBoost = 600; // 10 seconds
        break;
      case 'rainbow':
        player.maxRainbows = Math.min(player.maxRainbows + 1, 5);
        break;
      case 'star':
        // Star effect handled by game.js (kill all enemies on screen)
        break;
      case '1up':
        player.lives++;
        break;
    }
  } else if (item.type === 'diamond') {
    sfxCollectDiamond();
    player.diamonds++;
  } else {
    sfxCollectItem();
  }

  player.score += item.score;
  return result;
}

export function getItemHitbox(item) {
  return {
    x: item.x + item.hitboxOffX,
    y: item.y + item.hitboxOffY,
    w: item.hitboxW,
    h: item.hitboxH,
  };
}

// Spawn items from enemy death
export function spawnEnemyDrops(enemyType, x, y) {
  const drops = [];

  switch (enemyType) {
    case 'walker':
      drops.push(createItem(['apple', 'cherry', 'melon'][randInt(0, 2)], x, y, true));
      break;
    case 'flyer':
      drops.push(createItem(['cherry', 'melon'][randInt(0, 1)], x, y, true));
      if (Math.random() < 0.15) {
        drops.push(createItem('diamond', x + 4, y, true));
      }
      break;
    case 'jumper':
      drops.push(createItem('diamond', x, y, true));
      break;
    case 'shooter':
      drops.push(createItem('melon', x, y, true));
      if (Math.random() < 0.1) {
        drops.push(createItem('shoe', x + 4, y, true));
      }
      break;
  }

  // Rare drops
  if (Math.random() < 0.03) {
    drops.push(createItem('heart', x, y - 8, true));
  }
  if (Math.random() < 0.05) {
    drops.push(createItem('potion', x, y - 8, true));
  }

  return drops;
}
