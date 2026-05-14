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
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-[#0a1f14] border border-[#01E47E]/30 p-4 md:p-6 rounded-2xl relative overflow-hidden mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#01E47E]/5 to-transparent -translate-x-full animate-shimmer" />
      
      <h2 className="text-lg md:text-2xl font-black uppercase tracking-tight text-white relative z-10 text-center md:text-left">
        DIAGNÓSTICO FINALIZADO
      </h2>
      
      <button
        onClick={handleAction}
        className="w-full md:w-auto px-6 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 bg-[#01E47E] text-black hover:bg-[#00c96e] shadow-[0_0_20px_rgba(1,228,126,0.2)] hover:shadow-[0_0_40px_rgba(1,228,126,0.4)] hover:scale-[1.02] transition-all relative z-10 group overflow-hidden"
      >
        <span className="relative z-10 flex items-center gap-2">
          {!completed ? 'Completar Actividad' : 'Regresar'}
          <ChevronRight className="w-5 h-5" />
        </span>
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-shimmer" />
      </button>
    </div>
  );
}
