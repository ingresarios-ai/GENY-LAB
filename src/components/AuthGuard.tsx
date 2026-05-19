// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { syncFromDB } from '../lib/progressStore';

// Fire-and-forget: sync progress in background WITHOUT blocking render
function doSyncInBackground(email: string) {
  supabase
    .from('enrolled_users')
    .select('id')
    .eq('email', email)
    .single()
    .then(({ data: user }) => {
      if (!user) return;
      supabase
        .from('user_activity_log')
        .select('activity_id')
        .eq('user_id', user.id)
        .then(({ data: acts }) => {
          if (acts && acts.length > 0) {
            syncFromDB(acts.map((a: any) => a.activity_id));
          }
        });
    })
    .catch((err) => console.error('Error syncing progress from DB', err));
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(undefined); // undefined = loading
  const [ready, setReady] = useState(false);
  const synced = useRef(false);

  useEffect(() => {
    // Listen for auth state changes FIRST — this is what processes magic link tokens
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      // Kick off background sync (non-blocking)
      if (newSession?.user?.email && !synced.current) {
        synced.current = true;
        doSyncInBackground(newSession.user.email);
      }
      setSession(newSession);
      setReady(true);
    });

    // Also check existing session, but only use it if onAuthStateChange hasn't fired yet
    supabase.auth.getSession().then(({ data }) => {
      // Small delay to give onAuthStateChange priority for magic link processing
      setTimeout(() => {
        if (!ready) {
          if (data.session?.user?.email && !synced.current) {
            synced.current = true;
            doSyncInBackground(data.session.user.email);
          }
          setSession(data.session);
          setReady(true);
        }
      }, 100);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="text-brand-blue font-black text-sm uppercase tracking-widest animate-pulse">Cargando...</div>
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
