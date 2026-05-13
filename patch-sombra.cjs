const fs = require('fs');
const file = '/Users/josuegarcia/Antigravity/APP RETO V3 - VSL/src/pages/app/RetoSombra.tsx';
let content = fs.readFileSync(file, 'utf8');

// Imports
content = content.replace('import { useUser } from "../../contexts/UserContext";', 'import { useNavigate } from "react-router-dom";');
content = content.replace(/import \{\s*getActivityProgress[\s\S]*?\} from "\.\.\/\.\.\/utils\/activityProgress";/g, '');

// Hooks
content = content.replace('const { user } = useUser();', 'const user = { id: "local-user" };\n  const navigate = useNavigate();');

// loadData
content = content.replace(/useEffect\(\(\) => \{\n    async function loadData\(\) \{[\s\S]*?loadData\(\);\n  \}, \[user\]\);/g, `useEffect(() => { setLoading(false); }, []);`);

// saveState
content = content.replace(/const saveState = async \([\s\S]*?\} = \{\}\),\n    \}\);\n    if \(completed >= 10\) \{\n      markActivityCompleted\(user\.id, "sombra", \{ route: newRoute, completedDays: newDays \}\);\n    \}\n  \};/g, `const saveState = async (newRoute = route, newTasks = tasksDone, newDays = completedDays, newDiagAns = diagAns) => {
    // Local persistence only in V3 for now
  };`);

// selectRoute
content = content.replace(/const selectRoute = async \(r: RouteType\) => \{[\s\S]*?\}\n  \};/g, `const selectRoute = async (r: RouteType) => {
    setRoute(r);
    setView("home");
    await saveState(r, tasksDone, completedDays, diagAns);
  };`);

// For the completion button, we need to find where the user gets the final victory.
// Let's add a button in the share section or wherever makes sense. Wait, Sombra has multiple days.
// The user request was to be able to complete activities to continue. Maybe we can just add a button in the DASHBOARD view (home) to complete the activity and return to the lesson.
const dashboardHeader = `<h1 className="text-3xl md:text-4xl font-black uppercase tracking-wider mb-2">`;
const dashboardHeaderReplacement = `<div className="w-full flex justify-end mb-4"><button onClick={() => navigate('/app/leccion/sombra?action=complete')} className="px-4 py-2 bg-white text-black text-xs font-black uppercase rounded hover:bg-white/90">Marcar Actividad como Completada</button></div>\n              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-wider mb-2">`;
content = content.replace(dashboardHeader, dashboardHeaderReplacement);

fs.writeFileSync(file, content);
