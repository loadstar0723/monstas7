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
    
    // Replace Text3D import with Text
    if (content.includes('Text3D')) {
      content = content.replace(/\bText3D\b/g, 'Text');
      fixCount++;
      
      // Replace Text3D props with Text props
      content = content.replace(/font="[^"]+\.typeface\.json"/g, '');
      content = content.replace(/\bsize=/g, 'fontSize=');
      content = content.replace(/height="\d+\.?\d*"/g, '');
      content = content.replace(/curveSegments=\d+/g, '');
      content = content.replace(/bevelEnabled/g, '');
      content = content.replace(/bevelThickness="\d+\.?\d*"/g, '');
      content = content.replace(/bevelSize="\d+\.?\d*"/g, '');
      content = content.replace(/bevelOffset=\d+/g, '');
      content = content.replace(/bevelSegments=\d+/g, '');
      
      // Add Text specific props if not present
      if (!content.includes('anchorX=') && content.includes('<Text')) {
        content = content.replace(/<Text(\s)/g, '<Text anchorX="center" anchorY="middle"$1');
      }
    }
    
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Fixed Text3D to Text in: ${filePath}`);
      filesFixed++;
      totalFixed += fixCount;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n✨ Fixed ${totalFixed} Text3D references across ${filesFixed} files!`);