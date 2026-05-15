import React from 'react';

export const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-[#05080f]/90 backdrop-blur-xl py-10 md:py-16 pb-28 md:pb-16 relative z-10 w-full mt-auto">
      <div className="mx-auto px-6 md:px-8 max-w-3xl">
        <div className="text-center space-y-6">
          <div className="space-y-5">
            <div className="flex justify-center">
              <img src="/images/78.png" alt="GENY LAB" className="h-4 md:h-6 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" loading="lazy" />
            </div>
            <p className="text-[10px] md:text-[11px] text-white/30 leading-relaxed tracking-normal" style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>
              Nota Obligatoria: El trading de activos financieros implica un riesgo real de pérdida. Los resultados mostrados son educativos y no garantizan ganancias futuras. Operativa real sujeta a riesgo de mercado.
            </p>
            <p className="text-[9px] text-white/20 leading-relaxed tracking-normal" style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>
              Este sitio no es parte del sitio web de Facebook o Facebook Inc. Además, este sitio NO está respaldado por Facebook de ninguna manera. FACEBOOK es una marca comercial de FACEBOOK, Inc. Google es una marca comercial de Google, LLC.
            </p>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col items-center gap-4">
            <p className="text-[10px] text-white/20 font-mono tracking-widest uppercase">© 2026 GENY LAB</p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[10px] font-mono text-white/30 tracking-wide">
              <a href="https://site.ingresarios.net/politicas-privacidad" target="_blank" rel="noopener noreferrer" className="hover:text-brand-green transition-colors">Privacidad</a>
              <a href="https://site.ingresarios.net/terminos-de-uso-de-informacion" target="_blank" rel="noopener noreferrer" className="hover:text-brand-green transition-colors">Términos</a>
              <a href="https://site.ingresarios.net/politicas-tratamiento-de-datos-personales" target="_blank" rel="noopener noreferrer" className="hover:text-brand-green transition-colors">Datos Personales</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
