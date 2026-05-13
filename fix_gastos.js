import fs from 'node:fs';

let content = fs.readFileSync('src/pages/app/GastosHormiga.tsx', 'utf8');
content = content.replace(/const progress = null;/g, 'const progress: any = null;');
content = content.replace(/n: 'Trader' \|\| 'Participante',/g, "n: 'Trader',");
fs.writeFileSync('src/pages/app/GastosHormiga.tsx', content);

// Also fix TermostatoFinanciero
let content2 = fs.readFileSync('src/pages/app/termostato-financiero/TermostatoFinanciero.tsx', 'utf8');
content2 = content2.replace(/n: 'Trader' \|\| 'Participante',/g, "n: 'Trader',");
fs.writeFileSync('src/pages/app/termostato-financiero/TermostatoFinanciero.tsx', content2);
