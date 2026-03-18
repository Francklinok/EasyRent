const fs = require('fs');
const path = require('path');

const tsPath = 'c:/Users/LENOVO/node/node-course/native/myapp/i18n/translations';

// Read fr_additions.ts to extract objects manually or via require
// Since it's TS, it's easier to just read the file and do string manipulation

const additionsContent = fs.readFileSync(path.join(tsPath, 'fr_additions.ts'), 'utf8');

const frMatch = additionsContent.match(/export const frAdditions = (\{[\s\S]*?^});/m);
const enMatch = additionsContent.match(/export const enAdditions = (\{[\s\S]*?^});/m);

if (!frMatch || !enMatch) {
  console.error("Could not find frAdditions or enAdditions");
  process.exit(1);
}

// Remove the outer curly braces so we just have the properties
let frProps = frMatch[1].trim();
frProps = frProps.substring(1, frProps.length - 1).trim();

let enProps = enMatch[1].trim();
enProps = enProps.substring(1, enProps.length - 1).trim();

const files = [
  { name: 'fr.ts', props: frProps, hasExportType: true },
  { name: 'en.ts', props: enProps, hasExportType: false },
  { name: 'es.ts', props: enProps, hasExportType: false },
  { name: 'de.ts', props: enProps, hasExportType: false },
  { name: 'ar.ts', props: enProps, hasExportType: false }
];

for (const {name, props, hasExportType} of files) {
  const filePath = path.join(tsPath, name);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find the end of the root object
  // It usually ends with "};\n", or if there's "export type TranslationKeys", we find "};\n\nexport type"
  
  if (hasExportType) {
    content = content.replace(/\n\};[\s\n]*export type TranslationKeys = typeof fr;/, `,\n\n  ${props}\n};\n\nexport type TranslationKeys = typeof fr;`);
  } else {
    // Just find the last "};"
    let lastBracketIndex = content.lastIndexOf('};');
    if (lastBracketIndex !== -1) {
      content = content.substring(0, lastBracketIndex) + `,\n\n  ${props}\n` + content.substring(lastBracketIndex);
    }
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${name}`);
}
