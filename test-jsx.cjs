const fs = require('fs');
const ts = require('typescript');
const code = fs.readFileSync('src/pages/app/RetoADN.tsx', 'utf8');
const sourceFile = ts.createSourceFile('RetoADN.tsx', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
sourceFile.parseDiagnostics.forEach(d => {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(d.start);
  console.log(`Line ${line + 1}: ${d.messageText}`);
});
