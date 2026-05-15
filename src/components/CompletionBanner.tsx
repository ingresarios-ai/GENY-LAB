import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { isLessonCompleted } from '../lib/progressStore';

interface CompletionBannerProps {
  lessonId: string;
}

export default function CompletionBanner({ lessonId }: CompletionBannerProps) {
  const navigate = useNavigate();
  const completed = isLessonCompleted(lessonId);

  const handleAction = () => {
    if (!completed) {
      navigate(`/app/leccion/${lessonId}?action=complete`);
    } else {
      navigate(`/app/leccion/${lessonId}`);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-[#0a1f14] border border-[#01E47E]/30 p-4 md:p-6 rounded-xl relative overflow-hidden mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#01E47E]/5 to-transparent -translate-x-full animate-shimmer" />
      
      <h2 className="text-base md:text-xl font-bold uppercase tracking-tight text-white relative z-10 text-center md:text-left font-mono">
        DIAGNÓSTICO FINALIZADO
      </h2>
      
      <button
        onClick={handleAction}
        className="w-full md:w-auto px-6 py-3.5 rounded-lg text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 bg-[#01E47E]/10 border border-[#01E47E]/40 text-[#01E47E] hover:bg-[#01E47E]/20 shadow-[0_0_20px_rgba(1,228,126,0.15)] hover:shadow-[0_0_30px_rgba(1,228,126,0.3)] transition-all relative z-10"
      >
        <span className="relative z-10 flex items-center gap-2">
          {!completed ? 'Completar Actividad' : 'Regresar'}
          <ChevronRight className="w-5 h-5" />
        </span>
      </button>
    </div>
  );
}
