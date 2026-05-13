import fs from 'node:fs';

let content = fs.readFileSync('src/pages/app/RetoADN.tsx', 'utf8');

content = content.replace(/const share = \(\) => \{\n    const text = `🧬 Mi ADN Financiero es:/g, 'const shareTwitter = () => {\n    const text = `🧬 Mi ADN Financiero es:');
content = content.replace(/const share = \(\) => \{\n    const url = `https:\/\/www.facebook.com\/sharer\/sharer.php/g, 'const shareFacebook = () => {\n    const url = `https://www.facebook.com/sharer/sharer.php');

content = content.replace(/const invite = \(\) => \{\n    window.open\(`https:\/\/www.facebook.com\/sharer\/sharer.php/g, 'const inviteFacebook = () => {\n    window.open(`https://www.facebook.com/sharer/sharer.php');
content = content.replace(/const invite = \(\) => \{\n    const t = `🧬 Descubrí mi ADN Financiero:/g, 'const inviteTwitter = () => {\n    const t = `🧬 Descubrí mi ADN Financiero:');

// Fix usages around line 585
content = content.replace(/onClick=\{share\}\n            className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-white\/8 bg-white\/5 hover:bg-white\/10 hover:border-white\/20 transition-all group"\n          >\n            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"/g, 'onClick={shareTwitter}\n            className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-white/8 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"\n          >\n            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"');

// Fix usages around line 597
content = content.replace(/onClick=\{share\}\n            className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-white\/8 bg-\[#1877F2\]\/10/g, 'onClick={shareFacebook}\n            className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-white/8 bg-[#1877F2]/10');

// Fix usages around line 704
content = content.replace(/onClick=\{invite\}\n                    className="flex flex-col items-center gap-2 py-3 px-2 rounded-xl border border-white\/5 bg-\[#1877F2\]\/10 hover:bg-\[#1877F2\]\/20 transition-all group"\n                  >\n                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-\[#1877F2\]"/g, 'onClick={inviteFacebook}\n                    className="flex flex-col items-center gap-2 py-3 px-2 rounded-xl border border-white/5 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 transition-all group"\n                  >\n                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#1877F2]"');

// Fix usages around line 716
content = content.replace(/onClick=\{invite\}\n                    className="flex flex-col items-center gap-2 py-3 px-2 rounded-xl border border-white\/5 bg-white\/5 hover:bg-white\/10 transition-all group"\n                  >\n                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"/g, 'onClick={inviteTwitter}\n                    className="flex flex-col items-center gap-2 py-3 px-2 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all group"\n                  >\n                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"');

fs.writeFileSync('src/pages/app/RetoADN.tsx', content);
