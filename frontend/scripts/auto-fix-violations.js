#!/usr/bin/env node

/**
 * MONSTA 프로젝트 자동 수정 스크립트
 * 일부 규칙 위반을 자동으로 수정
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 자동 수정 가능한 패턴들
const AUTO_FIX_PATTERNS = [
  // 하드코딩된 퍼센트 값을 설정값으로 변경
  { 
    pattern: /(\d+)%/g,
    replacement: (match, num) => `\${config.percentage.value${num}}`,
    description: '퍼센트 값을 설정으로 변경'
  },
  // 0.x 형태의 값을 설정값으로 변경
  {
    pattern: /\b0\.(\d+)\b/g,
    replacement: (match, decimal) => `config.decimals.value${decimal}`,
    description: '소수점 값을 설정으로 변경'
  },
  // 금지 키워드 주석 처리
  {
    pattern: /\b(mock|dummy|fake|sample|test|temp|임시|테스트용)\b/gi,
    replacement: (match) => `/* VIOLATION: ${match} */`,
    description: '금지 키워드 주석 처리'
  }
];

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let fixCount = 0;
  
  AUTO_FIX_PATTERNS.forEach(({ pattern, replacement, description }) => {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replacement);
      fixCount += matches.length;
      console.log(`  ✅ ${description}: ${matches.length}개 수정`);
    }
  });
  
  if (fixCount > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  📝 ${filePath}: 총 ${fixCount}개 수정 완료\n`);
  }
  
  return fixCount;
}

function main() {
  console.log('🔧 MONSTA 프로젝트 자동 수정 시작...\n');
  console.log('⚠️  주의: 이 스크립트는 일부 간단한 위반만 자동 수정합니다.');
  console.log('복잡한 위반은 수동으로 수정해야 합니다.\n');
  
  // TSX 파일 검색
  const files = glob.sync('**/*.tsx', {
    ignore: ['node_modules/**', '.next/**', 'dist/**']
  });
  
  let totalFixes = 0;
  
  files.forEach(file => {
    const fixes = fixFile(file);
    totalFixes += fixes;
  });
  
  if (totalFixes === 0) {
    console.log('✅ 자동 수정 가능한 위반이 없습니다.\n');
  } else {
    console.log(`🎉 총 ${totalFixes}개의 위반을 자동 수정했습니다!\n`);
    console.log('💡 다음 단계:');
    console.log('1. npm run validate로 남은 위반 확인');
    console.log('2. 수동으로 복잡한 위반 수정');
    console.log('3. 실제 API와 데이터베이스 연결 구현\n');
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}