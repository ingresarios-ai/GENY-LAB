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

    // 2. Check for local storage migrations (if user has local progress not in DB)
    let migratedAny = false;
    
    // Check old geny_lab_progress
    const oldProgressRaw = localStorage.getItem('geny_lab_progress');
    if (oldProgressRaw) {
      try {
        const oldProgress = JSON.parse(oldProgressRaw);
        const lp = oldProgress.lessonProgress || {};
        
        for (const activityId of Object.keys(lp)) {
          if (lp[activityId]?.activityCompleted && !dbCompletedIds.has(activityId)) {
            // This activity is completed locally but not in DB!
            // Let's get its metadata from its individual key
            const storageKey = ACTIVITY_KEYS[activityId];
            let metadata = {};
            if (storageKey) {
              const localMetaRaw = localStorage.getItem(storageKey);
              if (localMetaRaw) {
                try {
                  const parsed = JSON.parse(localMetaRaw);
                  metadata = parsed.metadata || parsed || {};
                } catch {
                  metadata = { raw: localMetaRaw };
                }
              }
            }
            
            // Sync to DB
            await saveActivityProgressDB(activityId, metadata, true);
            dbCompletedIds.add(activityId);
            migratedAny = true;
          }
        }
      } catch (err) {
        console.error('Error parsing geny_lab_progress for migration:', err);
      }
    }
    
    // Also check individual keys directly just in case they don't have geny_lab_progress but have the key completed
    for (const [activityId, storageKey] of Object.entries(ACTIVITY_KEYS)) {
      if (!dbCompletedIds.has(activityId)) {
        const localMetaRaw = localStorage.getItem(storageKey);
        if (localMetaRaw) {
          try {
            const parsed = JSON.parse(localMetaRaw);
            const isCompleted = parsed.completed === true || !!parsed.completedAt || !!parsed.diagnosis || !!parsed.total;
            if (isCompleted) {
              const metadata = parsed.metadata || parsed || {};
              await saveActivityProgressDB(activityId, metadata, true);
              dbCompletedIds.add(activityId);
              migratedAny = true;
            }
          } catch {
            // Ignore parse errors or handle raw strings
          }
        }
      }
    }

    // 3. Final list of completed IDs
    let finalCompletedIds = Array.from(dbCompletedIds);
    
    // If we migrated anything, refetch acts from DB to be 100% sure we sync with correct DB state
    if (migratedAny) {
      const { data: freshActs } = await supabase
        .from('user_activity_log')
        .select('activity_id, completed_at, metadata')
        .eq('user_id', user.id);
      if (freshActs) {
        finalCompletedIds = freshActs
          .filter((a: any) => a.completed_at || a.metadata?.completed === true)
          .map((a: any) => a.activity_id);
      }
    }

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
