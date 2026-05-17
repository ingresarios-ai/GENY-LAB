// @ts-nocheck
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(undefined); // undefined = loading
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Listen for auth state changes FIRST — this is what processes magic link tokens
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setReady(true);
    });

    // Also check existing session, but only use it if onAuthStateChange hasn't fired yet
    supabase.auth.getSession().then(({ data }) => {
      // Small delay to give onAuthStateChange priority for magic link processing
      setTimeout(() => {
        setReady((prev) => {
          if (!prev) {
            setSession(data.session);
            return true;
          }
          return prev;
        });
      }, 500);
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
