// GENY LAB — Onboarding Screen (shown once after registration)

import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Play, Target, Unlock } from 'lucide-react';
import { Footer } from '../components/Footer';
import { Logo } from '../components/Logo';

export default function Onboarding() {
  const navigate = useNavigate();

  const handleStart = () => {
    localStorage.setItem('geny_lab_onboarded', 'true');
    navigate('/app');
  };

  const steps = [
    { 
      icon: <Play size={24} className="text-[#00D1FF]" />, 
      title: 'Activación Mental', 
      desc: 'Cada módulo inicia con un video inmersivo que programa tu mentalidad.' 
    },
    { 
      icon: <Target size={24} className="text-[#00FF88]" />, 
      title: 'Ejecución Práctica', 
      desc: 'Herramientas interactivas que revelan y transforman tu perfil financiero.' 
    },
    { 
      icon: <Unlock size={24} className="text-[#F2C500]" />, 
      title: 'Desbloqueo de Sistema', 
      desc: 'Tu disciplina libera nuevos niveles y aplicaciones exclusivas.' 
    },
  ];

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="text-center max-w-[420px] w-full"
      >
        {/* Logo / title */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 flex flex-col items-center"
        >
          <Logo imgClassName="w-32 md:w-40 object-contain" className="mb-6" />
          <h1 className="text-4xl sm:text-5xl font-bold uppercase tracking-tight mb-4 text-white leading-none">
            Conexión a<br/><span className="text-[#00D1FF] font-light">GENY LAB</span>
          </h1>
          <p className="text-base font-medium text-white/70">
            El ecosistema para aprender a invertir desde cero
          </p>
        </motion.div>

        {/* 3 Steps - Glass Panels */}
        <div className="flex flex-col gap-4 mb-10 w-full">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.15 }}
              className="glass-panel rounded-xl p-5 text-left w-full relative overflow-hidden"
            >
              {/* Subtle background glow based on icon color */}
              <div 
                className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{
                  background: i === 0 ? '#00D1FF' : i === 1 ? '#00FF88' : '#F2C500'
                }}
              />
              
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
                  {step.icon}
                </div>
                <div>
                  <div className="font-bold text-lg text-white mb-1 tracking-wide">
                    {step.title}
                  </div>
                  <div className="text-sm text-white/60 leading-relaxed">
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
          className="glass-panel py-4 px-5 rounded-lg mb-8 text-sm text-[#F2C500] font-mono text-center border-[#F2C500]/20"
        >
          🎁 Completa todo y desbloquea tu Diagnóstico 1 a 1
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="w-full glass-panel rounded-lg py-5 text-base font-mono tracking-widest text-[#00D1FF] bg-[#00D1FF]/10 border-[#00D1FF]/30 hover:border-[#00D1FF]/60 hover:bg-[#00D1FF]/20 transition-all uppercase"
          onClick={handleStart}
        >
          INICIAR SISTEMA
        </motion.button>
      </motion.div>
      <div className="w-full mt-auto pt-16">
        <Footer />
      </div>
    </div>
  );
}
