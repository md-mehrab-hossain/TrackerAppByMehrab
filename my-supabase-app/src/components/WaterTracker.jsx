import { useState, useRef, useEffect } from 'react';

function GlassIcon({ filled }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      className={`glass-icon ${filled ? 'glass-icon--filled' : ''}`}
    >
      <path
        d="M6 2l1.5 17h9L18 2H6zm3 15l-1-13h8l-1 13H9z"
        fill={filled ? 'var(--color-primary)' : 'var(--color-glass-empty)'}
        opacity={filled ? 1 : 0.35}
      />
      {filled && (
        <path
          d="M9.5 10L8.5 17h7l-1-7h-5z"
          fill="var(--color-secondary)"
          opacity="0.5"
        />
      )}
    </svg>
  );
}

export default function WaterTracker({
  glasses,
  dailyGoal,
  progress,
  goalReached,
  onDrink,
  onRemove,
  onReset,
  onGoalChange,
}) {
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(dailyGoal));
  const [rippleActive, setRippleActive] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const prevGoalReached = useRef(false);
  const rippleTimeout = useRef(null);

  const handleDrink = () => {
    onDrink();
    setRippleActive(true);
    if (rippleTimeout.current) clearTimeout(rippleTimeout.current);
    rippleTimeout.current = setTimeout(() => setRippleActive(false), 700);
  };

  const handleRemove = () => {
    if (onRemove) onRemove();
  };

  const handleReset = () => {
    if (onReset) onReset();
    setShowCelebration(false);
  };

  // Auto-show celebration when goal is reached
  useEffect(() => {
    if (goalReached && !prevGoalReached.current) {
      setShowCelebration(true);
    }
    if (!goalReached) {
      setShowCelebration(false);
    }
    prevGoalReached.current = goalReached;
  }, [goalReached]);

  const handleGoalSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(goalInput, 10);
    if (val >= 1 && val <= 30) {
      onGoalChange(val);
      setEditingGoal(false);
    }
  };

  const progressPercent = Math.round(progress * 100);

  return (
    <section className="water-tracker" id="water-tracker">
      <h3 className="section-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.7 }}>
          <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2C20 10.48 17.33 6.55 12 2zm0 18c-3.35 0-6-2.57-6-6.2 0-2.34 1.95-5.44 6-9.14 4.05 3.7 6 6.79 6 9.14 0 3.63-2.65 6.2-6 6.2z" />
        </svg>
        Water Tracker
      </h3>

      {/* Glass icons row */}
      <div className="water-tracker__glasses">
        {Array.from({ length: Math.min(dailyGoal, 16) }).map((_, i) => (
          <GlassIcon key={i} filled={i < glasses} />
        ))}
        {dailyGoal > 16 && (
          <span className="water-tracker__more">+{dailyGoal - 16}</span>
        )}
      </div>

      {/* Progress bar */}
      <div className="water-tracker__progress-wrapper">
        <div className="water-tracker__progress-bar">
          <div
            className={`water-tracker__progress-fill ${
              goalReached ? 'water-tracker__progress-fill--complete' : ''
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="water-tracker__progress-text">
          {glasses} / {dailyGoal} glasses ({progressPercent}%)
        </span>
      </div>

      {/* Goal complete celebration */}
      {showCelebration && (
        <div className="water-tracker__celebration">
          <span className="water-tracker__confetti">🎉</span>
          Daily goal reached! Great job!
          <span className="water-tracker__confetti">🎉</span>
        </div>
      )}

      {/* +/- Stepper Controls */}
      <div className="water-tracker__stepper">
        <button
          id="btn-remove-glass"
          className="btn btn--stepper btn--stepper-minus"
          onClick={handleRemove}
          disabled={glasses <= 0}
          aria-label="Remove one glass"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13H5v-2h14v2z" />
          </svg>
        </button>

        <button
          id="btn-drink"
          className={`btn btn--primary btn--lg water-tracker__drink-btn ${
            rippleActive ? 'water-tracker__drink-btn--ripple' : ''
          }`}
          onClick={handleDrink}
        >
          <span className="water-tracker__drink-icon">💧</span>
          I drank!
        </button>

        <button
          id="btn-add-glass"
          className="btn btn--stepper btn--stepper-plus"
          onClick={handleDrink}
          aria-label="Add one glass"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
        </button>
      </div>

      {/* Reset + Goal row */}
      <div className="water-tracker__bottom-row">
        <button
          id="btn-reset-tracker"
          className="btn btn--danger btn--sm"
          onClick={handleReset}
          disabled={glasses === 0}
        >
          🔄 Reset
        </button>

        {editingGoal ? (
          <form className="water-tracker__goal-edit" onSubmit={handleGoalSubmit}>
            <input
              id="goal-input"
              type="number"
              min="1"
              max="30"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              className="input input--sm"
              autoFocus
            />
            <button type="submit" className="btn btn--ghost btn--sm">
              ✓
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setEditingGoal(false)}
            >
              ✕
            </button>
          </form>
        ) : (
          <button
            id="btn-edit-goal"
            className="btn btn--ghost btn--sm"
            onClick={() => {
              setGoalInput(String(dailyGoal));
              setEditingGoal(true);
            }}
          >
            🎯 Goal: {dailyGoal} glasses
          </button>
        )}
      </div>
    </section>
  );
}
