import { forwardRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Lock } from 'lucide-react';
import { isLessonCompleted } from '../lib/progressStore';
import { syncActivityToSupabase } from '../lib/activitySync';

interface CompletionBannerProps {
  lessonId: string;
  disabled?: boolean;
  progressLabel?: string;
}

const CompletionBanner = forwardRef<HTMLDivElement, CompletionBannerProps>(
  ({ lessonId, disabled = false, progressLabel }, ref) => {
    const navigate = useNavigate();
    const completed = isLessonCompleted(lessonId);

    useEffect(() => {
      if (completed) {
        syncActivityToSupabase(lessonId);
      }
    }, [completed, lessonId]);

    const handleAction = () => {
      if (disabled) return;
      if (!completed) {
        navigate(`/app/leccion/${lessonId}?action=complete`);
      } else {
        navigate(`/app/leccion/${lessonId}`);
      }
    };

    return (
      <div
        ref={ref}
        className={`flex flex-col md:flex-row items-center justify-between gap-6 p-4 md:p-6 rounded-xl relative overflow-hidden mb-8 transition-all duration-500 ${
          disabled
            ? 'bg-[#0a1520] border border-white/10 opacity-60'
            : 'bg-[#0a1f14] border border-[#01E47E]/30'
        }`}
      >
        {!disabled && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#01E47E]/5 to-transparent -translate-x-full animate-shimmer" />
        )}

        <div className="relative z-10 text-center md:text-left">
          <h2 className={`text-base md:text-xl font-bold uppercase tracking-tight font-mono ${
            disabled ? 'text-white/40' : 'text-white'
          }`}>
            DIAGNÓSTICO FINALIZADO
          </h2>
          {disabled && progressLabel && (
            <p className="text-xs text-white/30 mt-1 font-mono uppercase tracking-widest">{progressLabel}</p>
          )}
        </div>
        
        <button
          onClick={handleAction}
          disabled={disabled}
          className={`w-full md:w-auto px-6 py-3.5 rounded-lg text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 transition-all relative z-10 ${
            disabled
              ? 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
              : 'bg-[#01E47E]/10 border border-[#01E47E]/40 text-[#01E47E] hover:bg-[#01E47E]/20 shadow-[0_0_20px_rgba(1,228,126,0.15)] hover:shadow-[0_0_30px_rgba(1,228,126,0.3)]'
          }`}
        >
          <span className="relative z-10 flex items-center gap-2">
            {disabled ? (
              <>
                <Lock className="w-4 h-4" />
                Completar Actividad
              </>
            ) : !completed ? (
              <>
                Completar Actividad
                <ChevronRight className="w-5 h-5" />
              </>
            ) : (
              <>
                Regresar
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </span>
        </button>
      </div>
    );
  }
);

CompletionBanner.displayName = 'CompletionBanner';
export default CompletionBanner;
