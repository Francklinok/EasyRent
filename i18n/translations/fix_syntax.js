const fs = require('fs');
const path = require('path');

const tsPath = 'c:/Users/LENOVO/node/node-course/native/myapp/i18n/translations';

const files = ['fr.ts', 'en.ts', 'es.ts', 'de.ts', 'ar.ts'];

for (const name of files) {
  const filePath = path.join(tsPath, name);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix the double comma syntax error
  content = content.replace(/\},,\n/g, '},\n');
  
  fs.writeFileSync(filePath, content);
  console.log(`Syntax fixed in ${name}`);
}
