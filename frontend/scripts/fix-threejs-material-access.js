const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all 3D background components
const files = glob.sync('components/backgrounds/**/*.tsx', { cwd: path.join(__dirname, '..') });

let totalFixed = 0;
let filesFixed = 0;

files.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    let fixCount = 0;
    
    // Pattern 1: Fix direct material property assignments
    // Match patterns like: material.emissiveIntensity = ..., material.opacity = ..., etc.
    const materialPattern = /((?:meshRef|lineRef|gridRef|glowRef|coneRef)\.current\.material)\.(\w+)\s*=\s*([^;]+);/g;
    
    content = content.replace(materialPattern, (match, materialAccess, property, value) => {
      // If already wrapped in a check, skip
      if (content.substring(content.lastIndexOf('\n', content.indexOf(match)), content.indexOf(match)).includes('if (')) {
        return match;
      }
      
      fixCount++;
      console.log(`  Found material.${property} assignment in ${filePath}`);
      
      return `if (${materialAccess} && ${materialAccess}.${property} !== undefined) {\n        ${match}\n      }`;
    });
    
    // Pattern 2: Fix material property access in expressions
    const materialAccessPattern = /(\w+Ref\.current)\.material\s+as\s+THREE\.(\w+Material)/g;
    
    let hasUnsafeAccess = false;
    content = content.replace(materialAccessPattern, (match, refAccess, materialType) => {
      // Check if the next few lines have unsafe property access
      const nextLines = content.substring(content.indexOf(match), content.indexOf(match) + 200);
      if (nextLines.match(/material\.\w+\s*=/) && !nextLines.includes('if (material')) {
        hasUnsafeAccess = true;
      }
      return match;
    });
    
    // Pattern 3: Add null checks for material access that are not already protected
    if (hasUnsafeAccess) {
      // Find patterns where we cast to material type and then immediately use it
      const unsafePattern = /(const material = [^;]+as THREE\.\w+Material)\n(\s+)(material\.\w+\s*=\s*[^;]+;)/g;
      
      content = content.replace(unsafePattern, (match, declaration, spacing, assignment) => {
        fixCount++;
        console.log(`  Adding null check for material access in ${filePath}`);
        return `${declaration}\n${spacing}if (material && material.${assignment.match(/\.(\w+)/)[1]} !== undefined) {\n${spacing}  ${assignment}\n${spacing}}`;
      });
    }
    
    // Pattern 4: Fix specific cases where material might be undefined
    // Look for patterns like: someRef.current.material.property without checks
    const directAccessPattern = /(\w+\.current\.material)\.(\w+)\s*=\s*([^;]+)(?!.*if\s*\()/g;
    
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/(\w+\.current\.material)\.(\w+)\s*=\s*([^;]+);/);
      if (match && i > 0 && !lines[i-1].includes('if (')) {
        const [fullMatch, materialAccess, property, value] = match;
        const indent = line.match(/^\s*/)[0];
        
        lines[i] = `${indent}if (${materialAccess} && ${materialAccess}.${property} !== undefined) {\n${indent}  ${line.trim()}\n${indent}}`;
        fixCount++;
        console.log(`  Fixed direct material.${property} access in ${filePath}`);
      }
    }
    
    if (fixCount > 0) {
      content = lines.join('\n');
    }
    
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Fixed ${fixCount} material access issues in: ${filePath}`);
      filesFixed++;
      totalFixed += fixCount;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n✨ Fixed ${totalFixed} Three.js material access issues across ${filesFixed} files!`);