import { useState, useEffect } from 'react';

/**
 * Hook that hides content on first visit and reveals it after a configurable delay.
 * Modified to show all content immediately as requested by the user.
 *
 * @param storageKey - unique key per page
 * @returns { contentRevealed, minutesLeft, secondsLeft, loading }
 */
export function useDelayedReveal(storageKey: string) {
  return {
    contentRevealed: true,
    minutesLeft: 0,
    secondsLeft: 0,
    loading: false,
  };
}
