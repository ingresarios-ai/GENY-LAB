const fs = require('fs');
const file = '/Users/josuegarcia/Antigravity/APP RETO V3 - VSL/src/pages/app/pedem/MiPrimerPedem.tsx';
let content = fs.readFileSync(file, 'utf8');

// Imports
content = content.replace("import { useUser } from '../../../contexts/UserContext';", "");
content = content.replace("import { markActivityCompleted, getActivityProgress } from '../../../utils/activityProgress';", "");

// Component variables
content = content.replace('const { user } = useUser();', '');

// Restore effect
content = content.replace(/useEffect\(\(\) => \{\n    if \(!user\?\.id\) \{ setLoading\(false\); return; \}\n    \(async \(\) => \{\n      try \{\n        const progress = await getActivityProgress\(user\.id, 'pedem'\);\n        if \(progress\?\.status === 'completed' && progress\.responses\?\.path\) \{\n          setPath\(progress\.responses\.path as PedemPath\);\n          setData\(progress\.responses\);\n          setScreen\('result'\);\n          setHistory\(\['choose', 'result'\]\);\n        \}\n      \} catch \(e\) \{\n        console\.error\('Load PEDEM progress error:', e\);\n      \}\n      setLoading\(false\);\n    \}\)\(\);\n  \}, \[user\?\.id\]\);/g, `useEffect(() => { setLoading(false); }, []);`);

// Finish function
content = content.replace(/if \(user\?\.id\) \{\n      try \{\n        await markActivityCompleted\(user\.id, 'pedem', \{ path: p, \.\.\.data \}\);\n      \} catch \(e\) \{ console\.error\('Save error:', e\); \}\n    \}/g, '// local persistence');

content = content.replace(/const finish = useCallback\(async \(p: PedemPath\) => \{[\s\S]*?\}, \[data, user\?\.id, navigate\]\);/g, `const finish = useCallback(async (p: PedemPath) => {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#00E676', '#00D1FF', '#FF6321', '#FEDD04'] });
    navigate('result');
    // local persistence
  }, [data, navigate]);`);

fs.writeFileSync(file, content);
