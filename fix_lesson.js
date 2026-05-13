import fs from 'node:fs';

let content = fs.readFileSync('src/pages/app/LessonScreen.tsx', 'utf8');
content = content.replace(/const result = \/\/ markActivityCompleted\(\.\.\.\)/g, 'const result = markActivityCompleted(lesson.id);');
fs.writeFileSync('src/pages/app/LessonScreen.tsx', content);
