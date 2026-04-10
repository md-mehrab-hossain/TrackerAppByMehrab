import { useCallback } from 'react';
import { playChime, playClick } from '../utils/audio';

/**
 * Hook wrapping audio utility functions for React components.
 */
export function useAudio() {
  const chime = useCallback(() => {
    playChime();
  }, []);

  const click = useCallback(() => {
    playClick();
  }, []);

  return { playChime: chime, playClick: click };
}
