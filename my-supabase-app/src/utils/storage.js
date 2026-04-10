// localStorage helper utilities for AquaPulse

const SETTINGS_KEY = 'aquapulse_settings';
const STREAK_KEY = 'aquapulse_streak';

function getLogKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `aquapulse_log_${y}-${m}-${d}`;
}

function getDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// --- Settings ---

const DEFAULT_SETTINGS = {
  intervalMinutes: 60,
  dailyGoal: 8,
  alarmActive: false,
  targetTimestamp: null,
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // ignore corrupt data
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// --- Water Log ---

export function loadTodayLog() {
  try {
    const raw = localStorage.getItem(getLogKey());
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { glasses: 0, lastDrank: null };
}

export function saveTodayLog(log) {
  localStorage.setItem(getLogKey(), JSON.stringify(log));
}

// --- Streak ---

export function loadStreak() {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { count: 0, lastDate: null };
}

export function saveStreak(streak) {
  localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
}

/**
 * Recalculate streak based on whether yesterday's goal was met.
 * Called on app load and when a glass is logged.
 */
export function recalculateStreak(dailyGoal) {
  const streak = loadStreak();
  const today = getDateString();

  // If lastDate is today, streak is current — no changes needed
  if (streak.lastDate === today) return streak;

  // Check if yesterday's goal was met
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = getLogKey(yesterday);
  const yesterdayStr = getDateString(yesterday);

  try {
    const raw = localStorage.getItem(yesterdayKey);
    if (raw) {
      const log = JSON.parse(raw);
      if (log.glasses >= dailyGoal && streak.lastDate === yesterdayStr) {
        // Streak continues (will be incremented when today's goal is met)
        return streak;
      }
    }
  } catch {
    // ignore
  }

  // If lastDate is not yesterday and not today, streak is broken
  if (streak.lastDate !== yesterdayStr && streak.lastDate !== today) {
    const reset = { count: 0, lastDate: null };
    saveStreak(reset);
    return reset;
  }

  return streak;
}

/**
 * Update streak when daily goal is reached.
 */
export function markGoalReached() {
  const streak = loadStreak();
  const today = getDateString();

  if (streak.lastDate === today) return streak; // Already marked today

  const newStreak = {
    count: streak.count + 1,
    lastDate: today,
  };
  saveStreak(newStreak);
  return newStreak;
}
