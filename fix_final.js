import fs from 'node:fs';

const files = [
  'src/pages/app/GastosHormiga.tsx',
  'src/pages/app/pedem/PedemResult.tsx',
  'src/pages/app/termostato-financiero/TermostatoFinanciero.tsx'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/,\s*Twitter/g, '');
  content = content.replace(/,\s*Facebook/g, '');
  content = content.replace(/,\s*Linkedin/g, '');
  
  if (f.includes('TermostatoFinanciero')) {
     if (!content.includes('ArrowLeft,')) {
         content = content.replace(/import\s+{([^}]*)}\s+from\s+'lucide-react';/, "import { ArrowLeft, $1 } from 'lucide-react';");
     }
  }
  fs.writeFileSync(f, content);
});
