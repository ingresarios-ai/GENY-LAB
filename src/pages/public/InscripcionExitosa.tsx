import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Mail, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function InscripcionExitosa() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#05080f] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-brand-emerald/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg space-y-8 relative z-10"
      >
        <div className="text-center space-y-3">
          <img src="/images/78.png" alt="GENY LAB" className="w-36 md:w-44 object-contain mx-auto" />
        </div>

        <div className="glass-panel p-8 md:p-10 space-y-6 border border-brand-emerald/20 shadow-[0_0_30px_rgba(1,228,126,0.05)]">
          
          {/* Success Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-brand-emerald/10 border border-brand-emerald/30 flex items-center justify-center shadow-[0_0_20px_rgba(1,228,126,0.15)]">
              <CheckCircle2 className="text-brand-emerald w-8 h-8" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-white">
              ¡Inscripción <span className="title-highlight">Exitosa</span>!
            </h1>
            <p className="text-white/60 text-sm max-w-sm">
              Tu pago ha sido procesado correctamente y tu acceso al laboratorio interactivo de inversiones está listo.
            </p>
          </div>

          <div className="h-px bg-white/5"></div>

          {/* Action steps */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#00D1FF] font-semibold">
              ¿Qué sigue ahora?
            </h3>
            
            <div className="flex gap-4 items-start bg-white/[0.02] border border-white/5 p-4 rounded-xl">
              <div className="p-2 bg-[#00D1FF]/10 text-[#00D1FF] rounded-lg shrink-0">
                <Mail size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Activa tu cuenta desde tu correo</h4>
                <p className="text-xs text-white/50 leading-relaxed">
                  Te hemos enviado un correo de bienvenida. Haz clic en el botón <strong className="text-white">"Activar Cuenta"</strong> dentro del correo para iniciar sesión automáticamente y definir tu contraseña.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg shrink-0">
                <AlertTriangle size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-amber-400">Revisa tu carpeta de Spam o Promociones</h4>
                <p className="text-xs text-amber-300/70 leading-relaxed">
                  Si no ves nuestro correo en tu bandeja de entrada principal dentro de los próximos 3 minutos, asegúrate de revisar la carpeta de <strong>Correo no deseado, Spam</strong> o <strong>Promociones</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Footer action */}
          <div className="pt-2">
            <button
              onClick={() => navigate('/login')}
              className="w-full py-4 rounded-xl flex items-center justify-center gap-2 font-mono uppercase tracking-widest text-xs bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
            >
              Ir al Login principal <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <p className="text-center text-[9px] font-mono text-white/15 uppercase tracking-widest">
          INGRESARIOS · GENY LAB
        </p>
      </motion.div>
    </div>
  );
}
