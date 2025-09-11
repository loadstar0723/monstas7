const fs = require('fs');
const path = require('path');

// WhaleTrackerUltimate.tsx 파일 수정
const filePath = path.join(__dirname, '../app/signals/whale-tracker/WhaleTrackerUltimate.tsx');

let content = fs.readFileSync(filePath, 'utf8');

// safeFormat 함수들 import 추가 (이미 있을 수 있으므로 확인)
if (!content.includes("import { safeFixed")) {
  // formatters import 라인 찾기
  const importIndex = content.indexOf("import { formatPrice, formatPercentage, formatVolume, safeToFixed } from '@/lib/formatters'");
  if (importIndex !== -1) {
    const nextLineIndex = content.indexOf('\n', importIndex) + 1;
    content = content.slice(0, nextLineIndex) + 
      "import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'\n" +
      content.slice(nextLineIndex);
  }
}

// toFixed 호출들을 안전한 함수로 교체
const replacements = [
  // 금액 (4자리)
  { pattern: /(\w+(?:\.amount)?)\s*\?\s*\1\.toFixed\(4\)\s*:\s*'0\.0000'/g, replacement: 'safeAmount($1)' },
  { pattern: /(\w+(?:\.amount)?)\s*\.toFixed\(4\)/g, replacement: 'safeAmount($1)' },
  
  // 가격 (2자리)
  { pattern: /(\w+(?:\.price)?)\s*\?\s*\1\.toFixed\(2\)\s*:\s*'0\.00'/g, replacement: 'safePrice($1)' },
  { pattern: /(\w+(?:\.price)?)\s*\.toFixed\(2\)/g, replacement: 'safePrice($1)' },
  { pattern: /currentPrice\.toFixed\(2\)/g, replacement: 'safePrice(currentPrice)' },
  
  // 백만 단위
  { pattern: /\(\((.*?)\s*\/\s*1000000\)\.toFixed\((\d+)\)\)/g, replacement: 'safeMillion($1, $2)' },
  { pattern: /\((.*?)\s*\/\s*1000000\)\.toFixed\((\d+)\)/g, replacement: 'safeMillion($1, $2)' },
  
  // 천 단위
  { pattern: /\(\((.*?)\s*\/\s*1000\)\.toFixed\((\d+)\)\)/g, replacement: 'safeThousand($1)' },
  { pattern: /\((.*?)\s*\/\s*1000\)\.toFixed\((\d+)\)/g, replacement: 'safeThousand($1)' },
  
  // 퍼센트 (1자리)
  { pattern: /(\w+(?:\.change24h)?)\s*\.toFixed\(1\)/g, replacement: 'safePercent($1)' },
  
  // 일반적인 toFixed
  { pattern: /(\w+(?:\.\w+)?)\s*\.toFixed\((\d+)\)/g, replacement: 'safeFixed($1, $2)' },
];

// 각 패턴 적용
replacements.forEach(({ pattern, replacement }) => {
  const before = content.match(pattern)?.length || 0;
  content = content.replace(pattern, replacement);
  const after = content.match(pattern)?.length || 0;
  if (before > 0) {
    console.log(`Replaced ${before} occurrences of pattern: ${pattern.toString()}`);
  }
});

// 파일 저장
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ WhaleTrackerUltimate.tsx 수정 완료!');