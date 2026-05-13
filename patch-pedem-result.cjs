const fs = require('fs');
const file = '/Users/josuegarcia/Antigravity/APP RETO V3 - VSL/src/pages/app/pedem/PedemResult.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("import { Link } from 'react-router-dom';", "import { Link, useNavigate } from 'react-router-dom';");
content = content.replace("import { useUser } from '../../../contexts/UserContext';", "");

content = content.replace('const { user } = useUser();\n  const userName = user?.name?.split(\' \')[0] || \'Trader\';', 'const userName = \'Trader\';\n  const navigate = useNavigate();');

const restartBtn = `<button onClick={onRestart}\n            className="px-6 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-brand-text-muted hover:bg-white/10 hover:text-white transition-all font-bold cursor-pointer">\n            ↻ Hacer otro PEDEM\n          </button>`;

const newBtns = `<div className="w-full flex flex-col gap-3 max-w-md mx-auto">\n            <button onClick={() => navigate('/app/leccion/pedem?action=complete')}\n              className="px-4 py-3 bg-brand-green text-black text-xs font-black uppercase rounded hover:bg-brand-green/90 transition-all cursor-pointer">\n              Marcar Actividad como Completada\n            </button>\n            <button onClick={onRestart}\n              className="px-6 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-brand-text-muted hover:bg-white/10 hover:text-white transition-all font-bold cursor-pointer">\n              ↻ Hacer otro PEDEM\n            </button>\n          </div>`;

content = content.replace(restartBtn, newBtns);

fs.writeFileSync(file, content);
