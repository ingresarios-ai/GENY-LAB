import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Video, Calendar, Clock, Key, ArrowRight, Lock, Unlock, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function LiveSessions() {
  const [loading, setLoading] = useState(true);
  const [sessionCount, setSessionCount] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }
        
        const created = new Date(user.created_at);
        
        // Calculate first Saturday
        const dayOfWeek = created.getDay(); // 0 is Sunday, 6 is Saturday
        const firstSat = new Date(created);
        
        if (dayOfWeek === 6) {
          // If they bought on Saturday, their first session is the NEXT Saturday
          firstSat.setDate(firstSat.getDate() + 7);
        } else {
          // Next upcoming Saturday
          const daysUntilSaturday = 6 - dayOfWeek;
          firstSat.setDate(firstSat.getDate() + daysUntilSaturday);
        }
        
        // Start of day for comparison
        firstSat.setHours(0, 0, 0, 0);
        
        const session2 = new Date(firstSat);
        session2.setDate(session2.getDate() + 7);
        
        const session3 = new Date(firstSat);
        session3.setDate(session3.getDate() + 14);
        
        // End of day of session 3
        const session3End = new Date(session3);
        session3End.setHours(23, 59, 59, 999);
        
        const now = new Date();
        
        if (now > session3End) {
          setIsExpired(true);
          setSessionCount(3);
        } else if (now > session2) {
          setSessionCount(3);
        } else if (now > firstSat) {
          setSessionCount(2);
        } else {
          setSessionCount(1);
        }
      } catch (error) {
        console.error('Error fetching user for live sessions', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center p-20">
        <div className="text-[#00D1FF] font-mono text-sm tracking-widest animate-pulse">Cargando...</div>
      </div>
    );
  }

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
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                Acompañamiento Estratégico Grupal
              </h2>
              <p className="text-white/70 text-lg leading-relaxed">
                Tal como te lo prometimos, este es tu espacio de acceso directo para resolver dudas, revisar métricas y calibrar tu termostato financiero en equipo. No estás solo en esta ruta.
              </p>
            </div>
            {!isExpired && (
              <div className="shrink-0 flex flex-col gap-2">
                <div className="bg-[#00D1FF]/10 border border-[#00D1FF]/30 px-5 py-3 rounded-xl text-center shadow-[0_0_20px_rgba(0,209,255,0.1)]">
                  <p className="text-[#00D1FF] text-[10px] font-mono tracking-widest uppercase mb-1">Sesión Actual</p>
                  <p className="text-white font-black text-2xl leading-none">{sessionCount} <span className="text-white/40 text-sm font-bold">/ 3</span></p>
                </div>
                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-center">
                  <p className="text-white/50 text-[9px] font-mono uppercase tracking-widest mb-0.5">Restantes</p>
                  <p className="text-white/90 text-sm font-bold">{4 - sessionCount}</p>
                </div>
              </div>
            )}
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

          {!isExpired ? (
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
                  <Unlock className="w-5 h-5" />
                  <span>Unirse a la Sesión en Zoom</span>
                  <ArrowRight className="w-5 h-5" />
                </a>
                <p className="text-xs text-white/40 mt-4 max-w-md mx-auto">
                  Te recomendamos conectarte 5 minutos antes para probar tu audio y video. Ten a la mano tus preguntas y avances del simulador.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#fe0443]/5 rounded-2xl p-8 border border-[#fe0443]/20 text-center space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none">
                <Lock className="w-32 h-32 text-[#fe0443]" />
              </div>
              
              <div className="relative z-10 space-y-4 max-w-xl mx-auto">
                <div className="w-16 h-16 rounded-full bg-[#fe0443]/10 border border-[#fe0443]/30 mx-auto flex items-center justify-center">
                  <Lock className="w-8 h-8 text-[#fe0443]" />
                </div>
                <h3 className="text-2xl font-bold text-white">Has completado tus 3 sesiones iniciales</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Esperamos que hayas aprovechado al máximo este bono. Para mantener la calidad de nuestras mentorías y continuar revisando tus progresos en vivo todos los sábados con los mentores, necesitas una suscripción activa.
                </p>
              </div>

              <div className="relative z-10 pt-6">
                <a 
                  href="https://whop.com/checkout/plan_ZwOOrWO3QwIao" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black px-8 py-4 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)]"
                >
                  <Zap className="w-5 h-5" />
                  <span>Activar Suscripción por $9/mes</span>
                  <ArrowRight className="w-5 h-5" />
                </a>
                <p className="text-xs font-mono text-white/30 uppercase tracking-widest mt-4">
                  Desbloqueo inmediato · Cancela cuando quieras
                </p>
              </div>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
