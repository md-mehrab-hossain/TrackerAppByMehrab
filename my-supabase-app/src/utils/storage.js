// localStorage helper utilities for AquaPulse

const SETTINGS_KEY = 'aquapulse_settings';
const STREAK_KEY = 'aquapulse_streak';

/**
 * Bangladesh Timezone: Asia/Dhaka (UTC+6).
 * Returns a Date object adjusted to Bangladesh local time.
 */
function getBDTime() {
  const now = new Date();
  // Get UTC time, then add +6 hours for Bangladesh
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 6 * 3600000);
}

function formatDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getLogKey(dateStr) {
  return `aquapulse_log_${dateStr}`;
}

/**
 * Get the "effective tracking date" based on the user's reset hour.
 * All times are calculated in Bangladesh timezone (UTC+6).
 * E.g., if resetHour is 6 (6:00 AM BST), then 2:00 AM BST on April 11
 * still counts as April 10's tracking day.
 */
export function getEffectiveDate(resetHour = 6) {
  const bdNow = getBDTime();
  const effective = new Date(bdNow);
  if (bdNow.getHours() < resetHour) {
    effective.setDate(effective.getDate() - 1);
  }
  return formatDateString(effective);
}

/**
 * Get the next reset timestamp (for countdown display).
 * Calculated in Bangladesh timezone (UTC+6).
 */
export function getNextResetTimestamp(resetHour = 6) {
  const bdNow = getBDTime();
  const next = new Date(bdNow);
  next.setHours(resetHour, 0, 0, 0);
  if (bdNow >= next) {
    next.setDate(next.getDate() + 1);
  }
  // Convert back to real UTC timestamp for countdown math
  const realNow = new Date();
  const diffMs = next.getTime() - bdNow.getTime();
  return realNow.getTime() + diffMs;
}

/**
 * Get the current hour in Bangladesh timezone.
 */
export function getBDHour() {
  return getBDTime().getHours();
}

/**
 * Get current BD date string (YYYY-MM-DD).
 */
export function getBDDateString() {
  return formatDateString(getBDTime());
}


// --- Settings ---

const DEFAULT_SETTINGS = {
  intervalMinutes: 60,
  dailyGoal: 8,
  alarmActive: false,
  targetTimestamp: null,
  resetHour: 6, // Default reset at 6:00 AM
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

export function loadTodayLog(resetHour = 6) {
  const dateStr = getEffectiveDate(resetHour);
  try {
    const raw = localStorage.getItem(getLogKey(dateStr));
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { glasses: 0, lastDrank: null };
}

export function saveTodayLog(log, resetHour = 6) {
  const dateStr = getEffectiveDate(resetHour);
  localStorage.setItem(getLogKey(dateStr), JSON.stringify(log));
}

/**
 * Load a specific day's log by date string (YYYY-MM-DD).
 */
export function loadDayLog(dateStr) {
  try {
    const raw = localStorage.getItem(getLogKey(dateStr));
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

/**
 * Load all water logs for a given month.
 * Returns an object: { "2026-04-01": { glasses: 3, ... }, ... }
 */
export function getMonthHistory(year, month) {
  const history = {};
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const log = loadDayLog(dateStr);
    if (log && log.glasses > 0) {
      history[dateStr] = log;
    }
  }
  return history;
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
export function recalculateStreak(dailyGoal, resetHour = 6) {
  const streak = loadStreak();
  const today = getEffectiveDate(resetHour);

  // If lastDate is today, streak is current — no changes needed
  if (streak.lastDate === today) return streak;

  // Check if yesterday's goal was met
  const todayDate = new Date(today + 'T00:00:00');
  const yesterday = new Date(todayDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDateString(yesterday);

  try {
    const raw = localStorage.getItem(getLogKey(yesterdayStr));
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
export function markGoalReached(resetHour = 6) {
  const streak = loadStreak();
  const today = getEffectiveDate(resetHour);

  if (streak.lastDate === today) return streak; // Already marked today

  const newStreak = {
    count: streak.count + 1,
    lastDate: today,
  };
  saveStreak(newStreak);
  return newStreak;
}

