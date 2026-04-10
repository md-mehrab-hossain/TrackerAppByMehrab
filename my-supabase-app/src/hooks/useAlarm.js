import { useState, useEffect, useRef, useCallback } from 'react';
import { loadSettings, saveSettings } from '../utils/storage';

/**
 * Core alarm/timer hook.
 * Manages countdown, pause/resume, and triggers callback on completion.
 */
export function useAlarm(onAlarmTrigger) {
  const [settings, setSettings] = useState(() => loadSettings());
  const [status, setStatus] = useState('ready'); // 'ready' | 'active' | 'paused'
  const [remainingSeconds, setRemainingSeconds] = useState(
    () => settings.intervalMinutes * 60
  );
  const [lastReminder, setLastReminder] = useState(null);

  const intervalRef = useRef(null);
  const remainingRef = useRef(remainingSeconds);

  // Keep ref in sync
  remainingRef.current = remainingSeconds;

  // Persist settings changes
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearTimer();
          setStatus('ready');
          setLastReminder(new Date().toISOString());
          if (onAlarmTrigger) onAlarmTrigger();
          return settings.intervalMinutes * 60;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer, onAlarmTrigger, settings.intervalMinutes]);

  const start = useCallback(() => {
    setStatus('active');
    startTimer();
    setSettings((s) => ({ ...s, alarmActive: true }));
  }, [startTimer]);

  const pause = useCallback(() => {
    clearTimer();
    setStatus('paused');
    setSettings((s) => ({ ...s, alarmActive: false }));
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setStatus('ready');
    setRemainingSeconds(settings.intervalMinutes * 60);
    setSettings((s) => ({ ...s, alarmActive: false }));
  }, [clearTimer, settings.intervalMinutes]);

  const setInterval_ = useCallback(
    (minutes) => {
      setSettings((s) => ({ ...s, intervalMinutes: minutes }));
      if (status === 'ready') {
        setRemainingSeconds(minutes * 60);
      }
    },
    [status]
  );

  const setDailyGoal = useCallback((goal) => {
    setSettings((s) => ({ ...s, dailyGoal: goal }));
  }, []);

  // Restart countdown after alarm dismissal
  const restartCountdown = useCallback(() => {
    setRemainingSeconds(settings.intervalMinutes * 60);
    setStatus('active');
    startTimer();
    setSettings((s) => ({ ...s, alarmActive: true }));
  }, [settings.intervalMinutes, startTimer]);

  // Snooze for N minutes
  const snooze = useCallback(
    (minutes = 10) => {
      setRemainingSeconds(minutes * 60);
      setStatus('active');
      startTimer();
      setSettings((s) => ({ ...s, alarmActive: true }));
    },
    [startTimer]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return {
    status,
    remainingSeconds,
    intervalMinutes: settings.intervalMinutes,
    dailyGoal: settings.dailyGoal,
    lastReminder,
    start,
    pause,
    reset,
    setInterval: setInterval_,
    setDailyGoal,
    restartCountdown,
    snooze,
  };
}
