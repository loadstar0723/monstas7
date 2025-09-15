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
    
    // Pattern 1: Fix object!.property patterns
    // Match patterns like: something!.value, avg!.accuracy, etc.
    const nonNullPattern = /([a-zA-Z_][a-zA-Z0-9_]*)\!\.(value|accuracy|loss|std|score|data|params|result)/g;
    
    content = content.replace(nonNullPattern, (match, variable, property) => {
      fixCount++;
      console.log(`  Found: ${match} in ${filePath}`);
      return `${variable}?.${property}`;
    });
    
    // Pattern 2: Fix find()!.value patterns - more complex
    const findPattern = /(\w+)\.find\(([^)]+)\)\!\.(value|accuracy|loss|data)/g;
    
    content = content.replace(findPattern, (match, collection, predicate, property) => {
      fixCount++;
      console.log(`  Found find pattern: ${match} in ${filePath}`);
      // Create a safe variable name
      const varName = `${collection}Found`;
      const safeName = varName.replace(/[^a-zA-Z0-9]/g, '');
      
      // This is tricky - we need to return the safe access
      // For now, just convert to optional chaining
      return `${collection}.find(${predicate})?.${property}`;
    });
    
    // Pattern 3: Fix array access with non-null assertion
    const arrayPattern = /([a-zA-Z_][a-zA-Z0-9_]*)\[(\d+)\]\!\.(value|accuracy|loss|data)/g;
    
    content = content.replace(arrayPattern, (match, array, index, property) => {
      fixCount++;
      console.log(`  Found array pattern: ${match} in ${filePath}`);
      return `${array}[${index}]?.${property}`;
    });
    
    if (content !== originalContent) {
      // Additional safety: ensure we didn't break any code
      // Check for common patterns that might indicate broken code
      if (content.includes('??..') || content.includes('??.?')) {
        console.error(`⚠️  Warning: Potential issue in ${filePath} - skipping`);
        return;
      }
      
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Fixed ${fixCount} non-null assertions in: ${filePath}`);
      filesFixed++;
      totalFixed += fixCount;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n✨ Fixed ${totalFixed} non-null assertions across ${filesFixed} files!`);

// Now let's also create a separate script to fix specific problematic patterns
console.log('\nLooking for specific problematic patterns...');

// Check for bestPerformance! patterns
files.forEach(filePath => {
  if (!filePath.includes('ai/')) return;
  
  const fullPath = path.join(__dirname, '..', filePath);
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Check for specific patterns that might cause issues
    if (content.includes('bestPerformance!')) {
      console.log(`⚠️  Found bestPerformance! in ${filePath}`);
      
      // Replace bestPerformance! with safe access
      content = content.replace(/bestPerformance!/g, 'bestPerformance');
      content = content.replace(/bestPerformance\.(\w+)/g, 'bestPerformance?.$1');
      
      fs.writeFileSync(fullPath, content);
      console.log(`  ✅ Fixed bestPerformance patterns`);
    }
    
    if (content.includes('avg!')) {
      console.log(`⚠️  Found avg! in ${filePath}`);
      
      // Replace avg! with safe access
      content = content.replace(/avg!/g, 'avg');
      content = content.replace(/avg\.(\w+)/g, 'avg?.$1');
      
      fs.writeFileSync(fullPath, content);
      console.log(`  ✅ Fixed avg patterns`);
    }
  } catch (error) {
    // Silent error
  }
});