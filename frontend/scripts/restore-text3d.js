const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Components that need Text3D restoration
const componentsToRestore = [
  'TimeSeriesFlow3D.tsx',
  'ParticleBackground3D.tsx', 
  'GatedCircuitBackground3D.tsx',
  'BrightMagicForestBackground3D.tsx'
];

componentsToRestore.forEach(filename => {
  const filePath = path.join(__dirname, '..', 'components', 'backgrounds', filename);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace Text import back to Text3D
    content = content.replace(/\bText\b(?!3D)/g, 'Text3D');
    
    // Find all Text3D components and update their props
    content = content.replace(
      /<Text3D([^>]*?)>/g,
      (match, props) => {
        // If it doesn't have font prop, add it
        if (!props.includes('font=')) {
          return `<Text3D font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"${props}>`;
        }
        return match;
      }
    );
    
    // Add missing 3D text properties if they were removed
    content = content.replace(
      /<Text3D([^>]*?)fontSize=/g,
      '<Text3D$1size='
    );
    
    // Add default 3D properties
    content = content.replace(
      /<Text3D\s+font="[^"]+"\s*>/g,
      `<Text3D
            font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"
            size={1.2}
            height={0.2}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.02}
            bevelSize={0.02}
            bevelOffset={0}
            bevelSegments={5}
          >`
    );
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Restored Text3D in: ${filename}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error.message);
  }
});

console.log('\n✨ Text3D restoration complete!');