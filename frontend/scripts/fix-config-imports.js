const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript/TSX files
const files = glob.sync('frontend/**/*.{ts,tsx}', {
  ignore: [
    '**/node_modules/**',
    '**/.next/**',
    '**/dist/**',
    '**/build/**',
    '**/lib/config.ts' // Don't modify the config file itself
  ]
});

console.log(`Found ${files.length} files to check`);

let fixedCount = 0;

files.forEach(file => {
  const filePath = path.resolve(file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if file uses config but doesn't import it
  if (content.includes('config.') && !content.includes("import { config } from '@/lib/config'")) {
    // Check if there are any imports already
    const hasImports = content.includes('import ');
    
    if (hasImports) {
      // Find the last import statement
      const importMatches = content.match(/^import .* from .*$/gm);
      if (importMatches) {
        const lastImport = importMatches[importMatches.length - 1];
        const lastImportIndex = content.lastIndexOf(lastImport);
        
        // Add config import after the last import
        content = content.slice(0, lastImportIndex + lastImport.length) + 
                  "\nimport { config } from '@/lib/config'" + 
                  content.slice(lastImportIndex + lastImport.length);
      }
    } else {
      // If no imports, add at the beginning after 'use client' if present
      if (content.startsWith("'use client'")) {
        content = "'use client'\n\nimport { config } from '@/lib/config'\n" + 
                  content.slice("'use client'".length).trimStart();
      } else {
        content = "import { config } from '@/lib/config'\n\n" + content;
      }
    }
    
    fs.writeFileSync(filePath, content);
    fixedCount++;
    console.log(`Fixed: ${file}`);
  }
});

console.log(`\n✅ Fixed ${fixedCount} files with config imports`);