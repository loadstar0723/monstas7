const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all background components
const files = glob.sync('components/backgrounds/**/*.tsx', { cwd: path.join(__dirname, '..') });

let totalFixed = 0;
let filesFixed = 0;

files.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    let fixCount = 0;
    
    // Fix Math.random() * scale patterns that might produce NaN
    content = content.replace(
      /Math\.random\(\)\s*\*\s*(\w+)/g,
      (match, variable) => {
        if (!match.includes('isNaN')) {
          fixCount++;
          return `(isNaN(${variable}) ? 1 : ${variable}) * Math.random()`;
        }
        return match;
      }
    );
    
    // Fix positions array updates that might introduce NaN
    content = content.replace(
      /positions\[i3 \+ (\d)\]\s*=\s*([^;]+);/g,
      (match, index, expression) => {
        if (!expression.includes('isNaN') && expression.includes('Math.')) {
          fixCount++;
          return `const val${index} = ${expression};\n        positions[i3 + ${index}] = isNaN(val${index}) ? positions[i3 + ${index}] : val${index};`;
        }
        return match;
      }
    );
    
    // Fix position array access that might be undefined
    content = content.replace(
      /geometry\.attributes\.position\.array as Float32Array/g,
      (match) => {
        if (!content.includes('geometry?.attributes?.position?.array')) {
          fixCount++;
          return 'geometry?.attributes?.position?.array as Float32Array';
        }
        return match;
      }
    );
    
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Fixed ${fixCount} potential NaN issues in: ${filePath}`);
      filesFixed++;
      totalFixed += fixCount;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n✨ Fixed ${totalFixed} potential NaN issues across ${filesFixed} files!`);