const fs = require('fs');
let content = fs.readFileSync('/Users/josuegarcia/Antigravity/APP RETO V3 - VSL/src/pages/app/GastosHormiga.tsx', 'utf-8');

content = content.replace("import { markActivityCompleted } from '../../lib/progressStore';", "");
content = content.replace("if (user?.id) {\n      markActivityCompleted('gastos');\n    }", "");
content = content.replace("onClick={() => navigate('/app/leccion/gastos?completed=true')}", "onClick={() => navigate('/app/leccion/gastos?action=complete')}");

fs.writeFileSync('/Users/josuegarcia/Antigravity/APP RETO V3 - VSL/src/pages/app/GastosHormiga.tsx', content);
