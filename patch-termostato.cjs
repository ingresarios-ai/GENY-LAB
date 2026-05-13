const fs = require('fs');
const file = '/Users/josuegarcia/Antigravity/APP RETO V3 - VSL/src/pages/app/termostato-financiero/TermostatoFinanciero.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("import { useUser } from '../../../contexts/UserContext';", "import { useNavigate } from 'react-router-dom';");
content = content.replace("import { getActivityProgress, saveActivityProgress, markActivityCompleted } from '../../../utils/activityProgress';", '');

content = content.replace('const { user } = useUser();', 'const user = { id: "local-user" };\n  const navigate = useNavigate();');

content = content.replace(/useEffect\(\(\) => \{\n    if \(!user\?\.id\) return;\n    const load = async \(\) => \{[\s\S]*?load\(\);\n  \}, \[user\?\.id\]\);/g, `useEffect(() => {}, []);`);

content = content.replace(/if \(user\?\.id\) \{\n      markActivityCompleted\(user\.id, 'termostato', \{ userData: newUserData, challengeDays \}\);\n    \}/g, '// local persistence');

content = content.replace(/if \(user\?\.id\) \{\n      saveActivityProgress\(user\.id, 'termostato', \{\n        responses: \{ userData, challengeDays: newDays \},\n      \}\);\n    \}/g, '// local persistence');

content = content.replace(/if \(user\?\.id\) \{\n        saveActivityProgress\(user\.id, 'termostato', \{\n          status: 'not_started',\n          responses: \{\},\n        \}\);\n      \}/g, '// local persistence');

const challengeTitle = `<div className="space-y-1">\n                  <h2 className="text-3xl font-black uppercase tracking-tight">Reto de <span className="text-brand-yellow">10 Días</span></h2>\n                  <p className="text-brand-text-muted text-sm font-medium">Expansión de Capacidad Financiera</p>\n                </div>`;
const challengeTitleReplacement = `<div className="space-y-1">\n                  <div className="w-full flex mb-2"><button onClick={() => navigate('/app/leccion/termostato?action=complete')} className="px-4 py-2 bg-brand-yellow text-black text-xs font-black uppercase rounded hover:bg-brand-yellow/90">Marcar Actividad como Completada</button></div>\n                  <h2 className="text-3xl font-black uppercase tracking-tight">Reto de <span className="text-brand-yellow">10 Días</span></h2>\n                  <p className="text-brand-text-muted text-sm font-medium">Expansión de Capacidad Financiera</p>\n                </div>`;

content = content.replace(challengeTitle, challengeTitleReplacement);

fs.writeFileSync(file, content);
