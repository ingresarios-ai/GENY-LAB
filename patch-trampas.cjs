const fs = require('fs');
const file = '/Users/josuegarcia/Antigravity/APP RETO V3 - VSL/src/pages/app/TrampasDinero.tsx';
let content = fs.readFileSync(file, 'utf8');

// Imports
content = content.replace('import { useUser } from "../../contexts/UserContext";', 'import { useNavigate } from "react-router-dom";');
content = content.replace(/import \{\s*getActivityProgress[\s\S]*?\} from "\.\.\/\.\.\/utils\/activityProgress";/g, '');

// Hooks
content = content.replace('const { user } = useUser();', 'const user = { id: "local-user" };\n  const navigate = useNavigate();');

// load
content = content.replace(/useEffect\(\(\) => \{\n    async function load\(\) \{[\s\S]*?load\(\);\n  \}, \[user\?\.id\]\);/g, `useEffect(() => { setLoading(false); }, []);`);

// auto-save
content = content.replace(/const saveTimeoutRef[\s\S]*?\}, \[responses, view\]\);/g, `// Auto-save logic removed for V3`);

// handleStart
content = content.replace(/const handleStart = async \(\) => \{\n    setView\("questions"\);\n    if \(user\?\.id\) \{\n      markActivityStarted\(user\.id, "trampas", \{ answers: responses \}\);\n    \}\n  \};/g, `const handleStart = () => { setView("questions"); };`);

// handleComplete
content = content.replace(/const handleComplete = async \(\) => \{[\s\S]*?100\n    \);\n  \};/g, `const handleComplete = () => {
    setView("completed");
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ["#FF3EB0", "#00FF94", "#FFD93D", "#00D2FF"] });
    setTimeout(() => contentRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 100);
  };`);

// Add the final button in the share section or before it
const finalCta = `          <button
            onClick={() => navigate('/app/leccion/trampas?action=complete')}
            className="w-full mt-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm bg-white text-black hover:bg-white/90 transition-all"
          >
            Completar Actividad y Continuar
          </button>
          {/* Share Section */}`;

content = content.replace('{/* Share Section */}', finalCta);

fs.writeFileSync(file, content);
