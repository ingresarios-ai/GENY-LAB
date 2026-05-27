import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Lock, Shield, Mail, User, ArrowRight, Loader2 } from 'lucide-react';

interface LeadModalProps {
  onClose: () => void;
  onSubmit: (name: string, email: string, phone: string, country: string) => Promise<void>;
}

const COUNTRY_CODES = [
  { code: '+52', flag: '🇲🇽', name: 'México', iso: 'MX' },
  { code: '+57', flag: '🇨🇴', name: 'Colombia', iso: 'CO' },
  { code: '+1', flag: '🇺🇸', name: 'USA/Canadá', iso: 'US' },
  { code: '+34', flag: '🇪🇸', name: 'España', iso: 'ES' },
  { code: '+54', flag: '🇦🇷', name: 'Argentina', iso: 'AR' },
  { code: '+51', flag: '🇵🇪', name: 'Perú', iso: 'PE' },
  { code: '+56', flag: '🇨🇱', name: 'Chile', iso: 'CL' },
  { code: '+593', flag: '🇪🇨', name: 'Ecuador', iso: 'EC' },
  { code: '+58', flag: '🇻🇪', name: 'Venezuela', iso: 'VE' },
  { code: '+502', flag: '🇬🇹', name: 'Guatemala', iso: 'GT' },
  { code: '+506', flag: '🇨🇷', name: 'Costa Rica', iso: 'CR' },
  { code: '+507', flag: '🇵🇦', name: 'Panamá', iso: 'PA' },
  { code: '+591', flag: '🇧🇴', name: 'Bolivia', iso: 'BO' },
  { code: '+595', flag: '🇵🇾', name: 'Paraguay', iso: 'PY' },
  { code: '+598', flag: '🇺🇾', name: 'Uruguay', iso: 'UY' },
  { code: '+503', flag: '🇸🇻', name: 'El Salvador', iso: 'SV' },
  { code: '+504', flag: '🇭🇳', name: 'Honduras', iso: 'HN' },
  { code: '+505', flag: '🇳🇮', name: 'Nicaragua', iso: 'NI' },
];

export const LeadModal: React.FC<LeadModalProps> = ({ onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+52');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('MX');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-detect country code from IP address
  useEffect(() => {
    const detectCountry = async () => {
      try {
        const response = await fetch('https://cloudflare.com/cdn-cgi/trace');
        const text = await response.text();
        const locMatch = text.match(/loc=(\w{2})/);
        if (locMatch) {
          const code = locMatch[1].toUpperCase();
          const found = COUNTRY_CODES.find(c => c.iso === code);
          if (found) {
            setCountryCode(found.code);
            setCountry(code);
          }
          return;
        }
      } catch (e) {}

      try {
        const response = await fetch('https://api.country.is');
        const data = await response.json();
        if (data.country) {
          const code = data.country.toUpperCase();
          const found = COUNTRY_CODES.find(c => c.iso === code);
          if (found) {
            setCountryCode(found.code);
            setCountry(code);
          }
        }
      } catch (e) {}
    };
    detectCountry();
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!name.trim()) {
      setError('Por favor ingresa tu nombre completo.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Por favor ingresa un correo electrónico válido.');
      return;
    }
    const cleanNum = phoneNumber.replace(/\D/g, '');
    if (!cleanNum || cleanNum.length < 7) {
      setError('Por favor ingresa un número de teléfono válido.');
      return;
    }

    // Process Mexican formatting internally: add '1' after '+52' if missing
    let finalPhone = `${countryCode}${cleanNum}`;
    if (finalPhone.startsWith('+52') && !finalPhone.startsWith('+521')) {
      finalPhone = '+521' + finalPhone.slice(3);
    }

    setLoading(true);
    try {
      await onSubmit(name.trim(), email.trim(), finalPhone, country);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al procesar tu solicitud. Intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0c1220] p-6 sm:p-8 shadow-[0_0_80px_rgba(0,209,255,0.18)]"
      >
        {/* Glow effect at top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#00D1FF]/40 via-[#00E676]/60 to-[#00D1FF]/40" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors p-1"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center space-y-3 mb-6">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-[#00D1FF]/10 border border-[#00D1FF]/20 items-center justify-center text-[#00D1FF]">
            <Lock size={20} className="animate-pulse" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white leading-tight">
            Iniciar Pago Seguro
          </h2>
          <p className="text-white/60 text-sm max-w-sm mx-auto">
            Ingresa tus datos para continuar a la pasarela y activar tu acceso inmediato.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block">
              Nombre Completo
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/20 pointer-events-none" />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                disabled={loading}
                placeholder="Juan Pérez"
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white font-medium placeholder:text-white/20 focus:border-[#00D1FF]/50 focus:bg-white/[0.08] outline-none transition-all"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/20 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                disabled={loading}
                placeholder="correo@ejemplo.com"
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white font-medium placeholder:text-white/20 focus:border-[#00D1FF]/50 focus:bg-white/[0.08] outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block">
              WhatsApp / Teléfono
            </label>
            <div className="flex gap-2">
              <div className="relative shrink-0">
                <select
                  value={countryCode}
                  onChange={(e) => {
                    setCountryCode(e.target.value);
                    const found = COUNTRY_CODES.find(c => c.code === e.target.value);
                    if (found) setCountry(found.iso);
                  }}
                  disabled={loading}
                  className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pr-8 text-white font-semibold outline-none focus:border-[#00D1FF]/50 focus:bg-white/[0.08] transition-all cursor-pointer min-w-[110px]"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.iso} value={c.code} className="bg-[#0c1220] text-white">
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 text-xs">
                  ▼
                </div>
              </div>

              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value.replace(/\D/g, ''));
                  setError('');
                }}
                disabled={loading}
                placeholder="300 123 4567"
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white font-medium placeholder:text-white/20 focus:border-[#00D1FF]/50 focus:bg-white/[0.08] outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-xs font-semibold text-center mt-2 bg-red-500/10 border border-red-500/15 py-2 px-3 rounded-lg"
            >
              {error}
            </motion.p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-4 rounded-xl font-black uppercase tracking-wider text-sm bg-gradient-to-r from-[#00D1FF] to-[#00E676] text-[#05080f] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(0,209,255,0.35)] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Cargando checkout seguro...</span>
              </>
            ) : (
              <>
                <span>Continuar al Pago</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Secure Badges footer */}
        <div className="flex justify-center items-center gap-6 mt-6 pt-5 border-t border-white/5 text-[11px] text-white/40 uppercase tracking-widest font-mono font-bold">
          <span className="flex items-center gap-1.5">
            <Lock size={12} className="text-[#00D1FF]" /> Pago SSL Cifrado
          </span>
          <span className="flex items-center gap-1.5">
            <Shield size={12} className="text-[#00E676]" /> Garantía 15 días
          </span>
        </div>
      </motion.div>
    </div>
  );
};
