import { useState, useEffect } from 'react';
import { getNextResetTimestamp } from '../utils/storage';

/**
 * Formats hour (0-23) into a readable 12-hour string.
 */
function formatHour(hour) {
  const h = hour % 12 || 12;
  const ampm = hour < 12 ? 'AM' : 'PM';
  return `${h}:00 ${ampm}`;
}

/**
 * Formats seconds into HH:MM:SS countdown string.
 */
function formatResetCountdown(totalSec) {
  if (totalSec <= 0) return '00:00:00';
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function ResetTimeSetting({ resetHour, onResetHourChange }) {
  const [editing, setEditing] = useState(false);
  const [inputHour, setInputHour] = useState(resetHour);
  const [countdown, setCountdown] = useState('');

  // Live countdown to next reset
  useEffect(() => {
    const update = () => {
      const nextReset = getNextResetTimestamp(resetHour);
      const remaining = Math.max(0, Math.ceil((nextReset - Date.now()) / 1000));
      setCountdown(formatResetCountdown(remaining));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [resetHour]);

  const handleSave = () => {
    const val = parseInt(inputHour, 10);
    if (val >= 0 && val <= 23) {
      onResetHourChange(val);
      setEditing(false);
    }
  };

  const handleCancel = () => {
    setInputHour(resetHour);
    setEditing(false);
  };

  // Hour options for select dropdown
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <section className="reset-setting" id="reset-setting">
      <h3 className="section-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.7 }}>
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
        </svg>
        Reset Schedule
      </h3>

      <div className="reset-setting__info">
        <div className="reset-setting__current">
          <div className="reset-setting__label">Daily reset at</div>
          <div className="reset-setting__value">{formatHour(resetHour)}</div>
        </div>

        <div className="reset-setting__countdown-box">
          <div className="reset-setting__label">Next reset in</div>
          <div className="reset-setting__countdown">{countdown}</div>
        </div>
      </div>

      <p className="reset-setting__desc">
        Tracks from <strong>{formatHour(resetHour)}</strong> today to{' '}
        <strong>{formatHour(resetHour === 0 ? 23 : resetHour - 1).replace(':00', ':59')}</strong> tomorrow.
        Water logged before reset time counts for the previous day.
      </p>

      {editing ? (
        <div className="reset-setting__edit">
          <label htmlFor="reset-hour-select" className="reset-setting__edit-label">
            Set reset time:
          </label>
          <select
            id="reset-hour-select"
            className="input input--sm reset-setting__select"
            value={inputHour}
            onChange={(e) => setInputHour(Number(e.target.value))}
          >
            {hours.map((h) => (
              <option key={h} value={h}>
                {formatHour(h)}
              </option>
            ))}
          </select>
          <button className="btn btn--primary btn--sm" onClick={handleSave}>
            Save
          </button>
          <button className="btn btn--ghost btn--sm" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      ) : (
        <button
          id="btn-edit-reset-time"
          className="btn btn--ghost btn--sm reset-setting__edit-btn"
          onClick={() => {
            setInputHour(resetHour);
            setEditing(true);
          }}
        >
          ⏰ Change Reset Time
        </button>
      )}
    </section>
  );
}
