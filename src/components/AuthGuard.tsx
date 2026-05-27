// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { syncFromDB } from '../lib/progressStore';
import { saveActivityProgressDB, ACTIVITY_KEYS } from '../lib/activitySync';

// Sync progress and block render until finished
async function doSyncInBackground(email: string) {
  try {
    const { data: user } = await supabase
      .from('enrolled_users')
      .select('id')
      .eq('email', email)
      .single();
      
    if (!user) return;
    
    // 1. Fetch current activities in DB (select metadata as well!)
    const { data: acts } = await supabase
      .from('user_activity_log')
      .select('activity_id, completed_at, metadata')
      .eq('user_id', user.id);
      
    const dbCompletedIds = new Set(
      (acts || [])
        .filter((a: any) => a.completed_at || a.metadata?.completed === true)
        .map((a: any) => a.activity_id)
    );

    // 2. Final list of completed IDs
    const finalCompletedIds = (acts || [])
      .filter((a: any) => a.completed_at || a.metadata?.completed === true)
      .map((a: any) => a.activity_id);

    syncFromDB(finalCompletedIds);
  } catch (err) {
    console.error('Error syncing progress from DB', err);
  }
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(undefined); // undefined = loading
  const [ready, setReady] = useState(false);
  const synced = useRef(false);

  useEffect(() => {
    // Listen for auth state changes FIRST — this is what processes magic link tokens
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      // Sync before setting ready
      if (newSession?.user?.email && !synced.current) {
        synced.current = true;
        await Promise.race([
          doSyncInBackground(newSession.user.email),
          new Promise(r => setTimeout(r, 2500))
        ]);
      }
      setSession(newSession);
      setReady(true);
    });

    // Also check existing session, but only use it if onAuthStateChange hasn't fired yet
    supabase.auth.getSession().then(({ data }) => {
      // Small delay to give onAuthStateChange priority for magic link processing
      setTimeout(async () => {
        if (!ready) {
          if (data.session?.user?.email && !synced.current) {
            synced.current = true;
            await Promise.race([
              doSyncInBackground(data.session.user.email),
              new Promise(r => setTimeout(r, 2500))
            ]);
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
