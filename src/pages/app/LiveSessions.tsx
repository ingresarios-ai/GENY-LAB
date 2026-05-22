import { motion } from 'motion/react';
import { Video, Calendar, Clock, Key, ArrowRight } from 'lucide-react';

export default function LiveSessions() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-12 pb-20">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center mb-6" style={{ background: 'rgba(0, 209, 255, 0.1)', border: '1px solid rgba(0, 209, 255, 0.2)' }}>
          <Video className="w-10 h-10 text-[#00D1FF]" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">Sesiones en Vivo</h1>
        <p className="text-[#00D1FF] font-mono text-sm tracking-widest uppercase">Tu Bono de Acompañamiento</p>
      </motion.div>

      {/* Main Content Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-[2rem] p-8 md:p-12 border border-[#00D1FF]/20"
        style={{ background: 'linear-gradient(135deg, rgba(0,209,255,0.05) 0%, rgba(6,9,16,0.9) 100%)' }}
      >
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
          <Video className="w-64 h-64" />
        </div>

        <div className="relative z-10 space-y-10">
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
              Acompañamiento Estratégico Grupal
            </h2>
            <p className="text-white/70 text-lg leading-relaxed max-w-2xl">
              Tal como te lo prometimos, este es tu espacio de acceso directo para resolver dudas, revisar métricas y calibrar tu termostato financiero en equipo. No estás solo en esta ruta.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-black/40 rounded-2xl p-6 border border-white/5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6 text-[#00D1FF]" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-1">Día</p>
                <p className="text-lg font-bold text-white">Todos los Sábados</p>
              </div>
            </div>

            <div className="bg-black/40 rounded-2xl p-6 border border-white/5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-[#00D1FF]" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-1">Hora</p>
                <p className="text-lg font-bold text-white">11:00 AM <span className="text-sm font-normal text-white/60">(Hora Colombia)</span></p>
              </div>
            </div>
          </div>

          <div className="bg-[#00D1FF]/5 rounded-2xl p-8 border border-[#00D1FF]/20 text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-black/50 px-4 py-2 rounded-lg border border-white/5">
              <Key className="w-4 h-4 text-brand-green" />
              <span className="text-xs text-white/60 uppercase tracking-widest">Código de Acceso:</span>
              <span className="text-sm font-bold text-brand-green font-mono">612978</span>
            </div>

            <div>
              <a 
                href="https://us06web.zoom.us/meeting/register/FLIyJ1NiSEuu-bDPXHSzHg" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#00D1FF] hover:bg-[#00D1FF]/90 text-black px-8 py-4 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(0,209,255,0.3)] hover:shadow-[0_0_40px_rgba(0,209,255,0.5)]"
              >
                <span>Unirse a la Sesión en Zoom</span>
                <ArrowRight className="w-5 h-5" />
              </a>
              <p className="text-xs text-white/40 mt-4 max-w-md mx-auto">
                Te recomendamos conectarte 5 minutos antes para probar tu audio y video. Ten a la mano tus preguntas y avances del simulador.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
