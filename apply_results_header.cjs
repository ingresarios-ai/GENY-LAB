const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'pages', 'app');

const filesToUpdate = [
  {
    file: 'GastosHormiga.tsx',
    title: 'Resultados Gastos Hormiga',
    navTo: '/app/leccion/gastos'
  },
  {
    file: 'RetoADN.tsx',
    title: 'Resultados ADN Financiero',
    navTo: '/app/leccion/adn'
  },
  {
    file: 'RetoSombra.tsx',
    title: 'Resultados Sombra Financiera',
    navTo: '/app/leccion/sombra'
  },
  {
    file: 'termostato-financiero/TermostatoFinanciero.tsx',
    title: 'Resultados Termostato Financiero',
    navTo: '/app/leccion/termostato'
  },
  {
    file: 'TrampasDinero.tsx',
    title: 'Resultados Trampas del Dinero',
    navTo: '/app/leccion/trampas'
  },
  {
    file: 'GenyOpciones.tsx',
    title: 'Resultados Geny Opciones',
    navTo: '/app/leccion/opciones' // I will verify this URL
  }
];

function generateHeaderBlock(title, navUrl) {
  return `
        {/* Results Title & Main CTA */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-brand-green/10 border border-brand-green/20 p-6 rounded-2xl relative overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-green/10 to-transparent -translate-x-full animate-shimmer" />
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white relative z-10 text-center md:text-left">
            ${title}
          </h2>
          <button
            onClick={() => navigate('${navUrl}')}
            className="btn-primary w-full md:w-auto px-8 py-4 rounded-xl text-sm md:text-base font-black uppercase tracking-[0.15em] flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(1,228,126,0.4)] hover:shadow-[0_0_40px_rgba(1,228,126,0.6)] hover:scale-105 transition-all relative z-10 group overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Completar Actividad
              <ChevronRight className="w-5 h-5" />
            </span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-shimmer" />
          </button>
        </div>
`;
}

function processFile(item) {
  const filePath = path.join(srcDir, item.file);
  if (!fs.existsSync(filePath)) {
    console.log('File not found:', filePath);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Try to find the exact navigation URL to use if we have it in the file.
  const navMatch = content.match(/navigate\('(\/app\/leccion\/[^']+)'\)/);
  if (navMatch) {
    item.navTo = navMatch[1];
  } else {
    // maybe look for Completar Actividad string
    console.log('Warning: could not find exact navigate URL for', item.file, 'using default:', item.navTo);
  }

  // 1. Remove the old CTA button.
  // The old CTA button usually looks like:
  // {/* CTA */}
  // <div className="flex flex-col items-center gap-4 mt-12 mb-8">
  //   <button ... > Completar Actividad y Continuar ... </button>
  // </div>
  // We'll use a regex to remove it.
  const ctaRegex1 = /\{\/\* CTA \*\/\}\s*<div[^>]*>\s*<button[\s\S]*?Completar Actividad[\s\S]*?<\/button>\s*<\/div>/g;
  content = content.replace(ctaRegex1, '');

  const ctaRegex2 = /<div[^>]*>\s*<button[^>]*onClick=\{[^}]*navigate\('[^']*'\)[^}]*\}[^>]*>[\s\S]*?Completar Actividad[\s\S]*?<\/button>\s*<\/div>/g;
  content = content.replace(ctaRegex2, '');
  
  const ctaRegex3 = /\{\/\* CTA \*\/\}\s*<div[^>]*>\s*<button[\s\S]*?<\/button>\s*<\/div>/g;
  // Be careful with regex3, it might remove other things if they have "CTA" comment.
  // Let's just check if it contains 'navigate' or 'Completar'
  content = content.replace(/\{\/\* CTA \*\/\}\s*<div[^>]*>\s*<button[\s\S]*?(?:Completar|navigate)[\s\S]*?<\/button>\s*<\/div>/g, '');

  // 2. Insert the new Header block right after Top nav.
  // Top nav usually looks like:
  // {/* Top nav */}
  // <div className="flex items-center justify-between...">
  //   ...
  // </div>
  // We will find the end of the top nav div and insert our code.
  
  // A safer approach: look for "{/* Main 2-column layout */}" or similar markers where the results content starts.
  // Many of these files have:
  // {/* Main content */} or {/* Main 2-column layout */} or {/* Content */} or {/* Results */}
  const insertMarkers = [
    '{/* Main 2-column layout */}',
    '{/* Main content */}',
    '{/* Content */}',
    '{/* Overview */}'
  ];
  
  let inserted = false;
  for (const marker of insertMarkers) {
    if (content.includes(marker)) {
      content = content.replace(marker, generateHeaderBlock(item.title, item.navTo) + '\n        ' + marker);
      inserted = true;
      break;
    }
  }
  
  if (!inserted) {
    // If no marker found, we try to place it right after Top nav
    const topNavIndex = content.indexOf('{/* Top nav */}');
    if (topNavIndex !== -1) {
      // Find the closing div of top nav
      let braceCount = 0;
      let i = content.indexOf('<div', topNavIndex);
      let started = false;
      while (i < content.length) {
        if (content.substr(i, 4) === '<div') {
          braceCount++;
          started = true;
          i += 4;
        } else if (content.substr(i, 5) === '</div') {
          braceCount--;
          i += 5;
        } else {
          i++;
        }
        
        if (started && braceCount === 0) {
          // Found end of top nav div
          const insertPos = content.indexOf('>', i - 1) + 1;
          const before = content.slice(0, insertPos);
          const after = content.slice(insertPos);
          content = before + generateHeaderBlock(item.title, item.navTo) + after;
          inserted = true;
          break;
        }
      }
    }
  }
  
  if (!inserted) {
    console.log('Failed to insert header in', item.file);
  } else {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully updated', item.file);
  }
}

filesToUpdate.forEach(processFile);

// Also update index.css to include the shimmer animation
const cssPath = path.join(__dirname, 'src', 'index.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');
if (!cssContent.includes('@keyframes shimmer')) {
  cssContent += "\n@keyframes shimmer {\n  0% { transform: translateX(-100%) skewX(-15deg); }\n  50%, 100% { transform: translateX(200%) skewX(-15deg); }\n}\n.animate-shimmer { animation: shimmer 2.5s infinite; }\n";
  fs.writeFileSync(cssPath, cssContent, 'utf8');
  console.log('Updated index.css');
}
