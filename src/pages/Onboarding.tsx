// Trader Mapp — Onboarding Screen (shown once after registration)

import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Play, Target, Unlock } from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();

  const handleStart = () => {
    localStorage.setItem('trader_mapp_onboarded', 'true');
    navigate('/app');
  };

  const steps = [
    { icon: <Play size={20} className="text-brand-green" />, title: 'Mira el video', desc: 'Cada lección empieza con un video que te da contexto' },
    { icon: <Target size={20} className="text-brand-green" />, title: 'Completa la actividad', desc: 'Ejercicios interactivos que revelan tu perfil financiero' },
    { icon: <Unlock size={20} className="text-brand-green" />, title: 'Desbloquea la siguiente', desc: 'Avanza en el camino y sube de nivel' },
  ];

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="text-center max-w-[360px] w-full"
      >
        {/* Logo / title */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2 gradient-text leading-tight">
            ¡Bienvenido a<br/>Trader Mapp!
          </h1>
          <p className="text-sm text-brand-text-muted">
            Tu ruta para aprender a invertir desde cero
          </p>
        </motion.div>

        {/* 3 Steps */}
        <div className="flex flex-col gap-0 items-start mb-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.15 }}
            >
              <div className="flex items-start gap-3.5">
                {/* Step number + line */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full border-2 border-brand-green flex items-center justify-center text-brand-green font-extrabold font-display text-sm">
                    {i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-0.5 h-7 bg-gradient-to-b from-brand-green to-transparent" />
                  )}
                </div>

                {/* Content */}
                <div className="pt-1 text-left">
                  <div className="font-bold text-[0.95rem] text-white mb-0.5">
                    {step.title}
                  </div>
                  <div className="text-xs text-brand-text-muted/60 leading-relaxed">
                    {step.desc}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Reward teaser */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="glass-card py-3 px-4 mb-6 text-sm text-brand-gold font-semibold text-center border-brand-gold/20"
        >
          🎁 Completa todo y desbloquea tu Diagnóstico 1 a 1 <strong>GRATIS</strong>
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="btn-primary w-full rounded-xl py-4 text-lg font-bold gap-2"
          onClick={handleStart}
        >
          Comenzar Mi Ruta →
        </motion.button>
      </motion.div>
    </div>
  );
}
