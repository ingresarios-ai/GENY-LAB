import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { loadActivityProgressDB, saveActivityProgressDB } from '../lib/activitySync';

const ADMIN_API = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;

/**
 * Hook that hides content on first visit and reveals it after a configurable delay.
 * Settings (enabled/minutes) are fetched from site_settings via admin-api.
 * Once revealed, subsequent visits (reloads) show content immediately.
 *
 * @param storageKey - unique key per page
 * @returns { contentRevealed, minutesLeft, secondsLeft, loading }
 */
export function useDelayedReveal(storageKey: string) {
  const [contentRevealed, setContentRevealed] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let iv: any;

    async function init() {
      try {
        // 1. Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        const isAuth = !!user;

        // 2. Fetch delay settings from site config API FIRST
        //    (so admin toggle takes effect immediately for all visitors)
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
          if (!cancelled) {
            setContentRevealed(true);
            setLoading(false);
          }
          return;
        }

        // 3. Feature is enabled — check saved reveal state
        let arrivedAt = 0;
        let revealed = false;

        // Always use sessionStorage/localStorage for VSL delays (no DB sync needed to avoid polluting metrics)
        revealed = localStorage.getItem(storageKey) === 'true' || sessionStorage.getItem(storageKey) === 'true';
        arrivedAt = parseInt(localStorage.getItem(`${storageKey}_arrived`) || sessionStorage.getItem(`${storageKey}_arrived`) || '0');

        if (revealed) {
          if (!cancelled) {
            setContentRevealed(true);
            setLoading(false);
          }
          return;
        }

        const delayMs = delayMinutes * 60 * 1000;

        // First visit: record the timestamp when the user arrived
        if (!arrivedAt) {
          arrivedAt = Date.now();
          sessionStorage.setItem(`${storageKey}_arrived`, arrivedAt.toString());
          localStorage.setItem(`${storageKey}_arrived`, arrivedAt.toString());
        }

        if (cancelled) return;
        setLoading(false);

        const tick = () => {
          if (cancelled) return;
          const elapsed = Date.now() - arrivedAt;
          const left = Math.max(0, delayMs - elapsed);
          setRemaining(left);

          if (left <= 0) {
            if (!cancelled) {
              setContentRevealed(true);
            }
            clearInterval(iv);
            
            // Save completion status
            sessionStorage.setItem(storageKey, 'true');
            localStorage.setItem(storageKey, 'true');
          }
        };

        tick();
        iv = setInterval(tick, 1000);
      } catch (err) {
        console.error('Error in useDelayedReveal:', err);
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      if (iv) clearInterval(iv);
    };
  }, [storageKey]);

  const minutesLeft = Math.floor(remaining / 60000);
  const secondsLeft = Math.floor((remaining % 60000) / 1000);

  return { contentRevealed, minutesLeft, secondsLeft, loading };
}

