import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Lock, ShieldCheck, AlertCircle, CheckCircle2, User, Mail, Loader2 } from 'lucide-react';
import { Footer } from '../../components/Footer';
import { Logo } from '../../components/Logo';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface InvitationData {
  id: string;
  name: string;
  email: string;
  status: string;
  expires_at: string;
}

export default function RegistroConToken() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Fetch invitation data on mount
  useEffect(() => {
    if (!token) {
      setError('No se encontró un token de invitación en la URL.');
      setLoading(false);
      return;
    }

    const fetchInvitation = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('invitations')
          .select('id, name, email, status, expires_at')
          .eq('token', token)
          .single();

        if (fetchError || !data) {
          setError('Token de invitación inválido o no encontrado.');
          setLoading(false);
          return;
        }

        if (data.status === 'used') {
          setError('Esta invitación ya fue utilizada. Si ya tienes cuenta, intenta iniciar sesión.');
          setLoading(false);
          return;
        }

        if (data.status === 'expired' || (data.expires_at && new Date(data.expires_at) < new Date())) {
          setError('Esta invitación ha expirado. Contacta al soporte para obtener una nueva.');
          setLoading(false);
          return;
        }

        setInvitation(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching invitation:', err);
        setError('Error al verificar la invitación. Inténtalo de nuevo.');
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setSubmitting(true);

    try {
      // Call the Edge Function
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/register-with-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ token, password }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Error al crear la cuenta. Inténtalo de nuevo.');
        setSubmitting(false);
        return;
      }

      // If we got a session back, set it in Supabase client
      if (result.session?.access_token && result.session?.refresh_token) {
        await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        });
      } else {
        // Fallback: sign in with email+password
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: invitation!.email,
          password: password,
        });

        if (signInError) {
          console.error('Auto-login failed:', signInError);
          // Don't block — account is created, redirect to login
        }
      }

      setSuccess(true);
      setSubmitting(false);

      // Redirect to /app after showing success
      setTimeout(() => {
        navigate('/app', { replace: true });
      }, 2500);
    } catch (err) {
      console.error('Registration error:', err);
      setError('Ocurrió un error inesperado. Inténtalo de nuevo.');
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#05080f] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-[#00D1FF] font-mono text-xs uppercase tracking-widest animate-pulse">
            Verificando invitación...
          </div>
          <div className="w-8 h-8 border-2 border-brand-blue/30 border-t-[#00D1FF] rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Error state (no valid invitation)
  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-[#05080f] flex flex-col relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>

        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md space-y-8 relative z-10"
          >
            <div className="text-center space-y-3">
              <Logo imgClassName="w-36 md:w-44 object-contain" />
            </div>

            <div className="glass-panel p-8 space-y-6 border border-red-500/15 shadow-[0_0_30px_rgba(239,68,68,0.03)]">
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
                  <AlertCircle className="text-red-400 w-7 h-7" />
                </div>
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Invitación No Válida</h2>
                <p className="text-white/50 text-xs leading-relaxed">
                  {error}
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 rounded-lg font-mono uppercase tracking-widest text-xs bg-brand-blue/10 border border-brand-blue/35 text-[#00D1FF] hover:bg-brand-blue/20 transition-all cursor-pointer"
                >
                  Ir al Login
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05080f] flex flex-col relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>

      {/* Centered content area */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8 relative z-10"
        >
          <div className="text-center space-y-3">
            <Logo imgClassName="w-36 md:w-44 object-contain" />
          </div>

          <div className="glass-panel p-8 space-y-6 border border-brand-blue/15 shadow-[0_0_30px_rgba(0,209,255,0.03)]">
            {success ? (
              /* Success State */
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-brand-emerald/10 border border-brand-emerald/30 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(1,228,126,0.1)]">
                  <CheckCircle2 className="text-brand-emerald w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">¡Cuenta Creada!</h2>
                <p className="text-white/60 text-xs max-w-xs mx-auto leading-relaxed">
                  Tu contraseña ha sido guardada con éxito. Iniciando sesión en GENY LAB...
                </p>
                <div className="w-6 h-6 border-2 border-brand-blue/30 border-t-[#00D1FF] rounded-full animate-spin mx-auto mt-2"></div>
              </div>
            ) : (
              /* Registration Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-brand-blue/10 border border-brand-blue/35 flex items-center justify-center mx-auto">
                    <Lock className="text-[#00D1FF] w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-white uppercase tracking-wider">Crea tu Cuenta</h2>
                  <p className="text-white/40 text-xs">
                    Define la contraseña que usarás para ingresar a GENY LAB.
                  </p>
                </div>

                <div className="h-px bg-white/5 my-2"></div>

                {/* Name (Prefilled, disabled) */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40 flex items-center gap-1.5">
                    <User size={10} />
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={invitation?.name || ''}
                    disabled
                    className="w-full bg-white/[0.02] border border-white/5 rounded-lg px-4 py-3 text-white/40 text-sm outline-none cursor-not-allowed"
                  />
                </div>

                {/* Email (Prefilled, disabled) */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40 flex items-center gap-1.5">
                    <Mail size={10} />
                    Email
                  </label>
                  <input
                    type="email"
                    value={invitation?.email || ''}
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
                    autoFocus
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
                  disabled={submitting}
                  className="w-full py-4 rounded-xl flex items-center justify-center gap-2 font-mono uppercase tracking-widest text-xs bg-brand-emerald/10 border border-brand-emerald/40 text-brand-emerald hover:bg-brand-emerald/20 hover:shadow-[0_0_20px_rgba(1,228,126,0.15)] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      Crear Cuenta y Entrar
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Login link */}
          {!success && (
            <div className="text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-[10px] font-mono text-white/25 hover:text-white/50 transition-colors uppercase tracking-widest cursor-pointer"
              >
                ¿Ya tienes cuenta? Inicia sesión
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Shared Global Footer */}
      <Footer />
    </div>
  );
}
