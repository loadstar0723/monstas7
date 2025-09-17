const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing encoding issues in news files...');

// Common encoding replacements
const replacements = [
  // Korean text replacements
  { from: /\?�체/g, to: '전체' },
  { from: /\?�장/g, to: '시장' },
  { from: /\?�셜/g, to: '소셜' },
  { from: /\?�이/g, to: '데이' },
  { from: /\?�시\?�이/g, to: '해시레이' },
  { from: /\?��/g, to: '��' }, // Generic emoji replacement
  { from: /\?\ufffd/g, to: '' }, // Remove corrupted chars
  { from: /ATH \?��\?/g, to: 'ATH 대비' },
  { from: /\?�스/g, to: '뉴스' },
  // Add missing closing quotes
  { from: /'\?\?}/g, to: "'}" },
  { from: /"\?\?}/g, to: '"}"' },
];

// Files to fix
const newsDir = path.join(__dirname, '../app/news');

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    replacements.forEach(({ from, to }) => {
      if (from.test(content)) {
        content = content.replace(from, to);
        modified = true;
      }
    });

    // Fix unterminated strings (basic fix)
    content = content.replace(/(['"])([^'"]*)\?{2,}}/g, '$1$2$1}');

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

// Fix all news page files
if (fs.existsSync(newsDir)) {
  const subdirs = fs.readdirSync(newsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  subdirs.forEach(subdir => {
    const pageFile = path.join(newsDir, subdir, 'page.tsx');
    if (fs.existsSync(pageFile)) {
      fixFile(pageFile);
    }
  });
}

console.log('✨ Encoding fix completed!');
console.log('💡 Note: Some manual fixes may still be required for complex cases.');