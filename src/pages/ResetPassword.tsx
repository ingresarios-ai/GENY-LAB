// @ts-nocheck
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Supabase processes the recovery token from the URL hash automatically
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });

    // Also check if there's already a session (in case the event fired before mount)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSessionReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    setError('');

    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError('Error al actualizar la contraseña. Intenta de nuevo.');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    // Redirect to app after 3 seconds
    setTimeout(() => navigate('/app'), 3000);
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8"
      >
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-black uppercase tracking-tight">
            GENY <span className="title-highlight">LAB</span>
          </h1>
          <p className="text-brand-text-muted text-sm">Establece tu nueva contraseña</p>
        </div>

        {success ? (
          <div className="glass-card p-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto">
                <span className="text-2xl">✅</span>
              </div>
              <p className="text-white text-sm font-semibold">¡Contraseña actualizada!</p>
              <p className="text-white/40 text-xs">Redirigiendo a la app...</p>
              <div className="w-8 h-8 border-2 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
        ) : !sessionReady ? (
          <div className="glass-card p-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-2 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin mx-auto"></div>
              <p className="text-white/50 text-sm">Verificando enlace de recuperación...</p>
              <p className="text-white/30 text-xs">Si tardas mucho aquí, es posible que el enlace haya expirado.</p>
              <button
                onClick={() => navigate('/login')}
                className="text-xs text-brand-blue hover:text-white transition-colors"
              >
                ← Volver al login
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleReset} className="glass-card p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/50">Nueva contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-brand-blue/50 transition-all"
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/50">Confirmar contraseña</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-brand-blue/50 transition-all"
                placeholder="Repite la contraseña"
                required
              />
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs font-bold text-center">
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-lg font-mono uppercase tracking-widest text-sm bg-brand-blue/10 border border-brand-blue/40 text-brand-blue shadow-[0_0_20px_rgba(0,209,255,0.15)] hover:bg-brand-blue/20 hover:shadow-[0_0_35px_rgba(0,209,255,0.3)] transition-all disabled:opacity-50"
            >
              {loading ? 'Actualizando...' : 'Guardar nueva contraseña'}
            </button>
          </form>
        )}

        <p className="text-center text-[9px] font-mono text-white/15 uppercase tracking-widest">
          INGRESARIOS · GENY LAB
        </p>
      </motion.div>
    </div>
  );
}
