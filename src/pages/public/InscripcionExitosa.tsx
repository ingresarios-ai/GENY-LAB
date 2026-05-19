import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, CheckCircle2, AlertTriangle } from 'lucide-react';
import Confetti from '../../components/Confetti';
import confetti from 'canvas-confetti';

export default function InscripcionExitosa() {
  
  useEffect(() => {
    // Launch a massive initial burst of confetti on entry
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#00E676', '#00D1FF', '#FF6321', '#FEDD04', '#FF3EB0']
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#05080f] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Confetti effect component (runs side-sprays for 5s) */}
      <Confetti />

      {/* Background radial glows for premium vibe */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-brand-emerald/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-2xl space-y-8 relative z-10 my-8"
      >
        {/* LOGO */}
        <div className="text-center space-y-2">
          <img src="/images/78.png" alt="GENY LAB" className="w-40 md:w-52 object-contain mx-auto" />
        </div>

        {/* GLASS PANEL CONTAINER */}
        <div className="glass-panel p-8 md:p-12 space-y-8 border border-brand-emerald/30 shadow-[0_0_50px_rgba(1,228,126,0.08)] rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-brand-emerald via-[#00D1FF] to-brand-emerald"></div>

          {/* Success Header with BIG typography */}
          <div className="flex flex-col items-center text-center space-y-4">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 rounded-full bg-brand-emerald/10 border-2 border-brand-emerald flex items-center justify-center shadow-[0_0_30px_rgba(1,228,126,0.3)]"
            >
              <CheckCircle2 className="text-brand-emerald w-10 h-10" />
            </motion.div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-white leading-tight mt-2">
              ¡INCRIPCIÓN <span className="title-highlight text-brand-emerald">COMPLETADA</span>!
            </h1>
            <p className="text-white/80 text-base md:text-lg max-w-lg font-medium leading-relaxed">
              ¡Felicidades por dar el paso! Te has unido con éxito a <span className="text-[#00D1FF] font-bold">GENY LAB</span>. Tu ruta de aprendizaje para aprender a invertir desde cero está lista.
            </p>
          </div>

          <div className="h-px bg-white/10"></div>

          {/* Core Instruction Steps */}
          <div className="space-y-5">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#00D1FF] font-bold text-center sm:text-left">
              Sigue estas instrucciones para acceder:
            </h3>
            
            {/* Step 1: Mail access */}
            <div className="flex flex-col sm:flex-row gap-4 items-start bg-white/[0.03] border border-white/5 p-5 md:p-6 rounded-2xl shadow-inner">
              <div className="p-3 bg-[#00D1FF]/10 text-[#00D1FF] rounded-xl shrink-0 mx-auto sm:mx-0">
                <Mail size={24} />
              </div>
              <div className="space-y-1.5 text-center sm:text-left">
                <h4 className="text-base font-bold text-white">1. Abre tu correo electrónico</h4>
                <p className="text-sm text-white/60 leading-relaxed">
                  Te hemos enviado un correo de bienvenida automático. Haz clic en el botón <strong className="text-white bg-brand-emerald/20 px-2 py-0.5 rounded border border-brand-emerald/30">"Activar Cuenta"</strong> dentro del correo para acceder directamente al laboratorio interactivo de inversiones y establecer tu contraseña.
                </p>
              </div>
            </div>

            {/* Step 2: Spam alert */}
            <div className="flex flex-col sm:flex-row gap-4 items-start bg-amber-500/5 border border-amber-500/15 p-5 md:p-6 rounded-2xl">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl shrink-0 mx-auto sm:mx-0">
                <AlertTriangle size={24} />
              </div>
              <div className="space-y-1.5 text-center sm:text-left">
                <h4 className="text-base font-bold text-amber-400">2. ¿No lo encuentras? Revisa Spam y Promociones</h4>
                <p className="text-sm text-amber-300/80 leading-relaxed">
                  Si no recibes el correo en tu bandeja principal dentro de los próximos 3 minutos, asegúrate de revisar la carpeta de <strong>Correo no deseado, Spam</strong> o la pestaña de <strong>Promociones</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Footer */}
        <p className="text-center text-[10px] font-mono text-white/20 uppercase tracking-widest">
          INGRESARIOS · GENY LAB
        </p>
      </motion.div>
    </div>
  );
}
