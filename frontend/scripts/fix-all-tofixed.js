const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 수정할 파일 패턴
const patterns = [
  'app/signals/**/*.tsx',
  'components/**/*.tsx',
  'app/**/*.tsx'
];

// 안전한 import 추가
const safeImport = "import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'";

let totalFixed = 0;
let filesModified = 0;

patterns.forEach(pattern => {
  const files = glob.sync(pattern, { cwd: path.join(__dirname, '..') });
  
  files.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // toFixed가 있는지 확인
    if (!content.includes('.toFixed(')) {
      return;
    }
    
    // safeFormat import 추가 (없는 경우)
    if (!content.includes("from '@/lib/safeFormat'") && !content.includes('numberPolyfill')) {
      // 첫 번째 import 찾기
      const firstImportIndex = content.indexOf('import ');
      if (firstImportIndex !== -1) {
        const lineEnd = content.indexOf('\n', firstImportIndex);
        const nextLineStart = lineEnd + 1;
        
        // React import 다음에 추가
        if (content.includes("from 'react'")) {
          const reactImportEnd = content.indexOf('\n', content.indexOf("from 'react'")) + 1;
          content = content.slice(0, reactImportEnd) + safeImport + '\n' + content.slice(reactImportEnd);
          modified = true;
        }
      }
    }
    
    // toFixed 패턴들
    const replacements = [
      // value?.toFixed(n) 또는 value ? value.toFixed(n) : '0'
      {
        pattern: /(\w+(?:\.\w+)*)\s*\?\s*\1\.toFixed\((\d+)\)\s*:\s*['"`]0+(?:\.0+)?['"`]/g,
        replacement: 'safeFixed($1, $2)'
      },
      // (value || 0).toFixed(n)
      {
        pattern: /\((\w+(?:\.\w+)*)\s*\|\|\s*0\)\.toFixed\((\d+)\)/g,
        replacement: 'safeFixed($1, $2)'
      },
      // value.toFixed(n)
      {
        pattern: /(\w+(?:\.\w+)*)\.toFixed\((\d+)\)/g,
        replacement: (match, value, decimals) => {
          // 특별한 경우 처리
          if (value.includes('price') || value === 'currentPrice') {
            return `safePrice(${value}, ${decimals})`;
          } else if (value.includes('amount') || value.includes('quantity')) {
            return `safeAmount(${value})`;
          } else if (value.includes('percent') || value.includes('change')) {
            return `safePercent(${value})`;
          } else if (match.includes('/ 1000000')) {
            return match.replace(/\((.*?)\/\s*1000000\)\.toFixed\((\d+)\)/, 'safeMillion($1, $2)');
          } else if (match.includes('/ 1000')) {
            return match.replace(/\((.*?)\/\s*1000\)\.toFixed\((\d+)\)/, 'safeThousand($1)');
          }
          return `safeFixed(${value}, ${decimals})`;
        }
      }
    ];
    
    // 각 패턴 적용
    replacements.forEach(({ pattern, replacement }) => {
      const matches = content.match(pattern);
      if (matches) {
        totalFixed += matches.length;
        content = content.replace(pattern, replacement);
        modified = true;
      }
    });
    
    // 수정된 경우 파일 저장
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      filesModified++;
      console.log(`✅ ${file} 수정됨`);
    }
  });
});

console.log(`\n📊 총 ${filesModified}개 파일에서 ${totalFixed}개의 toFixed 수정 완료!`);