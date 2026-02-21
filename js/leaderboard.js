// Leaderboard system with localStorage persistence
const STORAGE_KEY = 'rainbow_islands_leaderboard';
const MAX_ENTRIES = 10;

const DEFAULT_SCORES = [
  { name: 'AAA', score: 5000 },
  { name: 'BBB', score: 4000 },
  { name: 'CCC', score: 3000 },
  { name: 'DDD', score: 2000 },
  { name: 'EEE', score: 1000 },
];

export function loadLeaderboard() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(0, MAX_ENTRIES);
      }
    }
  } catch (e) {
    // localStorage not available or corrupted
  }
  return [...DEFAULT_SCORES];
}

export function saveLeaderboard(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch (e) {
    // localStorage not available
  }
}

export function isHighScore(score) {
  const entries = loadLeaderboard();
  if (entries.length < MAX_ENTRIES) return true;
  return score > entries[entries.length - 1].score;
}

export function addScore(name, score) {
  const entries = loadLeaderboard();
  entries.push({ name, score });
  entries.sort((a, b) => b.score - a.score);
  const trimmed = entries.slice(0, MAX_ENTRIES);
  saveLeaderboard(trimmed);
  return trimmed;
}

export function getRank(score) {
  const entries = loadLeaderboard();
  for (let i = 0; i < entries.length; i++) {
    if (score > entries[i].score) return i + 1;
  }
  if (entries.length < MAX_ENTRIES) return entries.length + 1;
  return -1; // Not a high score
}

export function clearLeaderboard() {
  saveLeaderboard([...DEFAULT_SCORES]);
}

// Initial entry state machine
export function createInitialEntry() {
  return {
    chars: [65, 65, 65], // A, A, A
    pos: 0, // Current character being edited (0-2)
    done: false,
    blinkTimer: 0,
  };
}

export function updateInitialEntry(entry, inputUp, inputDown, inputLeft, inputRight, inputConfirm) {
  if (entry.done) return;

  entry.blinkTimer++;

  if (inputUp) {
    entry.chars[entry.pos]++;
    if (entry.chars[entry.pos] > 90) entry.chars[entry.pos] = 65; // Z -> A
  }
  if (inputDown) {
    entry.chars[entry.pos]--;
    if (entry.chars[entry.pos] < 65) entry.chars[entry.pos] = 90; // A -> Z
  }
  if (inputRight) {
    entry.pos = Math.min(2, entry.pos + 1);
  }
  if (inputLeft) {
    entry.pos = Math.max(0, entry.pos - 1);
  }
  if (inputConfirm) {
    if (entry.pos < 2) {
      entry.pos++;
    } else {
      entry.done = true;
    }
  }
}

export function getInitialString(entry) {
  return String.fromCharCode(...entry.chars);
}
