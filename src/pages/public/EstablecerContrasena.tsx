import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Lock, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function EstablecerContrasena() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [checked, setChecked] = useState(false);

  const handleUserSession = (user: any) => {
    if (checked) return;
    setChecked(true);
    
    // Check if password is already set in metadata
    if (user.user_metadata?.password_set === true) {
      // User already set password, send them to the app
      navigate('/app', { replace: true });
      return;
    }

    setEmail(user.email || '');
    setChecking(false);
  };

  useEffect(() => {
    let mounted = true;
    
    // 1. Check current session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        handleUserSession(session.user);
      }
    });

    // 2. Listen for auth changes (for async parsing of hash tokens)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        handleUserSession(session.user);
      }
    });

    // 3. Fallback: If no session is found after 4 seconds, show error
    const timer = setTimeout(() => {
      if (mounted && !checked) {
        setError('No se detectó una sesión activa. Por favor, accede usando el enlace enviado a tu correo o inicia sesión.');
        setChecking(false);
      }
    }, 4000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [checked, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
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
      // Update both the password and the metadata flag in Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
        data: { password_set: true }
      });

      if (updateError) {
        setError(updateError.message || 'Error al guardar la contraseña');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
      
      // Redirect to /app after 2.5 seconds
      setTimeout(() => {
        navigate('/app', { replace: true });
      }, 2500);
    } catch (err) {
      console.error('Error establishing password:', err);
      setError('Ocurrió un error inesperado. Inténtalo de nuevo.');
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#05080f] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-[#00D1FF] font-mono text-xs uppercase tracking-widest animate-pulse">
            Verificando enlace de activación...
          </div>
          <div className="w-8 h-8 border-2 border-brand-blue/30 border-t-[#00D1FF] rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05080f] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 relative z-10"
      >
        <div className="text-center space-y-3">
          <img src="/images/78.png" alt="GENY LAB" className="w-36 md:w-44 object-contain mx-auto" />
        </div>

        <div className="glass-panel p-8 space-y-6 border border-brand-blue/15 shadow-[0_0_30px_rgba(0,209,255,0.03)]">
          {success ? (
            /* Success State */
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-brand-emerald/10 border border-brand-emerald/30 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(1,228,126,0.1)]">
                <CheckCircle2 className="text-brand-emerald w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">¡Cuenta Activada!</h2>
              <p className="text-white/60 text-xs max-w-xs mx-auto leading-relaxed">
                Tu contraseña ha sido guardada con éxito. Iniciando sesión en GENY LAB...
              </p>
              <div className="w-6 h-6 border-2 border-brand-blue/30 border-t-[#00D1FF] rounded-full animate-spin mx-auto mt-2"></div>
            </div>
          ) : error && !email ? (
            /* Error State (No Session) */
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
                <AlertCircle className="text-red-400 w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">Enlace Inválido</h2>
              <p className="text-white/50 text-xs leading-relaxed">
                {error}
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 rounded-lg font-mono uppercase tracking-widest text-xs bg-brand-blue/10 border border-brand-blue/35 text-[#00D1FF] hover:bg-brand-blue/20 transition-all cursor-pointer"
              >
                Volver al Login
              </button>
            </div>
          ) : (
            /* Password Creation Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-brand-blue/10 border border-brand-blue/35 flex items-center justify-center mx-auto">
                  <Lock className="text-[#00D1FF] w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Activa tu Cuenta</h2>
                <p className="text-white/40 text-xs">
                  Define la contraseña que usarás para ingresar a GENY LAB.
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

              {/* Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/45">Nueva Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-brand-blue/50 transition-all"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/45">Confirmar Contraseña</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-brand-blue/50 transition-all"
                  placeholder="Repite tu contraseña"
                  required
                />
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
                    Activar Cuenta y Entrar
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-[9px] font-mono text-white/15 uppercase tracking-widest">
          INGRESARIOS · GENY LAB
        </p>
      </motion.div>
    </div>
  );
}
