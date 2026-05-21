// @ts-nocheck
// GENY LAB — Diagnóstico Privado de Consistencia (Booking Page)
// Unlocked after completing all 7 labs — the ultimate reward

import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy } from 'lucide-react';
import { isAllCompleted } from '../../lib/progressStore';
import { Logo } from '../../components/Logo';
import { Footer } from '../../components/Footer';
import Confetti from '../../components/Confetti';
import confetti from 'canvas-confetti';

export default function DiagnosticoBooking() {
  const navigate = useNavigate();
  const iframeContainerRef = useRef<HTMLDivElement>(null);

  // Guard: only accessible if all lessons are completed
  useEffect(() => {
    if (!isAllCompleted()) {
      navigate('/app', { replace: true });
    }
  }, [navigate]);

  // Celebration confetti burst on mount
  useEffect(() => {
    // Big center burst
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.4 },
      colors: ['#F2C500', '#FFD700', '#f59e0b', '#00E676', '#00D1FF', '#8b5cf6']
    });
    // Delayed side bursts
    setTimeout(() => {
      confetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0, y: 0.5 }, colors: ['#F2C500', '#FFD700'] });
      confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1, y: 0.5 }, colors: ['#F2C500', '#FFD700'] });
    }, 500);
  }, []);

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

  return (
    <div className="min-h-screen bg-[#05080f] relative overflow-hidden">
      {/* Confetti side sprays */}
      <Confetti />

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
      <section className="pt-12 pb-4 md:pt-20 md:pb-8 relative z-10">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#F2C500]/10 border-2 border-[#F2C500]/40 flex items-center justify-center mx-auto mb-6 shadow-[0_0_60px_rgba(242,197,0,0.15)]"
          >
            <span className="text-4xl md:text-5xl">🏆</span>
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
                Eres del 5% de los traders que realmente hacen el trabajo.
              </span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="py-6 md:py-10 relative z-10">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-3xl border border-[#F2C500]/20 bg-[#080d16]/80 backdrop-blur-xl overflow-hidden shadow-[0_0_80px_rgba(242,197,0,0.05)]"
          >
            {/* Top accent bar */}
            <div className="h-[3px] bg-gradient-to-r from-[#F2C500] via-[#FFD700] to-[#f59e0b]" />

            <div className="p-6 md:p-10">
              {/* Section Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-4">
                  Tu Sesión Diagnóstico está lista.
                </h2>

                <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-6">
                  En esta sesión analizaremos la radiografía de tu ADN financiero, tus métricas del simulador y tus patrones emocionales. Identificamos tu principal punto ciego y te trazamos un plan de acción concreto. Agéndala en el siguiente calendario.
                </p>

                <div className="flex items-center justify-center gap-3 text-sm text-white/40 font-mono">
                  <span className="line-through">Valor: $1,000 USD</span>
                  <span className="text-[#00E676] font-black text-base">INCLUIDA GRATIS</span>
                </div>
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

      <Footer />
    </div>
  );
}
