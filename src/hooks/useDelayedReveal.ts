import { useState, useEffect } from 'react';

const ADMIN_API = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;

/**
 * Hook that hides content on first visit and reveals it after a configurable delay.
 * Settings (enabled/minutes) are fetched from site_settings via admin-api.
 * Once revealed, subsequent visits (reloads) show content immediately.
 *
 * @param storageKey - unique localStorage key per page
 * @returns { contentRevealed, minutesLeft, secondsLeft, loading }
 */
export function useDelayedReveal(storageKey: string) {
  const [contentRevealed, setContentRevealed] = useState(() => {
    return localStorage.getItem(storageKey) === 'true';
  });
  const [remaining, setRemaining] = useState(0);
  const [loading, setLoading] = useState(!localStorage.getItem(storageKey));

  useEffect(() => {
    // Already revealed from a previous visit
    if (contentRevealed) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function init() {
      // Fetch config from admin API
      let enabled = true;
      let delayMinutes = 10;

      try {
        const res = await fetch(`${ADMIN_API}/site-settings/content_delay`, {
          headers: { 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` }
        });
        if (res.ok) {
          const config = await res.json();
          enabled = config.enabled ?? true;
          delayMinutes = config.minutes ?? 10;
        }
      } catch {
        // Fallback to defaults if API fails
      }

      if (cancelled) return;

      // Feature disabled — show everything immediately
      if (!enabled) {
        setContentRevealed(true);
        localStorage.setItem(storageKey, 'true');
        setLoading(false);
        return;
      }

      const delayMs = delayMinutes * 60 * 1000;

      // First visit: record the timestamp when the user arrived
      const arrivedKey = `${storageKey}_arrived`;
      let arrivedAt = parseInt(localStorage.getItem(arrivedKey) || '0');
      if (!arrivedAt) {
        arrivedAt = Date.now();
        localStorage.setItem(arrivedKey, arrivedAt.toString());
      }

      setLoading(false);

      const tick = () => {
        if (cancelled) return;
        const elapsed = Date.now() - arrivedAt;
        const left = Math.max(0, delayMs - elapsed);
        setRemaining(left);

        if (left <= 0) {
          setContentRevealed(true);
          localStorage.setItem(storageKey, 'true');
          clearInterval(iv);
        }
      };

      tick();
      const iv = setInterval(tick, 1000);

      // Cleanup
      return () => { clearInterval(iv); };
    }

    const cleanup = init();
    return () => {
      cancelled = true;
      cleanup?.then(fn => fn?.());
    };
  }, [storageKey, contentRevealed]);

  const minutesLeft = Math.floor(remaining / 60000);
  const secondsLeft = Math.floor((remaining % 60000) / 1000);

  return { contentRevealed, minutesLeft, secondsLeft, loading };
}
