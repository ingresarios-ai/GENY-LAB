const fs = require('fs');

let content = fs.readFileSync('/Users/josuegarcia/Antigravity/APP RETO V3 - VSL/src/pages/app/RetoADN.tsx', 'utf8');

// Replace imports
content = content.replace('import { useUser } from "../../contexts/UserContext";', 'import { useNavigate } from "react-router-dom";');
content = content.replace('import { getActivityProgress, saveActivityProgress } from "../../utils/activityProgress";', '');

// Replace hooks
content = content.replace('const { user } = useUser();', 'const user = { id: "local-user" };\n  const navigate = useNavigate();');

// Simplify load
content = content.replace(/useEffect\(\(\) => \{\n    if \(\!user\?\.id\) \{ setLoading\(false\); return; \}\n    const load = async \(\) => \{\n[\s\S]*?load\(\);\n  \}, \[user\?\.id\]\);/m, `useEffect(() => {
    setLoading(false);
  }, []);`);

// Simplify saveState
content = content.replace(/const saveState = async \(overrides: any = \{\}\) => \{[\s\S]*?\};\n/m, `const saveState = async (overrides: any = {}) => {
    // Local memory only
  };
`);

// Add final button in result screen
const finalCTA = `      {/* CTA */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="rounded-2xl p-5 text-center space-y-3"
        style={{ background: \`\${prof.color}08\`, border: \`1px solid \${prof.color}25\` }}>
        <p className="text-[9px] font-black uppercase tracking-widest text-amber-400">Tu camino comienza aquí</p>
        <p className="text-sm text-slate-300 leading-relaxed">
          Tu ADN financiero no es un límite — es tu punto de partida. Cada decisión que tomas con dinero es una expresión de quién eres hoy. La buena noticia: <span className="font-bold text-white">el ADN se puede reprogramar</span>. Con consciencia, método y práctica, puedes evolucionar hacia la versión más poderosa de tu perfil financiero.
        </p>
        <div className="pt-4">
          <button
            onClick={() => navigate('/app/leccion/adn?action=complete')}
            className="w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm bg-white text-black hover:bg-white/90 transition-all"
          >
            Completar Actividad y Continuar
          </button>
        </div>
      </motion.div>`;

content = content.replace(/\{\/\* CTA \*\/\}\n\s*<motion\.div[\s\S]*?<\/motion\.div>/m, finalCTA);

fs.writeFileSync('/Users/josuegarcia/Antigravity/APP RETO V3 - VSL/src/pages/app/RetoADN.tsx', content);
