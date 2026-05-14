// @ts-nocheck
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Copy, Check, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

function generateCode(): string {
  return Math.random().toString(36).substring(2, 10);
}

interface ShareModuleProps {
  activity: string;
  title: string;
  resultData: any;
  shareMessage?: string;
}

export default function ShareModule({ activity, title, resultData, shareMessage }: ShareModuleProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const baseUrl = window.location.origin;
  const defaultMsg = shareMessage || `¡Acabo de completar "${title}" en GENY LAB de Ingresarios! 🚀`;

  const generateShareLink = async () => {
    if (shareUrl) return shareUrl;
    setSaving(true);
    try {
      const code = generateCode();
      const { error } = await supabase.from('shared_results').insert({
        share_code: code,
        activity,
        result_data: resultData,
      });
      if (error) throw error;
      const url = `${baseUrl}/compartir/${code}`;
      setShareUrl(url);
      setSaving(false);
      return url;
    } catch (e) {
      console.error('Share error:', e);
      setSaving(false);
      return null;
    }
  };

  const handleCopyLink = async () => {
    const url = await generateShareLink();
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = async () => {
    const url = await generateShareLink();
    if (!url) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(defaultMsg + '\n\n' + url)}`, '_blank');
  };

  const handleTwitter = async () => {
    const url = await generateShareLink();
    if (!url) return;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(defaultMsg)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const handleFacebook = async () => {
    const url = await generateShareLink();
    if (!url) return;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <div className="w-full">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest bg-gradient-to-r from-brand-blue/10 to-brand-green/10 border border-brand-blue/30 text-brand-blue hover:from-brand-blue/20 hover:to-brand-green/20 hover:scale-[1.02] transition-all"
      >
        <Share2 className="w-4 h-4" />
        Compartir Resultados
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                disabled={saving}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-brand-green" />
                ) : (
                  <Copy className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
                )}
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 group-hover:text-white/80">
                  {copied ? '¡Copiado!' : saving ? 'Generando...' : 'Copiar Link'}
                </span>
              </button>

              {/* WhatsApp */}
              <button
                onClick={handleWhatsApp}
                disabled={saving}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-all group"
              >
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#25D366]/70 group-hover:text-[#25D366]">WhatsApp</span>
              </button>

              {/* Twitter/X */}
              <button
                onClick={handleTwitter}
                disabled={saving}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
              >
                <svg className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 group-hover:text-white/80">X</span>
              </button>

              {/* Facebook */}
              <button
                onClick={handleFacebook}
                disabled={saving}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#1877F2]/10 border border-[#1877F2]/20 hover:bg-[#1877F2]/20 transition-all group"
              >
                <svg className="w-5 h-5 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1877F2]/70 group-hover:text-[#1877F2]">Facebook</span>
              </button>
            </div>

            {shareUrl && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-brand-blue/5 border border-brand-blue/20">
                <p className="text-[10px] font-mono text-brand-blue/70 break-all">{shareUrl}</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
