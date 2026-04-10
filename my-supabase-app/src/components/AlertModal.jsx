import { useEffect } from 'react';

export default function AlertModal({ onDrink, onSnooze, onDismiss }) {
  // Trap focus in modal and handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onDismiss();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onDismiss]);

  return (
    <div className="alert-modal" id="alert-modal" role="dialog" aria-modal="true">
      <div className="alert-modal__backdrop" onClick={onDismiss} />
      <div className="alert-modal__content">
        <div className="alert-modal__wave" />

        <div className="alert-modal__icon">
          <span className="alert-modal__emoji">💧</span>
        </div>

        <h2 className="alert-modal__title">Time to Drink Water!</h2>
        <p className="alert-modal__message">
          Your body needs hydration. Take a moment to drink a glass of water.
        </p>

        <div className="alert-modal__actions">
          <button
            id="alert-btn-drink"
            className="btn btn--primary btn--lg"
            onClick={onDrink}
            autoFocus
          >
            💧 I drank!
          </button>
          <button
            id="alert-btn-snooze"
            className="btn btn--warning btn--md"
            onClick={onSnooze}
          >
            ⏰ Snooze 10 min
          </button>
          <button
            id="alert-btn-dismiss"
            className="btn btn--ghost btn--sm"
            onClick={onDismiss}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
