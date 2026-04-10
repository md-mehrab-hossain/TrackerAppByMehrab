import { formatCountdown } from '../utils/time';

export default function AlarmControl({
  status,
  remainingSeconds,
  onStart,
  onPause,
  onReset,
}) {
  const statusLabels = {
    ready: 'Ready',
    active: 'Active',
    paused: 'Paused',
  };

  const statusColors = {
    ready: 'var(--color-primary)',
    active: 'var(--color-success)',
    paused: 'var(--color-warning)',
  };

  return (
    <section className="alarm-control" id="alarm-control">
      <div className="alarm-control__timer-ring">
        <div
          className={`alarm-control__timer-inner ${
            status === 'active' ? 'alarm-control__timer-inner--active' : ''
          }`}
        >
          <span className="alarm-control__countdown">
            {formatCountdown(remainingSeconds)}
          </span>
          <span
            className="alarm-control__status-badge"
            style={{ color: statusColors[status] }}
          >
            <span
              className={`alarm-control__status-dot ${
                status === 'active' ? 'alarm-control__status-dot--pulse' : ''
              }`}
              style={{ backgroundColor: statusColors[status] }}
            />
            {statusLabels[status]}
          </span>
        </div>
      </div>

      <div className="alarm-control__buttons">
        {status === 'ready' && (
          <button
            id="btn-start"
            className="btn btn--success btn--lg"
            onClick={onStart}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            Start
          </button>
        )}
        {status === 'active' && (
          <button
            id="btn-pause"
            className="btn btn--warning btn--lg"
            onClick={onPause}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
            Pause
          </button>
        )}
        {status === 'paused' && (
          <button
            id="btn-resume"
            className="btn btn--success btn--lg"
            onClick={onStart}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            Resume
          </button>
        )}
        <button
          id="btn-reset"
          className="btn btn--ghost"
          onClick={onReset}
          disabled={status === 'ready'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
          </svg>
          Reset
        </button>
      </div>
    </section>
  );
}
