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
    { icon: <Play size={22} />, title: 'Mira el video', desc: 'Cada lección empieza con un video que te da contexto' },
    { icon: <Target size={22} />, title: 'Completa la actividad', desc: 'Ejercicios interactivos que revelan tu perfil financiero' },
    { icon: <Unlock size={22} />, title: 'Desbloquea la siguiente', desc: 'Avanza en el camino y sube de nivel' },
  ];

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '40px 24px',
      background: 'var(--bg-primary)',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        style={{ textAlign: 'center', maxWidth: 360 }}
      >
        {/* Logo / title */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginBottom: 40 }}
        >
          <h1 style={{ 
            fontFamily: 'var(--font-display)', fontSize: '2rem',
            background: 'linear-gradient(135deg, var(--green-primary), var(--cyan-accent))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 8,
          }}>
            ¡Bienvenido a<br/>Trader Mapp!
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Tu ruta para aprender a invertir desde cero
          </p>
        </motion.div>

        {/* 3 Steps */}
        <div style={{ 
          display: 'flex', flexDirection: 'column', gap: 0,
          alignItems: 'flex-start', marginBottom: 36,
        }}>
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.15 }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                {/* Step number + line */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    border: '2px solid var(--green-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--green-primary)', fontWeight: 800,
                    fontFamily: 'var(--font-display)', fontSize: '0.9rem',
                  }}>
                    {i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{
                      width: 2, height: 28,
                      background: 'linear-gradient(180deg, var(--green-primary), transparent)',
                    }} />
                  )}
                </div>

                {/* Content */}
                <div style={{ paddingTop: 4, textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 2 }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
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
          style={{
            background: 'rgba(242, 197, 0, 0.1)',
            border: '1px solid rgba(242, 197, 0, 0.25)',
            borderRadius: 12, padding: '12px 16px', marginBottom: 24,
            fontSize: '0.8rem', color: 'var(--gold-primary)', fontWeight: 600,
            textAlign: 'center',
          }}
        >
          🎁 Completa todo y desbloquea tu Diagnóstico 1 a 1 <strong>GRATIS</strong>
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="btn-primary"
          onClick={handleStart}
          style={{ maxWidth: '100%', width: '100%', fontSize: '1.1rem', padding: '16px' }}
        >
          Comenzar Mi Reto →
        </motion.button>
      </motion.div>
    </div>
  );
}
