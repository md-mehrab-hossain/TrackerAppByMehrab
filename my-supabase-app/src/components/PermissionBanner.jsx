export default function PermissionBanner({ permission, onRequest }) {
  if (permission === 'granted' || permission === 'unsupported') return null;

  return (
    <div className="permission-banner" id="permission-banner">
      <div className="permission-banner__content">
        {permission === 'denied' ? (
          <>
            <span className="permission-banner__icon">🔔</span>
            <p className="permission-banner__text">
              Notifications are blocked. Please enable them in your browser
              settings to receive water reminders when this tab is in the
              background.
            </p>
          </>
        ) : (
          <>
            <span className="permission-banner__icon">🔔</span>
            <p className="permission-banner__text">
              Enable notifications to get water reminders even when this tab is
              in the background.
            </p>
            <button
              id="btn-enable-notifications"
              className="btn btn--primary btn--sm"
              onClick={onRequest}
            >
              Enable Notifications
            </button>
          </>
        )}
      </div>
    </div>
  );
}
