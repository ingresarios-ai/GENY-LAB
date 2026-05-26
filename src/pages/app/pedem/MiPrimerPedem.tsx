import { useState, useCallback, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { saveActivityProgressDB, loadActivityProgressDB, clearActivityProgressDB } from '../../lib/activitySync';
import confetti from 'canvas-confetti';
import type { PedemPath } from './constants';
import { PATH_LABELS } from './constants';
import { PedemScreen1 } from './PedemScreen1';
import { PedemScreen2a } from './PedemScreen2a';
import { PedemNovice } from './PedemNovice';
import { PedemRoutine } from './PedemRoutine';
import { PedemTrade } from './PedemTrade';
import { PedemResult } from './PedemResult';

type Screen = 'choose' | 'operator-sub' | 'novice' | 'routine' | 'trade' | 'result';

export default function MiPrimerPedem() {
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [screen, setScreen] = useState<Screen>('choose');
  const [path, setPath] = useState<PedemPath | null>(null);
  const [data, setData] = useState<Record<string, any>>({});
  const [history, setHistory] = useState<Screen[]>(['choose']);
  const [loading, setLoading] = useState(true);

  // Restore completed PEDEM from DB on mount
  useEffect(() => {
    (async () => {
      try {
        if (searchParams.get('reset') === 'true') {
          await clearActivityProgressDB('pedem');
          setSearchParams({}, { replace: true });
          setLoading(false);
          return;
        }
        const saved = await loadActivityProgressDB('pedem');
        if (saved && saved.metadata) {
          const r = saved.metadata;
          if (r.path) setPath(r.path);
          if (r.data) setData(r.data);
          if (r.completed || saved.completed) {
            setScreen('result');
            setHistory(['choose', 'result']);
          }
        }
      } catch (e) {
        console.error('Error loading PEDEM progress:', e);
      }
      setLoading(false);
    })();
  }, [searchParams, setSearchParams]);

  // Auto-save progress
  useEffect(() => {
    if (loading || !path) return;
    const timer = setTimeout(() => {
      saveActivityProgressDB('pedem', {
        path,
        data,
        completed: screen === 'result'
      }, false).catch(console.error);
    }, 1000);
    return () => clearTimeout(timer);
  }, [data, path, screen, loading]);

  const navigate = useCallback((s: Screen) => {
    setHistory(prev => [...prev, s]);
    setScreen(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goBack = useCallback(() => {
    setHistory(prev => {
      const next = prev.slice(0, -1);
      const target = next[next.length - 1] || 'choose';
      setScreen(target);
      if (target === 'choose') setPath(null);
      return next;
    });
  }, []);

  const onChange = useCallback((key: string, val: any) => {
    setData(prev => ({ ...prev, [key]: val }));
  }, []);

  const finish = useCallback(async (p: PedemPath) => {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#00E676', '#00D1FF', '#FF6321', '#FEDD04'] });
    navigate('result');
    try {
      await saveActivityProgressDB('pedem', {
        path: p,
        data,
        completed: true,
      }, true);
    } catch (e) {
      console.error('Error saving PEDEM progress:', e);
    }
  }, [data, navigate]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto pb-16 flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 text-brand-green animate-spin mx-auto" />
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted">Cargando PEDEM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-16">
      {screen !== 'result' && (
        <Link to="/app/leccion/pedem"
          className="inline-flex items-center gap-2 text-brand-text-muted hover:text-white transition-colors uppercase font-black text-xs tracking-[0.2em] mb-6">
          <ChevronLeft className="w-4 h-4" /> Volver a la Lección
        </Link>
      )}

      {path && screen !== 'choose' && (
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-[10px] tracking-[0.15em] uppercase font-black text-brand-blue bg-brand-blue/8 border border-brand-blue/25 px-3 py-1.5 rounded-full">
            {PATH_LABELS[path]}
          </span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {screen === 'choose' && (
          <PedemScreen1 key="s1"
            onNovice={() => { setPath('novice'); navigate('novice'); }}
            onOperator={() => navigate('operator-sub')}
          />
        )}
        {screen === 'operator-sub' && (
          <PedemScreen2a key="s2a"
            onRoutine={() => { setPath('routine'); navigate('routine'); }}
            onTrade={() => { setPath('trade'); navigate('trade'); }}
            onBack={goBack}
          />
        )}
        {screen === 'novice' && <PedemNovice key="nov" data={data} onChange={onChange} onFinish={() => finish('novice')} onBack={goBack} />}
        {screen === 'routine' && <PedemRoutine key="rou" data={data} onChange={onChange} onFinish={() => finish('routine')} onBack={goBack} />}
        {screen === 'trade' && <PedemTrade key="tra" data={data} onChange={onChange} onFinish={() => finish('trade')} onBack={goBack} />}
        {screen === 'result' && path && <PedemResult key="res" path={path} data={data} onRestart={async () => { setData({}); setPath(null); setHistory(['choose']); setScreen('choose'); await clearActivityProgressDB('pedem'); }} />}
      </AnimatePresence>
    </div>
  );
}
