import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, AlertCircle, User, Lock } from 'lucide-react';
import { adminLogin } from '../../lib/adminApi';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const ok = await adminLogin(username, password);
      if (ok) {
        navigate('/admin');
      } else {
        setError('Credenciales incorrectas');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4" style={{ background: '#060910' }}>
      <div className="w-full max-w-xs">
        {/* Identity */}
        <div className="text-center mb-10">
          <div
            className="w-12 h-12 rounded-xl border flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(0,209,255,0.06)', borderColor: 'rgba(0,209,255,0.15)' }}
          >
            <Shield className="w-5 h-5 text-brand-blue" />
          </div>
          <h1 className="text-sm font-black tracking-[0.25em] uppercase text-white/90">
            GENY LAB
          </h1>
          <p className="text-[11px] text-white/30 tracking-[0.2em] uppercase mt-1.5">
            Panel de Control
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="text-[11px] font-semibold tracking-wide text-white/40 block mb-2">
              Usuario
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full rounded-xl pl-10 pr-4 py-3 text-sm text-white font-mono transition-all placeholder:text-white/15 focus:outline-none"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(0,209,255,0.35)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                autoFocus
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-[11px] font-semibold tracking-wide text-white/40 block mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl pl-10 pr-10 py-3 text-sm text-white font-mono transition-all placeholder:text-white/15 focus:outline-none"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(0,209,255,0.35)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div
              className="flex items-center gap-2.5 text-[12px] rounded-xl px-3.5 py-2.5"
              style={{
                color: '#ff6b6b',
                background: 'rgba(255,107,107,0.06)',
                border: '1px solid rgba(255,107,107,0.12)',
              }}
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full py-3 rounded-xl font-bold tracking-[0.15em] uppercase text-[11px] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: '#00D1FF',
              color: '#060910',
            }}
            onMouseOver={e => { if (!loading) (e.target as HTMLElement).style.boxShadow = '0 0 24px rgba(0,209,255,0.35)'; }}
            onMouseOut={e => { (e.target as HTMLElement).style.boxShadow = 'none'; }}
          >
            {loading ? 'Verificando…' : 'Acceder'}
          </button>
        </form>

        <p className="text-center text-[10px] text-white/15 mt-8 tracking-[0.15em] uppercase">
          Acceso restringido
        </p>
      </div>
    </div>
  );
}
