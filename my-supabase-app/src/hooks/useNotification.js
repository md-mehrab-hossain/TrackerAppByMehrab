import { useState, useCallback, useEffect } from 'react';

/**
 * Hook for managing browser Notification API.
 */
export function useNotification() {
  const [permission, setPermission] = useState(() => {
    if (typeof Notification === 'undefined') return 'unsupported';
    return Notification.permission; // 'default' | 'granted' | 'denied'
  });

  // Listen for permission changes
  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    setPermission(Notification.permission);
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') {
      setPermission('unsupported');
      return 'unsupported';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch {
      setPermission('denied');
      return 'denied';
    }
  }, []);

  const sendNotification = useCallback(
    (title = '💧 Time to Drink Water!', options = {}) => {
      if (permission !== 'granted') return;

      try {
        const notif = new Notification(title, {
          body: options.body || 'Stay hydrated! Your body needs water.',
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          tag: 'aquapulse-reminder',
          renotify: true,
          ...options,
        });

        // Auto-close after 10 seconds
        setTimeout(() => notif.close(), 10000);
      } catch (e) {
        console.warn('Notification failed:', e);
      }
    },
    [permission]
  );

  return {
    permission,
    requestPermission,
    sendNotification,
    isSupported: permission !== 'unsupported',
    isGranted: permission === 'granted',
    isDenied: permission === 'denied',
    needsPrompt: permission === 'default',
  };
}
