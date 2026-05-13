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

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;

  // Add the imports for Facebook, Linkedin, Twitter if missing
  const needsFb = content.includes('< className="') && content.includes('#1877F2');
  const needsLi = content.includes('< className="') && content.includes('#0A66C2');
  const needsTw = content.includes('< className="') && content.includes('text-white/70');
  
  if (needsFb || needsLi || needsTw || content.includes('< className="')) {
     content = content.replace(/<\s+className="([^"]*#1877F2[^"]*)"\s*\/>/g, '<Facebook className="$1" />');
     content = content.replace(/<\s+className="([^"]*#0A66C2[^"]*)"\s*\/>/g, '<Linkedin className="$1" />');
     content = content.replace(/<\s+className="([^"]*text-white\/70[^"]*)"\s*\/>/g, '<Twitter className="$1" />');
     
     // add back to import
     if (!content.includes('Facebook,')) {
         content = content.replace(/import\s+{([^}]*)}\s+from\s+'lucide-react';/, "import { $1, Facebook, Linkedin, Twitter } from 'lucide-react';");
     }
     changed = true;
  }
  
  // Fix dangling commas if any
  content = content.replace(/,\s*\/\/\s*await\s+saveActivityProgress/g, '\n// await saveActivityProgress');
  content = content.replace(/,\s*\/\/\s*markActivityCompleted/g, '\n// markActivityCompleted');
  
  // also fix trailing commas in useEffect etc
  content = content.replace(/},\s*1000\);/g, '}, 1000);');

  if (changed) fs.writeFileSync(f, content);
});
