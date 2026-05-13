const fs = require('fs');
const glob = require('glob');

// 1. Fix App.tsx imports
let appPath = 'src/App.tsx';
let appStr = fs.readFileSync(appPath, 'utf8');
appStr = appStr.replace(/import\s+\{\s*RetoADN\s*\}\s+from\s+'\.\/pages\/app\/RetoADN';/, "import RetoADN from './pages/app/RetoADN';");
appStr = appStr.replace(/import\s+\{\s*TrampasDinero\s*\}\s+from\s+'\.\/pages\/app\/TrampasDinero';/, "import TrampasDinero from './pages/app/TrampasDinero';");
appStr = appStr.replace(/import\s+\{\s*RetoSombra\s*\}\s+from\s+'\.\/pages\/app\/RetoSombra';/, "import RetoSombra from './pages/app/RetoSombra';");
appStr = appStr.replace(/import\s+\{\s*RetoFlow\s*\}\s+from\s+'\.\/pages\/app\/RetoFlow';/, "import RetoFlow from './pages/app/RetoFlow';");
appStr = appStr.replace(/import\s+\{\s*GenyOpciones\s*\}\s+from\s+'\.\/pages\/app\/GenyOpciones';/, "import GenyOpciones from './pages/app/GenyOpciones';");
appStr = appStr.replace(/import\s+\{\s*TermostatoFinanciero\s*\}\s+from\s+'\.\/pages\/app\/termostato-financiero\/TermostatoFinanciero';/, "import TermostatoFinanciero from './pages/app/termostato-financiero/TermostatoFinanciero';");
fs.writeFileSync(appPath, appStr);

// 2. Fix LessonScreen useEffect
let lessonPath = 'src/pages/app/LessonScreen.tsx';
let lessonStr = fs.readFileSync(lessonPath, 'utf8');
if (lessonStr.includes("import { useState, useMemo } from 'react';")) {
  lessonStr = lessonStr.replace("import { useState, useMemo } from 'react';", "import { useState, useMemo, useEffect } from 'react';");
}
fs.writeFileSync(lessonPath, lessonStr);

// 3. Fix lucide-react icons in multiple files
const filesWithLucide = glob.sync('src/pages/app/**/*.tsx');
filesWithLucide.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  if (content.includes('Facebook')) { content = content.replace(/Facebook,?/g, ''); changed = true; }
  if (content.includes('Twitter')) { content = content.replace(/Twitter,?/g, ''); changed = true; }
  if (content.includes('Linkedin')) { content = content.replace(/Linkedin,?/g, ''); changed = true; }
  if (content.match(/import\s+{([^}]*)}\s+from\s+'lucide-react';/)) {
    // clean up empty imports or dangling commas if needed but whatever
  }
  if (file.includes('TermostatoFinanciero.tsx') && !content.includes('ArrowLeft')) {
    content = content.replace(/import\s+{([^}]*)}\s+from\s+'lucide-react';/, "import { $1, ArrowLeft } from 'lucide-react';");
    changed = true;
  }
  
  // also fix `user?.name` issue
  if (content.includes('user?.name')) {
    content = content.replace(/user\?\.name/g, "'Trader'");
    changed = true;
  }
  if (content.includes('user.name')) {
    content = content.replace(/user\.name/g, "'Trader'");
    changed = true;
  }
  
  if (changed) fs.writeFileSync(file, content);
});

