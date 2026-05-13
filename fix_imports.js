import fs from 'node:fs';

const files = [
  'src/pages/app/GastosHormiga.tsx',
  'src/pages/app/pedem/PedemResult.tsx',
  'src/pages/app/RetoFlow.tsx',
  'src/pages/app/RetoSombra.tsx',
  'src/pages/app/termostato-financiero/TermostatoFinanciero.tsx'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let content = fs.readFileSync(f, 'utf8');

  // Fix lucide-react imports
  content = content.replace(/import\s+{([^}]*)}\s+from\s+'lucide-react';/, (match, p1) => {
    let parts = p1.split(',').map(s => s.trim()).filter(Boolean);
    // Add missing ones if needed
    ['Facebook', 'Linkedin', 'Twitter'].forEach(icon => {
      if (!parts.includes(icon) && content.includes(`<${icon}`)) {
        parts.push(icon);
      }
    });
    return `import { ${parts.join(', ')} } from 'lucide-react';`;
  });
  
  // Fix dangling commas at end of object before );
  // TS1005: ',' expected at RetoFlow.tsx:69:6
  // That was: 
  //    responses: { flowState: { ... } }
  //  // await saveActivityProgress(...)
  // });
  // Wait, if I commented out `await saveActivityProgress(user.id, "flow", {`, then the closing `});` is dangling!
  content = content.replace(/\/\/\s*await saveActivityProgress\([^)]+\)/g, (match) => {
     // I replaced it earlier, wait...
     return match;
  });
  
  fs.writeFileSync(f, content);
});
