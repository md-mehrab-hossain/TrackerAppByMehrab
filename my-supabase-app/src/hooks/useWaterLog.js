import { useState, useCallback, useEffect } from 'react';
import {
  loadTodayLog,
  saveTodayLog,
  loadStreak,
  recalculateStreak,
  markGoalReached,
} from '../utils/storage';

/**
 * Hook for tracking daily water intake.
 */
export function useWaterLog(dailyGoal) {
  const [log, setLog] = useState(() => loadTodayLog());
  const [streak, setStreak] = useState(() => loadStreak());

  // Recalculate streak on load
  useEffect(() => {
    const updated = recalculateStreak(dailyGoal);
    setStreak(updated);
  }, [dailyGoal]);

  // Check for midnight reset (every minute)
  useEffect(() => {
    const check = setInterval(() => {
      const fresh = loadTodayLog();
      setLog(fresh);
    }, 60_000);

    return () => clearInterval(check);
  }, []);

  const incrementGlass = useCallback(() => {
    setLog((prev) => {
      const updated = {
        glasses: prev.glasses + 1,
        lastDrank: new Date().toISOString(),
      };
      saveTodayLog(updated);

      // Check if goal just reached
      if (updated.glasses >= dailyGoal) {
        const newStreak = markGoalReached();
        setStreak(newStreak);
      }

      return updated;
    });
  }, [dailyGoal]);

  const decrementGlass = useCallback(() => {
    setLog((prev) => {
      if (prev.glasses <= 0) return prev;
      const updated = {
        ...prev,
        glasses: prev.glasses - 1,
      };
      saveTodayLog(updated);
      return updated;
    });
  }, []);

  const resetGlasses = useCallback(() => {
    const updated = { glasses: 0, lastDrank: null };
    saveTodayLog(updated);
    setLog(updated);
  }, []);

  const setGlasses = useCallback((count) => {
    setLog((prev) => {
      const updated = {
        ...prev,
        glasses: Math.max(0, count),
      };
      saveTodayLog(updated);
      return updated;
    });
  }, []);

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
