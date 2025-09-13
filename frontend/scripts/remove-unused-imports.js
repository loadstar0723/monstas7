const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 사용되지 않는 import를 감지하고 제거하는 함수
function removeUnusedImports(content, filePath) {
  const lines = content.split('\n');
  const importRegex = /^import\s+(?:{([^}]+)}|([^,\s]+)(?:\s*,\s*{([^}]+)})?)\s+from\s+['"]([^'"]+)['"]/;
  const usedImports = new Set();
  const importLines = [];
  
  // 모든 import 라인 찾기
  lines.forEach((line, index) => {
    const match = line.match(importRegex);
    if (match) {
      importLines.push({ line, index, match });
    }
  });
  
  // 코드에서 실제 사용되는 import 찾기
  const codeContent = lines.filter((_, index) => {
    return !importLines.some(imp => imp.index === index);
  }).join('\n');
  
  // 각 import가 사용되는지 확인
  const cleanedLines = [...lines];
  let removed = 0;
  
  importLines.forEach(({ line, index, match }) => {
    const namedImports = match[1] || match[3] || '';
    const defaultImport = match[2] || '';
    const modulePath = match[4];
    
    // React, useState 등 필수 import는 보존
    const essentialImports = [
      'react', 'react-dom', 'next/dynamic', 'next/link', 'next/router',
      'next/image', 'next/head', '@/lib/safeFormat', 'react-error-boundary'
    ];
    
    if (essentialImports.some(essential => modulePath.includes(essential))) {
      return;
    }
    
    // named imports 체크
    if (namedImports) {
      const imports = namedImports.split(',').map(s => s.trim());
      const usedList = [];
      const unusedList = [];
      
      imports.forEach(imp => {
        const importName = imp.split(/\s+as\s+/)[0].trim();
        const aliasName = imp.includes(' as ') ? imp.split(/\s+as\s+/)[1].trim() : importName;
        
        // 코드에서 사용 여부 체크
        const isUsed = new RegExp(`\\b${aliasName}\\b`).test(codeContent);
        if (isUsed) {
          usedList.push(imp);
        } else {
          unusedList.push(imp);
        }
      });
      
      // 일부만 사용되는 경우 import 수정
      if (usedList.length > 0 && unusedList.length > 0) {
        const newImport = defaultImport 
          ? `import ${defaultImport}, { ${usedList.join(', ')} } from '${modulePath}'`
          : `import { ${usedList.join(', ')} } from '${modulePath}'`;
        cleanedLines[index - removed] = newImport;
      } else if (usedList.length === 0 && !defaultImport) {
        // 전혀 사용되지 않는 import 제거
        cleanedLines.splice(index - removed, 1);
        removed++;
      }
    }
    
    // default import 체크
    if (defaultImport && !namedImports) {
      const isUsed = new RegExp(`\\b${defaultImport}\\b`).test(codeContent);
      if (!isUsed) {
        cleanedLines.splice(index - removed, 1);
        removed++;
      }
    }
  });
  
  return { content: cleanedLines.join('\n'), removed };
}

// 파일 처리 함수
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { content: cleaned, removed } = removeUnusedImports(content, filePath);
    
    if (removed > 0) {
      fs.writeFileSync(filePath, cleaned, 'utf8');
      return removed;
    }
    return 0;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return 0;
  }
}

// 메인 실행
async function main() {
  const patterns = [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'utils/**/*.{ts,tsx}'
  ];
  
  let totalFiles = 0;
  let totalRemoved = 0;
  
  for (const pattern of patterns) {
    const files = glob.sync(pattern, {
      ignore: ['**/node_modules/**', '**/.next/**'],
      cwd: path.join(__dirname, '..')
    });
    
    for (const file of files) {
      const fullPath = path.join(__dirname, '..', file);
      totalFiles++;
      
      const removed = processFile(fullPath);
      if (removed > 0) {
        totalRemoved += removed;
        console.log(`✓ Cleaned ${removed} unused imports from: ${file}`);
      }
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`- Total files checked: ${totalFiles}`);
  console.log(`- Total unused imports removed: ${totalRemoved}`);
  console.log(`- Unused imports cleaned successfully!`);
}

main().catch(console.error);