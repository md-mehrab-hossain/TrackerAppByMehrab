import { useState, useEffect } from 'react';
import { formatRelativeTime } from '../utils/time';

export default function StatsPanel({
  glasses,
  dailyGoal,
  streak,
  lastReminder,
  lastDrank,
}) {
  const [, setTick] = useState(0);

  // Update relative times every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="stats-panel" id="stats-panel">
      <h3 className="section-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.7 }}>
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
        </svg>
        Today's Stats
      </h3>

      <div className="stats-panel__grid">
        <div className="stat-card">
          <span className="stat-card__icon">🥤</span>
          <div className="stat-card__content">
            <span className="stat-card__value">
              {glasses} / {dailyGoal}
            </span>
            <span className="stat-card__label">Glasses today</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-card__icon">🔥</span>
          <div className="stat-card__content">
            <span className="stat-card__value">{streak}</span>
            <span className="stat-card__label">
              Day{streak !== 1 ? 's' : ''} streak
            </span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-card__icon">⏰</span>
          <div className="stat-card__content">
            <span className="stat-card__value stat-card__value--sm">
              {formatRelativeTime(lastReminder)}
            </span>
            <span className="stat-card__label">Last reminder</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-card__icon">💧</span>
          <div className="stat-card__content">
            <span className="stat-card__value stat-card__value--sm">
              {formatRelativeTime(lastDrank)}
            </span>
            <span className="stat-card__label">Last drank</span>
          </div>
        </div>
      </div>
    </section>
  );
}
