import fs from 'node:fs';

const files = [
  'src/pages/app/GastosHormiga.tsx',
  'src/pages/app/pedem/PedemResult.tsx',
  'src/pages/app/RetoFlow.tsx',
  'src/pages/app/RetoSombra.tsx',
  'src/pages/app/termostato-financiero/TermostatoFinanciero.tsx',
  'src/pages/app/TrampasDinero.tsx',
  'src/pages/app/GenyOpciones.tsx',
  'src/pages/app/RetoADN.tsx',
  'src/pages/app/pedem/MiPrimerPedem.tsx',
  'src/pages/app/pedem/PedemScreen1.tsx'
];

const fbSvg = (c) => `<svg viewBox="0 0 24 24" className="${c}" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073c0 6.028 4.388 11.024 10.125 11.927v-8.437H7.078v-3.49h3.047V9.42c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.929-1.956 1.883v2.263h3.328l-.532 3.49h-2.796v8.437C19.612 23.097 24 18.1 24 12.073z"/></svg>`;
const inSvg = (c) => `<svg viewBox="0 0 24 24" className="${c}" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`;
const twSvg = (c) => `<svg viewBox="0 0 24 24" className="${c}" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let content = fs.readFileSync(f, 'utf8');

  content = content.replace(/<Facebook className="([^"]+)" \/>/g, fbSvg('$1'));
  content = content.replace(/<Linkedin className="([^"]+)" \/>/g, inSvg('$1'));
  content = content.replace(/<Twitter className="([^"]+)" \/>/g, twSvg('$1'));

  // Clean up the unused imports
  content = content.replace(/Facebook,\s*/g, '');
  content = content.replace(/Linkedin,\s*/g, '');
  content = content.replace(/Twitter,\s*/g, '');
  
  fs.writeFileSync(f, content);
});
