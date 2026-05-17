// @ts-nocheck
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AutoLogin() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!code) {
      setError('Código de acceso inválido');
      return;
    }

    const login = async () => {
      try {
        // Check if user already has an active session
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        if (existingSession) {
          navigate('/app', { replace: true });
          return;
        }

        // Call edge function to generate a fresh session link
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auto-login`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
          }
        );

        const data = await res.json();

        if (!res.ok || !data.action_link) {
          setError(data.error || 'Error al iniciar sesión');
          return;
        }

        // Redirect to the fresh magic link — Supabase will process it and redirect to /app
        window.location.href = data.action_link;
      } catch (err) {
        console.error('Auto-login error:', err);
        setError('Error de conexión. Inténtalo de nuevo.');
      }
    };

    login();
  }, [code, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
        <div className="glass-card p-8 max-w-sm w-full text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-white text-lg font-bold">Acceso Denegado</h2>
          <p className="text-white/50 text-sm">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 rounded-lg text-sm font-mono uppercase tracking-widest bg-brand-blue/10 border border-brand-blue/40 text-brand-blue hover:bg-brand-blue/20 transition-all"
          >
            Ir al Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="text-brand-blue font-black text-sm uppercase tracking-widest animate-pulse">
          Iniciando sesión...
        </div>
        <div className="w-8 h-8 border-2 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}
