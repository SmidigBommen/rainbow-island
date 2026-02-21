// Entry point
import { initGame, gameLoop } from './game.js';

// Wait for DOM
window.addEventListener('DOMContentLoaded', () => {
  initGame();
  requestAnimationFrame(gameLoop);
});
