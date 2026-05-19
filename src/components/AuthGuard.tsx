// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { syncFromDB } from '../lib/progressStore';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(undefined); // undefined = loading
  const [ready, setReady] = useState(false);
  const synced = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      // 1. Get current session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      // 2. If logged in and not synced, sync from DB
      if (currentSession?.user?.email && !synced.current) {
        synced.current = true;
        try {
          const { data: user } = await supabase.from('enrolled_users').select('id').eq('email', currentSession.user.email).single();
          if (user) {
            const { data: acts } = await supabase.from('user_activity_log').select('activity_id').eq('user_id', user.id);
            if (acts && acts.length > 0) {
              const ids = acts.map((a: any) => a.activity_id);
              syncFromDB(ids);
            }
          }
        } catch (err) {
          console.error("Error syncing progress from DB", err);
        }
      }

      if (isMounted) {
        setSession(currentSession);
        setReady(true);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (newSession?.user?.email && !synced.current) {
        synced.current = true;
        try {
          const { data: user } = await supabase.from('enrolled_users').select('id').eq('email', newSession.user.email).single();
          if (user) {
            const { data: acts } = await supabase.from('user_activity_log').select('activity_id').eq('user_id', user.id);
            if (acts && acts.length > 0) {
              const ids = acts.map((a: any) => a.activity_id);
              syncFromDB(ids);
            }
          }
        } catch (err) {
          console.error("Error syncing progress from DB", err);
        }
      }
      if (isMounted) {
        setSession(newSession);
        setReady(true);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
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
