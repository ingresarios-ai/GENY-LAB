// @ts-nocheck
// GENY LAB — Diagnóstico Privado de Consistencia (Booking Page)
// Unlocked after completing all 7 labs — the ultimate reward

import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Shield, Brain, Target, Sparkles, CheckCircle2 } from 'lucide-react';
import { isAllCompleted } from '../../lib/progressStore';
import { Logo } from '../../components/Logo';
import { Footer } from '../../components/Footer';

export default function DiagnosticoBooking() {
  const navigate = useNavigate();
  const iframeContainerRef = useRef<HTMLDivElement>(null);

  // Guard: only accessible if all lessons are completed
  useEffect(() => {
    if (!isAllCompleted()) {
      navigate('/app', { replace: true });
    }
  }, [navigate]);

  // Dynamically load the booking widget script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://link.msgsndr.com/js/form_embed.js';
    script.type = 'text/javascript';
    script.async = true;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const milestones = [
    { icon: '🧬', label: 'ADN Financiero diagnosticado' },
    { icon: '🌡️', label: 'Termostato calibrado' },
    { icon: '🐜', label: 'Fugas financieras identificadas' },
    { icon: '🧠', label: 'Trampas mentales desactivadas' },
    { icon: '📋', label: 'PEDEM estructurado' },
    { icon: '🎭', label: 'Saboteador Interior domado' },
    { icon: '⚡', label: 'Estado de Flow activado' },
  ];

  return (
    <div className="min-h-screen bg-[#05080f] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#F2C500]/[0.03] rounded-full blur-[200px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#8b5cf6]/[0.02] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-[#00D1FF]/[0.02] rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <div className="border-b border-white/5 bg-[#05080f]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/app')}
            className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-sm font-mono"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Volver al Mapa</span>
          </button>
          <Logo imgClassName="h-6 md:h-8 w-auto object-contain" />
          <div className="flex items-center gap-2 text-[#F2C500] font-mono text-[10px] uppercase tracking-widest">
            <Trophy size={14} />
            <span className="hidden sm:inline">RECOMPENSA DESBLOQUEADA</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="pt-12 pb-8 md:pt-20 md:pb-12 relative z-10">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-[#F2C500]/10 border-2 border-[#F2C500]/40 flex items-center justify-center mx-auto mb-8 shadow-[0_0_60px_rgba(242,197,0,0.15)]"
          >
            <span className="text-5xl md:text-6xl">🏆</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-[#F2C500] text-xs md:text-sm font-mono uppercase tracking-[0.3em] mb-4 font-black">
              Felicidades · Sistema Completado al 100%
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight text-white mb-6">
              Lo lograste.<br />
              <span className="bg-gradient-to-r from-[#F2C500] via-[#FFD700] to-[#f59e0b] bg-clip-text text-transparent">
                Ahora el sistema trabaja para ti.
              </span>
            </h1>
            <p className="text-white/70 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              Completaste los 7 laboratorios. Diagnosticaste tu ADN financiero, desactivaste tus trampas mentales, domaste a tu saboteador interior y activaste tu estado de Flow. <strong className="text-white">Eso te pone en el top 5% de los traders que realmente hacen el trabajo.</strong>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Milestones Strip */}
      <section className="py-6 md:py-8 relative z-10">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3 md:gap-4"
          >
            {milestones.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.07 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00E676]/5 border border-[#00E676]/15 text-sm"
              >
                <span className="text-lg">{m.icon}</span>
                <span className="text-white/70 font-medium text-xs md:text-sm">{m.label}</span>
                <CheckCircle2 size={14} className="text-[#00E676]" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="py-10 md:py-16 relative z-10">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-3xl border border-[#F2C500]/20 bg-[#080d16]/80 backdrop-blur-xl overflow-hidden shadow-[0_0_80px_rgba(242,197,0,0.05)]"
          >
            {/* Top accent bar */}
            <div className="h-[3px] bg-gradient-to-r from-[#F2C500] via-[#FFD700] to-[#f59e0b]" />

            <div className="p-6 md:p-10 lg:p-12">
              {/* Section Header */}
              <div className="text-center mb-8 md:mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[#8b5cf6] text-xs font-mono uppercase tracking-widest mb-6">
                  <Sparkles size={14} />
                  BONO EXCLUSIVO DESBLOQUEADO
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-4">
                  Tu Diagnóstico Privado de{' '}
                  <span className="bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] bg-clip-text text-transparent">
                    Consistencia
                  </span>
                </h2>

                <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-6">
                  Una sesión de auditoría personalizada donde analizamos la radiografía de tu ADN financiero, 
                  tus métricas del simulador y tus patrones emocionales. Identificamos tu principal punto ciego 
                  y te trazamos un plan de acción concreto.
                </p>

                {/* What you'll get */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
                  {[
                    { icon: <Brain size={20} />, title: 'Radiografía Mental', desc: 'Análisis de tu perfil psicológico de trading basado en tus resultados reales' },
                    { icon: <Target size={20} />, title: 'Plan de Acción', desc: 'Estrategia personalizada para eliminar tu principal trampa de consistencia' },
                    { icon: <Shield size={20} />, title: 'Blindaje Emocional', desc: 'Protocolo específico para operar sin que tus emociones saboteen tus trades' },
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                      <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-center justify-center mx-auto mb-3 text-[#8b5cf6]">
                        {item.icon}
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                      <p className="text-[11px] text-white/40 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-3 text-sm text-white/40 font-mono mb-2">
                  <span className="line-through">Valor Comercial: $1,000 USD</span>
                  <span className="text-[#00E676] font-black text-base">GRATIS</span>
                </div>
                <p className="text-[10px] text-white/25 font-mono uppercase tracking-widest">
                  Incluido con tu acceso a GENY LAB · Selecciona tu horario abajo
                </p>
              </div>

              {/* Booking iframe */}
              <div ref={iframeContainerRef} className="rounded-2xl overflow-hidden border border-white/5 bg-white">
                <iframe
                  src="https://api.leadconnectorhq.com/widget/booking/PL8YQIOeht12RChUsxY0"
                  style={{ width: '100%', minHeight: '700px', border: 'none', overflow: 'hidden' }}
                  scrolling="no"
                  id="PL8YQIOeht12RChUsxY0_1779390054610"
                  title="Agendar Diagnóstico Privado de Consistencia"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bottom motivational note */}
      <section className="py-8 md:py-12 relative z-10">
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="rounded-2xl p-6 md:p-8 border border-white/5 bg-[#080d16]/50"
          >
            <p className="text-white/60 text-sm md:text-base leading-relaxed italic">
              "La diferencia entre un trader que pierde y uno que es consistente no es la estrategia — 
              es el autoconocimiento. Tú ya hiciste el trabajo más difícil: mirarte al espejo. 
              Ahora vamos a convertir esa claridad en un plan que te haga imparable."
            </p>
            <p className="text-[#F2C500] text-xs font-mono uppercase tracking-widest mt-4 font-bold">
              — Equipo GENY LAB
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
