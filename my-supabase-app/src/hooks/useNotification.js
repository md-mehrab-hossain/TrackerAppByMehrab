import { useState, useCallback, useEffect } from 'react';

/**
 * Hook for managing browser Notification API.
 * Uses Service Worker for better background reliability when available.
 */
export function useNotification() {
  const [permission, setPermission] = useState(() => {
    if (typeof Notification === 'undefined') return 'unsupported';
    return Notification.permission;
  });

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
    async (title = '💧 Time to Drink Water!', options = {}) => {
      if (permission !== 'granted') return;

      const notificationOptions = {
        body: options.body || 'Stay hydrated! Your body needs water.',
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: 'aquapulse-reminder',
        renotify: true,
        vibrate: [200, 100, 200],
        silent: false,
        ...options,
      };

      try {
        // Try Service Worker first for better background reliability
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          if (registration) {
            await registration.showNotification(title, notificationOptions);
            return;
          }
        }
        
        // Fallback to standard Notification
        new Notification(title, notificationOptions);
      } catch (e) {
        console.warn('Notification failed, trying fallback:', e);
        try {
          new Notification(title, notificationOptions);
        } catch (err) {
          console.error('All notification methods failed:', err);
        }
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
