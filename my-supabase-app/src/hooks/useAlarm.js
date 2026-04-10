import { useState, useEffect, useRef, useCallback } from 'react';
import { loadSettings, saveSettings } from '../utils/storage';

/**
 * Core alarm/timer hook.
 * Uses target timestamps for accuracy across pauses/sleep/refreshes.
 */
export function useAlarm(onAlarmTrigger) {
  const [settings, setSettings] = useState(() => loadSettings());
  const [status, setStatus] = useState(() => settings.alarmActive ? 'active' : 'ready');
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [lastReminder, setLastReminder] = useState(null);

  const intervalRef = useRef(null);

  // Synchronize remaining seconds based on target timestamp
  const syncTimer = useCallback(() => {
    if (!settings.targetTimestamp || !settings.alarmActive) {
      setRemainingSeconds(settings.intervalMinutes * 60);
      return;
    }

    const now = Date.now();
    const diff = Math.ceil((settings.targetTimestamp - now) / 1000);

    if (diff <= 0) {
      setRemainingSeconds(0);
      setStatus('ready');
      setSettings(s => ({ ...s, alarmActive: false, targetTimestamp: null }));
      setLastReminder(new Date().toISOString());
      if (onAlarmTrigger) onAlarmTrigger();
    } else {
      setRemainingSeconds(diff);
      setStatus('active');
    }
  }, [settings.targetTimestamp, settings.alarmActive, settings.intervalMinutes, onAlarmTrigger]);

  // Initial sync and whenever settings change
  useEffect(() => {
    syncTimer();
  }, [settings.targetTimestamp, settings.alarmActive]);

  // Tick the timer
  useEffect(() => {
    if (status === 'active') {
      intervalRef.current = setInterval(() => {
        syncTimer();
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status, syncTimer]);

  // Persist settings
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Handle visibility changes to re-sync
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncTimer();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [syncTimer]);

  const start = useCallback(() => {
    const target = Date.now() + settings.intervalMinutes * 60 * 1000;
    setSettings(s => ({ ...s, alarmActive: true, targetTimestamp: target }));
    setStatus('active');
  }, [settings.intervalMinutes]);

  const pause = useCallback(() => {
    // Save remaining as target offset (simplification for this version)
    setSettings(s => ({ ...s, alarmActive: false, targetTimestamp: null }));
    setStatus('paused');
  }, []);

  const reset = useCallback(() => {
    setSettings(s => ({ ...s, alarmActive: false, targetTimestamp: null }));
    setStatus('ready');
    setRemainingSeconds(settings.intervalMinutes * 60);
  }, [settings.intervalMinutes]);

  const setInterval_ = useCallback((minutes) => {
    setSettings(s => ({ ...s, intervalMinutes: minutes }));
    if (status === 'ready') {
      setRemainingSeconds(minutes * 60);
    }
  }, [status]);

  const setDailyGoal = useCallback((goal) => {
    setSettings(s => ({ ...s, dailyGoal: goal }));
  }, []);

  const restartCountdown = useCallback(() => {
    const target = Date.now() + settings.intervalMinutes * 60 * 1000;
    setSettings(s => ({ ...s, alarmActive: true, targetTimestamp: target }));
    setStatus('active');
  }, [settings.intervalMinutes]);

  const snooze = useCallback((minutes = 10) => {
    const target = Date.now() + minutes * 60 * 1000;
    setSettings(s => ({ ...s, alarmActive: true, targetTimestamp: target }));
    setStatus('active');
  }, []);

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
