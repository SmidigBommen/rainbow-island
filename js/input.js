// Keyboard input handler
const keys = {};
const justPressed = {};
const justReleased = {};

export function initInput() {
  window.addEventListener('keydown', (e) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'KeyZ', 'KeyX', 'KeyC', 'Enter', 'Escape'].includes(e.code)) {
      e.preventDefault();
    }
    if (!keys[e.code]) {
      justPressed[e.code] = true;
    }
    keys[e.code] = true;
  });

  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    justReleased[e.code] = true;
  });
}

export function clearFrameInput() {
  for (const key in justPressed) {
    justPressed[key] = false;
  }
  for (const key in justReleased) {
    justReleased[key] = false;
  }
}

export function isDown(code) {
  return !!keys[code];
}

export function wasPressed(code) {
  return !!justPressed[code];
}

export function wasReleased(code) {
  return !!justReleased[code];
}

// Convenience helpers
export function leftDown() { return isDown('ArrowLeft') || isDown('KeyA'); }
export function rightDown() { return isDown('ArrowRight') || isDown('KeyD'); }
export function upDown() { return isDown('ArrowUp') || isDown('KeyW'); }
export function downDown() { return isDown('ArrowDown') || isDown('KeyS'); }
export function jumpPressed() { return wasPressed('Space') || wasPressed('KeyZ') || wasPressed('ArrowUp') || wasPressed('KeyW'); }
export function jumpReleased() { return wasReleased('Space') || wasReleased('KeyZ') || wasReleased('ArrowUp') || wasReleased('KeyW'); }
export function jumpDown() { return isDown('Space') || isDown('KeyZ') || isDown('ArrowUp') || isDown('KeyW'); }
export function shootPressed() { return wasPressed('KeyX') || wasPressed('KeyC'); }
export function startPressed() { return wasPressed('Enter') || wasPressed('Space'); }
export function pausePressed() { return wasPressed('Escape'); }
