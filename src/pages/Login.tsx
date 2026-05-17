// @ts-nocheck
import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError('Credenciales incorrectas');
      setLoading(false);
      return;
    }
    navigate('/app');
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Ingresa tu email'); return; }
    setLoading(true);
    setError('');
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (resetError) {
      setError('Error al enviar el correo. Intenta de nuevo.');
      setLoading(false);
      return;
    }
    setForgotSent(true);
    setLoading(false);
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
          <p className="text-brand-text-muted text-sm">{forgotMode ? 'Recupera tu contraseña' : 'Ingresa para continuar'}</p>
        </div>

        {forgotMode ? (
          <div className="glass-card p-8 space-y-6">
            {forgotSent ? (
              <div className="text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto">
                  <span className="text-2xl">✉️</span>
                </div>
                <p className="text-white text-sm">Te enviamos un correo a <strong className="text-brand-blue">{email}</strong> con un enlace para restablecer tu contraseña.</p>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-left">
                  <p className="text-amber-400 text-xs font-semibold mb-1">📌 Importante:</p>
                  <p className="text-amber-300/70 text-xs leading-relaxed">Si no lo encuentras en tu bandeja de entrada, revisa las carpetas de <strong>Spam</strong>, <strong>Correo no deseado</strong> o <strong>Promociones</strong>.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/50">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-brand-blue/50 transition-all"
                    placeholder="tu@email.com"
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
                  {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </button>
              </form>
            )}
            <button
              onClick={() => { setForgotMode(false); setForgotSent(false); setError(''); }}
              className="w-full text-center text-xs text-white/40 hover:text-brand-blue transition-colors"
            >
              ← Volver al inicio de sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="glass-card p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/50">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-brand-blue/50 transition-all"
                placeholder="tu@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/50">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-brand-blue/50 transition-all"
                placeholder="••••••••"
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
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
            <button
              type="button"
              onClick={() => { setForgotMode(true); setError(''); }}
              className="w-full text-center text-xs text-white/30 hover:text-brand-blue transition-colors"
            >
              ¿Olvidaste tu contraseña?
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
