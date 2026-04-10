import { useState } from 'react';

const PRESETS = [
  { label: '30m', value: 30 },
  { label: '1h', value: 60 },
  { label: '1.5h', value: 90 },
  { label: '2h', value: 120 },
];

export default function IntervalSelector({
  currentInterval,
  onIntervalChange,
  disabled,
}) {
  const [showCustom, setShowCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const isPreset = PRESETS.some((p) => p.value === currentInterval);

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(customValue, 10);
    if (val >= 1 && val <= 480) {
      onIntervalChange(val);
      setShowCustom(false);
    }
  };

  return (
    <section className="interval-selector" id="interval-selector">
      <h3 className="section-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.7 }}>
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
        </svg>
        Reminder Interval
      </h3>

      <div className="interval-selector__pills">
        {PRESETS.map(({ label, value }) => (
          <button
            key={value}
            id={`interval-${value}`}
            className={`pill ${currentInterval === value ? 'pill--active' : ''}`}
            onClick={() => {
              onIntervalChange(value);
              setShowCustom(false);
            }}
            disabled={disabled}
          >
            {label}
          </button>
        ))}
        <button
          id="interval-custom-toggle"
          className={`pill ${!isPreset || showCustom ? 'pill--active' : ''}`}
          onClick={() => setShowCustom(!showCustom)}
          disabled={disabled}
        >
          Custom
        </button>
      </div>

      {showCustom && (
        <form className="interval-selector__custom" onSubmit={handleCustomSubmit}>
          <input
            id="custom-interval-input"
            type="number"
            min="1"
            max="480"
            placeholder="Minutes"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            disabled={disabled}
            autoFocus
            className="input"
          />
          <button
            type="submit"
            className="btn btn--primary btn--sm"
            disabled={disabled || !customValue}
          >
            Set
          </button>
        </form>
      )}

      <p className="interval-selector__current">
        Current: <strong>{currentInterval} min</strong>
      </p>
    </section>
  );
}
