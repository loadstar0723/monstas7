const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript/TSX files
const files = glob.sync('app/**/*.{ts,tsx}', { cwd: path.join(__dirname, '..') });

let totalFixed = 0;
let filesFixed = 0;

files.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    let fixCount = 0;
    
    // Pattern 1: Simple onChange handlers
    const simplePattern = /onChange=\{(\(e\)) => ([a-zA-Z_][a-zA-Z0-9_]*)\(e\.target\.value\)\}/g;
    content = content.replace(simplePattern, (match, param, funcName) => {
      fixCount++;
      return `onChange={(e) => {
              if (e && e.target && e.target.value) {
                ${funcName}(e.target.value)
              }
            }}`;
    });
    
    // Pattern 2: onChange with type conversion
    const typeConversionPattern = /onChange=\{(\(e\)) => ([a-zA-Z_][a-zA-Z0-9_]*)\((parseInt|parseFloat|Number)\(e\.target\.value\)\)\}/g;
    content = content.replace(typeConversionPattern, (match, param, funcName, converter) => {
      fixCount++;
      return `onChange={(e) => {
              if (e && e.target && e.target.value) {
                ${funcName}(${converter}(e.target.value))
              }
            }}`;
    });
    
    // Pattern 3: onChange with 'as any'
    const asAnyPattern = /onChange=\{(\(e\)) => ([a-zA-Z_][a-zA-Z0-9_]*)\(e\.target\.value as any\)\}/g;
    content = content.replace(asAnyPattern, (match, param, funcName) => {
      fixCount++;
      return `onChange={(e) => {
              if (e && e.target && e.target.value) {
                ${funcName}(e.target.value as any)
              }
            }}`;
    });
    
    // Pattern 4: onChange with array/object destructuring
    const complexPattern = /onChange=\{(\(e\)) => ([a-zA-Z_][a-zA-Z0-9_]*)\(\[([^,\]]+),\s*([^)]+)\(e\.target\.value\)\]\)\}/g;
    content = content.replace(complexPattern, (match, param, funcName, firstArg, converter) => {
      fixCount++;
      return `onChange={(e) => {
              if (e && e.target && e.target.value) {
                ${funcName}([${firstArg}, ${converter}(e.target.value)])
              }
            }}`;
    });
    
    // Pattern 5: onChange with method chaining
    const chainingPattern = /onChange=\{(\(e\)) => ([a-zA-Z_][a-zA-Z0-9_]*)\(e\.target\.value\.([a-zA-Z]+)\(\)\)\}/g;
    content = content.replace(chainingPattern, (match, param, funcName, method) => {
      fixCount++;
      return `onChange={(e) => {
              if (e && e.target && e.target.value) {
                ${funcName}(e.target.value.${method}())
              }
            }}`;
    });
    
    // Pattern 6: onChange with optional chaining (e?.target?.value)
    const optionalChainingPattern = /onChange=\{(\(e\)) => ([a-zA-Z_][a-zA-Z0-9_]*)\(e\?\.target\?\.value(?:\s+as\s+any)?\)\}/g;
    content = content.replace(optionalChainingPattern, (match, param, funcName, typeAssertion) => {
      fixCount++;
      const assertion = typeAssertion ? ' as any' : '';
      return `onChange={(e) => {
              if (e && e.target && e.target.value) {
                ${funcName}(e.target.value${assertion})
              }
            }}`;
    });
    
    // Pattern 7: Multi-line onChange handlers (already with checks)
    // Skip these as they already have proper null checks
    
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Fixed ${fixCount} handlers in: ${filePath}`);
      filesFixed++;
      totalFixed += fixCount;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n✨ Fixed ${totalFixed} onChange handlers across ${filesFixed} files!`);