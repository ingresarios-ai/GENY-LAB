const fs = require('fs');
const file = '/Users/josuegarcia/Antigravity/APP RETO V3 - VSL/src/pages/app/RetoFlow.tsx';
let content = fs.readFileSync(file, 'utf8');

// Imports
content = content.replace('import { useUser } from "../../contexts/UserContext";', 'import { useNavigate } from "react-router-dom";');
content = content.replace(/import \{\s*getActivityProgress[\s\S]*?\} from "\.\.\/\.\.\/utils\/activityProgress";/g, '');

// Hooks
content = content.replace('const { user } = useUser();', 'const user = { id: "local-user" };\n  const navigate = useNavigate();');

// loadData
content = content.replace(/useEffect\(\(\) => \{\n    async function loadData\(\) \{[\s\S]*?loadData\(\);\n  \}, \[user\]\);/g, `useEffect(() => { setLoading(false); }, []);`);

// saveState
content = content.replace(/const saveState = async \([\s\S]*?\} = \{\}\),\n    \}\);\n    if \(completed >= 10\) \{\n      markActivityCompleted\(user\.id, "flow", \{ route: newRoute, arquetipo: newArq, completedDays: newDays \}\);\n    \}\n  \};/g, `const saveState = async (newRoute = route, newArq = arquetipo, newTasks = tasksDone, newDays = completedDays, newEmo = emociones) => {
    // Local persistence only in V3 for now
  };`);

// selectArquetipo
content = content.replace(/const selectArquetipo = async \(arqId: string\) => \{[\s\S]*?\}\n  \};/g, `const selectArquetipo = async (arqId: string) => {
    setArquetipo(arqId);
    setView("home");
    await saveState(route, arqId, tasksDone, completedDays, emociones);
  };`);

const dashboardHeader = `<h1 className="text-3xl md:text-4xl font-black text-brand-green uppercase tracking-wider mb-2">`;
const dashboardHeaderReplacement = `<div className="w-full flex justify-end mb-4"><button onClick={() => navigate('/app/leccion/flow?action=complete')} className="px-4 py-2 bg-white text-black text-xs font-black uppercase rounded hover:bg-white/90">Marcar Actividad como Completada</button></div>\n              <h1 className="text-3xl md:text-4xl font-black text-brand-green uppercase tracking-wider mb-2">`;
content = content.replace(dashboardHeader, dashboardHeaderReplacement);

fs.writeFileSync(file, content);
