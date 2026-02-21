# Rainbow Islands - Development Guide

## Project Overview
A 2D platformer game inspired by Rainbow Islands (Bubble Bobble 2), built with pure HTML5 Canvas and vanilla JavaScript ES modules. No build tools, no frameworks, no dependencies.

## Architecture

### Tech Stack
- **Rendering**: HTML5 Canvas 2D (320x480 native resolution, scaled to fit window)
- **Audio**: Web Audio API (synthesized sound effects, no audio files)
- **Sprites**: Programmatically generated pixel art (no image assets)
- **Persistence**: localStorage for leaderboard
- **Modules**: ES6 modules (`<script type="module">`)

### File Structure
```
index.html          - Entry point, canvas element
js/
  main.js           - Boot: initializes game, starts loop
  config.js         - All constants (physics, tile sizes, colors, game states)
  input.js          - Keyboard input with per-frame press/release tracking
  renderer.js       - Canvas rendering, camera, screen shake
  sprites.js        - Pixel art sprite generation (player, enemies, tiles, items)
  audio.js          - Web Audio API synthesized sound effects
  utils.js          - AABB collision, tile queries, math helpers
  particles.js      - Particle system (dust, sparkles, explosions)
  player.js         - Player entity: physics, coyote time, jump buffer
  rainbow.js        - Rainbow weapon: arc generation, platform, falling
  enemies.js        - Enemy types (walker, flyer, jumper, shooter) + projectiles
  items.js          - Item/power-up system with drops
  level.js          - Level data (8 levels), tile generation, water system
  ui.js             - HUD, title screen, level select, menus, leaderboard display
  leaderboard.js    - High score persistence with localStorage
  progress.js       - Level unlock progression with localStorage persistence
  game.js           - Game state machine, main update/render loop, collision
```

### Key Design Decisions
- **No build step**: ES modules loaded directly by browser. Requires HTTP server (GitHub Pages, `python3 -m http.server`, etc.)
- **Pixel-perfect rendering**: `imageSmoothingEnabled = false`, CSS `image-rendering: pixelated`
- **Fixed game resolution**: 320x480 internal, CSS-scaled to integer multiples
- **Tile size**: 16px. Level grid is 20 columns wide.
- **Sprite generation**: All art is drawn via canvas API at startup, cached as offscreen canvases

### Game States
`title` → `level_select` → `level_intro` → `playing` → `level_clear` → (next level or level_select)
`playing` → `paused` → `playing`
`playing` → `game_over` → `enter_initials` → `leaderboard` → `level_select`

### Physics Constants (config.js)
- Gravity: 0.42 px/frame², fall multiplier: 1.5x
- Player max speed: 2.2 px/frame, jump velocity: -6.2
- Coyote time: 7 frames, jump buffer: 7 frames
- Variable jump height via early release (0.38x velocity cut)

### Collision System
- Tile collision: AABB vs grid cells, horizontal then vertical resolution
- One-way platforms: only collide when falling from above
- Rainbow platforms: segment-based collision, 24 segments per arc
- Entity hitboxes: slightly smaller than sprites for forgiving gameplay

## Development

### Running Locally
```bash
python3 -m http.server 8000
# Open http://localhost:8000
```
### Development principles
- Test with code analysis tools to check quality (does not need to be perfect)
- Loosely coupled
- MVP mindset
- Do NOT add claude as co-author to the git commit messages
- Always read CLAUDE.md before committing to respect project rules
- Version number lives in `config.js` (`VERSION`) - bump it on notable changes
- GitHub Pages deploys via `.github/workflows/deploy.yml` on push to main
- Game is hosted at https://smidigbommen.github.io/rainbow-island/
- Local server may already be running - check before starting a new one

### Adding a New Level
1. Add a level config object in `js/level.js` following the existing pattern
2. Add it to the `LEVEL_CONFIGS` array
3. Levels are tile grids (20 wide, variable height) with enemy/item spawn lists

### Adding a New Enemy Type
1. Add constants in `config.js`
2. Add sprite generation in `sprites.js` (`makeEnemySprite`)
3. Add AI update function in `enemies.js`
4. Register in `createEnemy` switch and sprite cache

### Controls
- Arrow Keys / WASD: Move
- Space / Z / Up: Jump
- X / C: Shoot rainbow
- Enter: Start / Confirm
- Escape: Pause
