/**
 * 긴급 toFixed 에러 수정 스크립트
 * 모든 소스 코드에서 안전하지 않은 toFixed 호출을 찾아 수정
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 안전한 toFixed 함수
const safeToFixedCode = `
// 안전한 toFixed 헬퍼 함수
const safeToFixed = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  return Number(value).toFixed(decimals);
};
`;

// toFixed 사용 패턴 찾기
const toFixedPattern = /(\w+)\.toFixed\(/g;
const priceToFixedPattern = /price\.toFixed\(/g;
const volumeToFixedPattern = /volume\.toFixed\(/g;
const changeToFixedPattern = /change\.toFixed\(/g;

// 파일 처리
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // toFixed 사용 찾기
  const matches = content.match(toFixedPattern);
  if (!matches || matches.length === 0) {
    return false;
  }
  
  console.log(`\n📄 ${filePath}에서 ${matches.length}개의 toFixed 발견`);
  
  // 각 패턴 대체
  content = content.replace(/(\w+)\.toFixed\(/g, (match, varName) => {
    // 이미 Number()로 감싸진 경우는 건너뛰기
    if (content.includes(`Number(${varName}).toFixed(`)) {
      return match;
    }
    
    // 삼항 연산자로 안전하게 변경
    modified = true;
    return `(${varName} != null && !isNaN(${varName}) ? Number(${varName}).toFixed(`;
  });
  
  // toFixed 호출 닫기 괄호 수정
  if (modified) {
    content = content.replace(/\.toFixed\((\d+)\)/g, (match, decimals) => {
      return `.toFixed(${decimals}) : '0')`;
    });
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${filePath} 수정 완료`);
    return true;
  }
  
  return false;
}

// 모든 TypeScript/JavaScript 파일 찾기
console.log('🔍 toFixed 에러 긴급 수정 시작...\n');

const files = glob.sync('frontend/**/*.{ts,tsx,js,jsx}', {
  ignore: [
    '**/node_modules/**',
    '**/build/**',
    '**/.next/**',
    '**/dist/**',
    '**/numberPolyfill.ts',
    '**/safeNumber.ts',
    '**/formatters.ts'
  ]
});

console.log(`📊 총 ${files.length}개 파일 검사 중...\n`);

let modifiedCount = 0;
files.forEach(file => {
  if (processFile(file)) {
    modifiedCount++;
  }
});

console.log(`\n✅ 완료! ${modifiedCount}개 파일 수정됨`);

// package.json에 스크립트 추가 제안
console.log('\n💡 package.json에 다음 스크립트를 추가하세요:');
console.log('"scripts": {');
console.log('  "fix:tofixed": "node scripts/emergency-fix.js"');
console.log('}');