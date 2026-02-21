// Level unlock progression with localStorage persistence
const STORAGE_KEY = 'rainbow_islands_progress';
const TOTAL_LEVELS = 8;

export function loadProgress() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length === TOTAL_LEVELS) {
        // Ensure level 1 is always unlocked
        parsed[0] = true;
        return parsed;
      }
    }
  } catch (e) {
    // localStorage not available or corrupted
  }
  return getDefaultProgress();
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    // localStorage not available
  }
}

export function unlockNextLevel(clearedIndex) {
  const progress = loadProgress();
  if (clearedIndex + 1 < TOTAL_LEVELS) {
    progress[clearedIndex + 1] = true;
  }
  saveProgress(progress);
  return progress;
}

export function isLevelUnlocked(index) {
  const progress = loadProgress();
  return !!progress[index];
}

function getDefaultProgress() {
  const progress = new Array(TOTAL_LEVELS).fill(false);
  progress[0] = true; // Level 1 always unlocked
  return progress;
}
