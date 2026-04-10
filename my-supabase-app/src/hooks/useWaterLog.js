import { useState, useCallback, useEffect, useRef } from 'react';
import {
  loadTodayLog,
  saveTodayLog,
  loadStreak,
  recalculateStreak,
  markGoalReached,
  getEffectiveDate,
} from '../utils/storage';

/**
 * Hook for tracking daily water intake.
 * Supports custom reset hour (default 6 AM).
 */
export function useWaterLog(dailyGoal, resetHour = 6) {
  const [log, setLog] = useState(() => loadTodayLog(resetHour));
  const [streak, setStreak] = useState(() => loadStreak());
  const effectiveDateRef = useRef(getEffectiveDate(resetHour));

  // Recalculate streak on load
  useEffect(() => {
    const updated = recalculateStreak(dailyGoal, resetHour);
    setStreak(updated);
  }, [dailyGoal, resetHour]);

  // Check for reset time crossover (every 10 seconds for accuracy)
  useEffect(() => {
    const check = setInterval(() => {
      const currentEffective = getEffectiveDate(resetHour);
      if (currentEffective !== effectiveDateRef.current) {
        // Day has changed — reload fresh log for the new day
        effectiveDateRef.current = currentEffective;
        const fresh = loadTodayLog(resetHour);
        setLog(fresh);
        const updatedStreak = recalculateStreak(dailyGoal, resetHour);
        setStreak(updatedStreak);
      }
    }, 10_000);

    return () => clearInterval(check);
  }, [resetHour, dailyGoal]);

  // Re-sync when resetHour changes
  useEffect(() => {
    effectiveDateRef.current = getEffectiveDate(resetHour);
    setLog(loadTodayLog(resetHour));
  }, [resetHour]);

  const incrementGlass = useCallback(() => {
    setLog((prev) => {
      const updated = {
        glasses: prev.glasses + 1,
        lastDrank: new Date().toISOString(),
      };
      saveTodayLog(updated, resetHour);

      // Check if goal just reached
      if (updated.glasses >= dailyGoal) {
        const newStreak = markGoalReached(resetHour);
        setStreak(newStreak);
      }

      return updated;
    });
  }, [dailyGoal, resetHour]);

  const decrementGlass = useCallback(() => {
    setLog((prev) => {
      if (prev.glasses <= 0) return prev;
      const updated = {
        ...prev,
        glasses: prev.glasses - 1,
      };
      saveTodayLog(updated, resetHour);
      return updated;
    });
  }, [resetHour]);

  const resetGlasses = useCallback(() => {
    const updated = { glasses: 0, lastDrank: null };
    saveTodayLog(updated, resetHour);
    setLog(updated);
  }, [resetHour]);

  const setGlasses = useCallback((count) => {
    setLog((prev) => {
      const updated = {
        ...prev,
        glasses: Math.max(0, count),
      };
      saveTodayLog(updated, resetHour);
      return updated;
    });
  }, [resetHour]);

  return {
    glasses: log.glasses,
    lastDrank: log.lastDrank,
    streak: streak.count,
    goalReached: log.glasses >= dailyGoal,
    progress: dailyGoal > 0 ? Math.min(1, log.glasses / dailyGoal) : 0,
    incrementGlass,
    decrementGlass,
    resetGlasses,
    setGlasses,
  };
}

