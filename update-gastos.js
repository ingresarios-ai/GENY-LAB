const fs = require('fs');
let content = fs.readFileSync('/Users/josuegarcia/Antigravity/APP RETO V3 - VSL/src/pages/app/GastosHormiga.tsx', 'utf-8');

// Replace UserContext
content = content.replace("import { useUser } from '../../contexts/UserContext';", "");
content = content.replace("const { user } = useUser();", "const user = { id: 'local-user' };");

// Replace activityProgress
content = content.replace("import { getActivityProgress, markActivityCompleted, markActivityStarted } from '../../utils/activityProgress';", "import { markActivityCompleted } from '../../lib/progressStore';");

// Replace getActivityProgress logic (mock it)
content = content.replace(/const progress = await getActivityProgress\(user\.id, 'gastos'\);/g, "const progress = null;");

// Replace markActivityStarted logic
content = content.replace(/markActivityStarted\(user\.id, 'gastos', \{ amounts, currencyId: currency\.id \}\);/g, "/* markActivityStarted */");

// Replace markActivityCompleted logic
content = content.replace(/markActivityCompleted\(user\.id, 'gastos', \{[\s\S]*?\}\);/g, "markActivityCompleted('gastos');");

// Update CTA button navigation
content = content.replace("onClick={() => navigate('/app/geny-opciones')}", "onClick={() => navigate('/app/leccion/gastos')}");
content = content.replace("Quiero aprender a invertir esto con INGRESARIOS", "Completar Actividad y Continuar");

fs.writeFileSync('/Users/josuegarcia/Antigravity/APP RETO V3 - VSL/src/pages/app/GastosHormiga.tsx', content);
