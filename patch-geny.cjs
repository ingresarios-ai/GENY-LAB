const fs = require('fs');
const file = '/Users/josuegarcia/Antigravity/APP RETO V3 - VSL/src/pages/app/GenyOpciones.tsx';
let content = fs.readFileSync(file, 'utf8');

// Imports
content = content.replace('import { useUser } from "../../contexts/UserContext";', 'import { useNavigate } from "react-router-dom";');
content = content.replace(/import \{ getActivityProgress, saveActivityProgress \} from "\.\.\/\.\.\/utils\/activityProgress";\n/g, '');

// Hooks
content = content.replace('const { user } = useUser();', 'const user = { id: "local-user" };\n  const navigate = useNavigate();');

// Load Data
content = content.replace(/useEffect\(\(\) => \{\n    if \(!user\?\.id\) \{ setLoading\(false\); return; \}\n    const load = async \(\) => \{[\s\S]*?load\(\);\n  \}, \[user\?\.id\]\);/g, `useEffect(() => { setLoading(false); }, []);`);

// saveState
content = content.replace(/const saveState = \(overrides: any = \{\}\) => \{[\s\S]*?\}\);/g, `const saveState = (overrides: any = {}) => {
    // Local persistence only in V3
  };`);

// Button
const titleRow = `<div className="flex items-center justify-between flex-wrap gap-3">`;
const titleRowReplacement = `<div className="w-full flex justify-end mb-4"><button onClick={() => navigate('/app/leccion/geny?action=complete')} className="px-4 py-2 bg-white text-black text-xs font-black uppercase rounded hover:bg-white/90">Marcar Actividad como Completada</button></div>\n            <div className="flex items-center justify-between flex-wrap gap-3">`;
content = content.replace(titleRow, titleRowReplacement);

fs.writeFileSync(file, content);
