// Game configuration constants
export const VERSION = '0.2.1';
export const TILE_SIZE = 16;
export const GAME_WIDTH = 320;
export const GAME_HEIGHT = 480;
export const COLS = GAME_WIDTH / TILE_SIZE; // 20
export const VISIBLE_ROWS = GAME_HEIGHT / TILE_SIZE; // 30

// Physics
export const GRAVITY = 0.42;
export const MAX_FALL_SPEED = 7;
export const FALL_GRAVITY_MULT = 1.5; // Faster falling for snappier feel

// Player
export const PLAYER_MAX_SPEED = 2.2;
export const PLAYER_ACCEL = 0.4;
export const PLAYER_DECEL = 0.35;
export const PLAYER_AIR_ACCEL = 0.22;
export const PLAYER_AIR_DECEL = 0.08;
export const PLAYER_JUMP_VEL = -6.2;
export const PLAYER_JUMP_CUT_MULT = 0.38;
export const COYOTE_FRAMES = 7;
export const JUMP_BUFFER_FRAMES = 7;
export const PLAYER_WIDTH = 10;
export const PLAYER_HEIGHT = 20;

// Rainbow
export const RAINBOW_SPEED = 3.5;
export const RAINBOW_LIFETIME = 200; // frames
export const RAINBOW_MAX_DEFAULT = 2;
export const RAINBOW_WIDTH = 40;
export const RAINBOW_HEIGHT = 8;
export const RAINBOW_ARC_SEGMENTS = 5;

// Enemies
export const ENEMY_WALKER_SPEED = 0.8;
export const ENEMY_FLYER_SPEED = 1.0;
export const ENEMY_JUMPER_SPEED = 0.6;
export const ENEMY_SHOOTER_SPEED = 0;
export const ENEMY_PROJECTILE_SPEED = 2.5;

// Water
export const WATER_BASE_SPEED = 0.12;
export const WATER_ACCEL = 0.00008;
export const WATER_DELAY_FRAMES = 480; // 8 seconds before water starts

// Items
export const ITEM_GRAVITY = 0.2;
export const ITEM_BOUNCE = -3;
export const ITEM_LIFETIME = 600; // 10 seconds

// Timing
export const FPS = 60;
export const FRAME_TIME = 1000 / FPS;

// Scoring
export const SCORE_ENEMY_KILL = 200;
export const SCORE_CHAIN_MULT = 1.5;
export const SCORE_FRUIT = [100, 200, 300, 500];
export const SCORE_DIAMOND = 1000;
export const SCORE_BIG_DIAMOND = 10000;

// Game states
export const STATE_TITLE = 'title';
export const STATE_PLAYING = 'playing';
export const STATE_LEVEL_INTRO = 'level_intro';
export const STATE_LEVEL_CLEAR = 'level_clear';
export const STATE_GAME_OVER = 'game_over';
export const STATE_ENTER_INITIALS = 'enter_initials';
export const STATE_LEADERBOARD = 'leaderboard';
export const STATE_PAUSED = 'paused';
export const STATE_LEVEL_SELECT = 'level_select';

// Tile types
export const TILE_EMPTY = 0;
export const TILE_SOLID = 1;
export const TILE_GRASS = 2;
export const TILE_PLATFORM = 3; // one-way, jump through from below

// Colors
export const COLORS = {
  sky: '#87CEEB',
  skyDark: '#4A7FB5',
  water: '#2244AA',
  waterSurface: '#4488DD',
  waterHighlight: '#66AAFF',
  grass: '#44AA44',
  grassDark: '#338833',
  dirt: '#996633',
  dirtDark: '#774422',
  stone: '#888888',
  stoneDark: '#666666',
  platform: '#CC8844',
  platformDark: '#AA6622',
  rainbow: ['#FF0000', '#FF7700', '#FFFF00', '#00CC00', '#0088FF', '#4400FF', '#8800CC'],
  skin: '#FFD4A8',
  skinDark: '#E0B088',
  hair: '#884422',
  shirtBlue: '#4488FF',
  shirtBlueDark: '#2266CC',
  pantsGreen: '#44AA44',
  pantsGreenDark: '#228822',
  shoeBrown: '#664422',
  white: '#FFFFFF',
  black: '#000000',
  uiBg: '#1a1a2e',
  uiText: '#FFFFFF',
  uiAccent: '#FFD700',
};
