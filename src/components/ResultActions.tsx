import { useState } from 'react';
import { Download, RotateCcw, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface ResultActionsProps {
  onDownloadPDF?: () => Promise<void>;
  onReset: () => void;
  downloadLabel?: string;
  resetLabel?: string;
}

export default function ResultActions({
  onDownloadPDF,
  onReset,
  downloadLabel = "Descargar PDF",
  resetLabel = "Repetir diagnóstico"
}: ResultActionsProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!onDownloadPDF) return;
    try {
      setIsGenerating(true);
      await onDownloadPDF();
    } catch (err) {
      console.error("Error generating PDF:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
      {onDownloadPDF && (
        <button 
          onClick={handleDownload}
          disabled={isGenerating}
          className="relative inline-flex items-center gap-2 px-6 py-3.5 rounded-lg text-xs font-mono uppercase tracking-widest bg-brand-blue/10 border border-brand-blue/30 text-brand-blue hover:bg-brand-blue/20 transition-all disabled:opacity-50 disabled:pointer-events-none group overflow-hidden"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> 
              Generando PDF...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" /> 
              {downloadLabel}
            </>
          )}
          {isGenerating && (
            <div className="absolute inset-x-0 -bottom-8 flex justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[9px] text-brand-blue/80 whitespace-nowrap bg-[#080c14] px-2 py-1 rounded">Puede tardar unos minutos</span>
            </div>
          )}
        </button>
      )}

      <button 
        onClick={onReset}
        disabled={isGenerating}
        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg text-xs font-mono uppercase tracking-widest bg-white/5 border border-white/10 text-brand-text-muted hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
      >
        <RotateCcw className="w-4 h-4" /> 
        {resetLabel}
      </button>
    </div>
  );
}
