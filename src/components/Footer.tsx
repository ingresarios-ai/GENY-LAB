import React from 'react';

export const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-brand-base/80 backdrop-blur-xl py-12 md:py-16 pb-24 md:pb-16 relative z-10 w-full mt-auto">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-6">
            <div className="flex justify-center">
              <img src="/images/logo_footer.png" alt="GENY LAB" className="h-10 md:h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" loading="lazy" />
            </div>
            <p className="text-[11px] text-brand-text-muted leading-relaxed font-medium uppercase tracking-widest">
              Nota Obligatoria: El trading de activos financieros implica un riesgo real de pérdida. Los resultados mostrados son educativos y no garantizan ganancias futuras. Operativa real sujeta a riesgo de mercado.
            </p>
            <p className="text-[9px] text-brand-text-muted/60 leading-relaxed uppercase tracking-[0.15em]">
              Este sitio no es parte del sitio web de Facebook o Facebook Inc. Además, este sitio NO está respaldado por Facebook de ninguna manera. FACEBOOK es una marca comercial de FACEBOOK, Inc. Google es una marca comercial de Google, LLC.
            </p>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] text-brand-text-muted/40 font-bold uppercase tracking-widest">© 2026 GENY LAB</p>
            <div className="flex flex-wrap justify-center md:justify-end gap-6 text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">
              <a href="https://site.ingresarios.net/politicas-privacidad" target="_blank" rel="noopener noreferrer" className="hover:text-brand-green transition-colors">Políticas de Privacidad</a>
              <a href="https://site.ingresarios.net/terminos-de-uso-de-informacion" target="_blank" rel="noopener noreferrer" className="hover:text-brand-green transition-colors">Términos de Uso</a>
              <a href="https://site.ingresarios.net/politicas-tratamiento-de-datos-personales" target="_blank" rel="noopener noreferrer" className="hover:text-brand-green transition-colors">Política y Autorización para el Tratamiento de Datos Personales</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
