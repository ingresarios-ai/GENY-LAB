// @ts-nocheck
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, ShieldCheck, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [checked, setChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleUserSession = (user: any) => {
    if (checked) return;
    setChecked(true);
    setEmail(user.email || '');
    setChecking(false);
  };

  useEffect(() => {
    let mounted = true;

    // 1. Check current session immediately (if client already parsed/stored it)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        handleUserSession(session.user);
      }
    });

    // 2. Listen for auth changes (captures the async exchange of code/tokens)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (session?.user) {
        handleUserSession(session.user);
      }
    });

    // 3. Fallback: If no session is detected after 4 seconds, show recovery link expired error
    const timer = setTimeout(() => {
      if (mounted && !checked) {
        setError('No se detectó una sesión activa o el enlace de recuperación ha expirado. Por favor, solicita un nuevo enlace desde la página de inicio de sesión.');
        setChecking(false);
      }
    }, 4000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [checked]);

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

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message || 'Error al actualizar la contraseña. Intenta de nuevo.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
      // Redirect to app dashboard after 2.5 seconds
      setTimeout(() => navigate('/app', { replace: true }), 2500);
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Ocurrió un error inesperado. Inténtalo de nuevo.');
      setLoading(false);
    }
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
                <CheckCircle2 className="text-brand-emerald w-7 h-7" />
              </div>
              <p className="text-white text-sm font-semibold">¡Contraseña actualizada!</p>
              <p className="text-white/40 text-xs">Redirigiendo a la app...</p>
              <div className="w-8 h-8 border-2 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
        ) : checking ? (
          <div className="glass-card p-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-2 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin mx-auto"></div>
              <p className="text-white/50 text-sm">Verificando enlace de recuperación...</p>
              <p className="text-white/30 text-xs font-mono">Por favor, espera un momento.</p>
            </div>
          </div>
        ) : error && !email ? (
          <div className="glass-card p-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
                <AlertCircle className="text-red-400 w-7 h-7" />
              </div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">Enlace Inválido</h2>
              <p className="text-white/50 text-xs leading-relaxed">{error}</p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 rounded-lg font-mono uppercase tracking-widest text-xs bg-brand-blue/10 border border-brand-blue/35 text-brand-blue hover:bg-brand-blue/20 transition-all cursor-pointer"
              >
                Volver al Login
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleReset} className="glass-card p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-brand-blue/10 border border-brand-blue/35 flex items-center justify-center mx-auto">
                <Lock className="text-[#00D1FF] w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">Restablecer</h2>
              <p className="text-white/40 text-xs">
                Ingresa tu nueva contraseña para ingresar de forma segura.
              </p>
            </div>

            <div className="h-px bg-white/5 my-2"></div>

            {/* Email (Prefilled, disabled) */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40">Email de Usuario</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-white/[0.02] border border-white/5 rounded-lg px-4 py-3 text-white/40 text-sm outline-none cursor-not-allowed"
              />
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/50">Nueva contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-4 pr-10 py-3 text-white text-sm outline-none focus:border-brand-blue/50 transition-all"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/50">Confirmar contraseña</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-4 pr-10 py-3 text-white text-sm outline-none focus:border-brand-blue/50 transition-all"
                  placeholder="Repite la contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex gap-2 items-center justify-center text-red-400 text-xs font-bold bg-red-500/5 border border-red-500/10 py-2.5 px-3 rounded-lg">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl flex items-center justify-center gap-2 font-mono uppercase tracking-widest text-xs bg-brand-emerald/10 border border-brand-emerald/40 text-brand-emerald hover:bg-brand-emerald/20 hover:shadow-[0_0_20px_rgba(1,228,126,0.15)] transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-brand-emerald/30 border-t-brand-emerald rounded-full animate-spin"></div>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  Guardar nueva contraseña
                </>
              )}
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
