import { useState, useCallback, useEffect } from 'react';
import { useAlarm } from './hooks/useAlarm';
import { useNotification } from './hooks/useNotification';
import { useAudio } from './hooks/useAudio';
import { useWaterLog } from './hooks/useWaterLog';
import { formatCountdown } from './utils/time';

import AlarmControl from './components/AlarmControl';
import IntervalSelector from './components/IntervalSelector';
import WaterTracker from './components/WaterTracker';
import AlertModal from './components/AlertModal';
import StatsPanel from './components/StatsPanel';
import PermissionBanner from './components/PermissionBanner';

import './App.css';

export default function App() {
  const [showAlert, setShowAlert] = useState(false);

  const { playChime } = useAudio();
  const { permission, requestPermission, sendNotification } = useNotification();

  // Alarm trigger callback
  const handleAlarmTrigger = useCallback(() => {
    setShowAlert(true);
    playChime();

    // Send browser notification
    sendNotification('💧 Time to Drink Water!', {
      body: 'Stay hydrated! Your body needs water right now.',
      requireInteraction: true, // Keep notification visible until user interacts
    });
  }, [playChime, sendNotification]);

  const alarm = useAlarm(handleAlarmTrigger);
  const waterLog = useWaterLog(alarm.dailyGoal);

  useEffect(() => {
    if (alarm.status === 'active') {
      const timeStr = formatCountdown(alarm.remainingSeconds);
      document.title = `(${timeStr}) AquaPulse`;
    } else {
      document.title = 'AquaPulse - Stay Hydrated';
    }
  }, [alarm.status, alarm.remainingSeconds]);

  // Alert modal handlers
  const handleAlertDrink = () => {
    waterLog.incrementGlass();
    setShowAlert(false);
    alarm.restartCountdown();
  };

  const handleAlertSnooze = () => {
    setShowAlert(false);
    alarm.snooze(10);
  };

  const handleAlertDismiss = () => {
    setShowAlert(false);
    alarm.restartCountdown();
  };

  // Water tracker drink
  const handleDrink = () => {
    waterLog.incrementGlass();
  };

  return (
    <div className="app" id="app">
      {/* Animated background waves */}
      <div className="app__waves">
        <div className="wave wave--1" />
        <div className="wave wave--2" />
        <div className="wave wave--3" />
      </div>

      {/* Header */}
      <header className="app__header" id="app-header">
        <div className="app__logo">
          <svg width="36" height="36" viewBox="0 0 64 64" className="app__logo-icon">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#0284C7" />
              </linearGradient>
            </defs>
            <path
              d="M32 4 C32 4 12 28 12 40 C12 51 21 58 32 58 C43 58 52 51 52 40 C52 28 32 4 32 4Z"
              fill="url(#logoGrad)"
            />
            <ellipse cx="24" cy="36" rx="4" ry="6" fill="rgba(255,255,255,0.3)" transform="rotate(-15 24 36)" />
          </svg>
          <div>
            <h1 className="app__title">AquaPulse</h1>
            <p className="app__subtitle">Stay hydrated, stay healthy</p>
          </div>
        </div>
      </header>

      {/* Notification permission banner */}
      <PermissionBanner
        permission={permission}
        onRequest={requestPermission}
      />

      {/* Main content */}
      <main className="app__main">
        <div className="app__grid">
          {/* Left column: Timer + Interval */}
          <div className="app__col app__col--primary">
            <AlarmControl
              status={alarm.status}
              remainingSeconds={alarm.remainingSeconds}
              onStart={alarm.start}
              onPause={alarm.pause}
              onReset={alarm.reset}
            />
            <IntervalSelector
              currentInterval={alarm.intervalMinutes}
              onIntervalChange={alarm.setInterval}
              disabled={alarm.status === 'active'}
            />
          </div>

          {/* Right column: Tracker + Stats */}
          <div className="app__col app__col--secondary">
            <WaterTracker
              glasses={waterLog.glasses}
              dailyGoal={alarm.dailyGoal}
              progress={waterLog.progress}
              goalReached={waterLog.goalReached}
              onDrink={handleDrink}
              onGoalChange={alarm.setDailyGoal}
            />
            <StatsPanel
              glasses={waterLog.glasses}
              dailyGoal={alarm.dailyGoal}
              streak={waterLog.streak}
              lastReminder={alarm.lastReminder}
              lastDrank={waterLog.lastDrank}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="app__footer">
        <div className="app__pwa-status">
          <p>AquaPulse v1.1 — PWA Enhanced 💧</p>
        </div>
      </footer>

      {/* Alert Modal */}
      {showAlert && (
        <AlertModal
          onDrink={handleAlertDrink}
          onSnooze={handleAlertSnooze}
          onDismiss={handleAlertDismiss}
        />
      )}
    </div>
  );
}
