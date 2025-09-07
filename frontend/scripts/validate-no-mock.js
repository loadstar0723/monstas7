#!/usr/bin/env node

/**
 * MONSTA 프로젝트 규칙 검증 스크립트
 * 가짜 데이터, 하드코딩된 값, 금지 키워드 감지
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 금지된 키워드 목록
const FORBIDDEN_KEYWORDS = [
  'mock', 'dummy', 'fake', 'sample', 'example', 
  'test', 'temp', 'hardcoded', 'fallback', 
  'placeholder', 'stub', '가정', '임시', '예시', 
  '테스트용', '샘플'
];

// 하드코딩된 값 패턴
const HARDCODED_PATTERNS = [
  /\b0\.\d+\b/g,  // 0.1, 0.5 등
  /\b\d+\s*%/g,   // 2%, 10% 등
  /\*\s*0\.\d+/g, // * 0.1, * 0.5 등
  /\/\s*\d+/g,    // / 2, / 10 등 (상수 나누기)
];

// 검증 함수
function validateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const violations = [];
  
  // 금지 키워드 체크
  FORBIDDEN_KEYWORDS.forEach(keyword => {
    const regex = new RegExp(keyword, 'gi');
    const matches = content.match(regex);
    if (matches) {
      violations.push({
        type: 'FORBIDDEN_KEYWORD',
        keyword: keyword,
        count: matches.length,
        file: filePath
      });
    }
  });
  
  // 하드코딩된 값 체크
  HARDCODED_PATTERNS.forEach((pattern, index) => {
    const matches = content.match(pattern);
    if (matches) {
      violations.push({
        type: 'HARDCODED_VALUE',
        pattern: pattern.toString(),
        values: matches.slice(0, 5), // 처음 5개만 표시
        file: filePath
      });
    }
  });
  
  return violations;
}

// 메인 실행
function main() {
  console.log('🔍 MONSTA 프로젝트 규칙 검증 시작...\n');
  
  // TSX 파일 검색
  const files = glob.sync('**/*.tsx', {
    ignore: ['node_modules/**', '.next/**', 'dist/**']
  });
  
  let totalViolations = 0;
  const allViolations = [];
  
  files.forEach(file => {
    const violations = validateFile(file);
    if (violations.length > 0) {
      totalViolations += violations.length;
      allViolations.push(...violations);
    }
  });
  
  // 결과 출력
  if (totalViolations === 0) {
    console.log('✅ 모든 파일이 규칙을 준수합니다!\n');
    process.exit(0);
  } else {
    console.log(`❌ ${totalViolations}개의 규칙 위반을 발견했습니다:\n`);
    
    // 위반 사항 그룹화 및 출력
    allViolations.forEach(violation => {
      if (violation.type === 'FORBIDDEN_KEYWORD') {
        console.log(`  ⚠️  금지 키워드 "${violation.keyword}" (${violation.count}회)`);
        console.log(`     파일: ${violation.file}`);
      } else if (violation.type === 'HARDCODED_VALUE') {
        console.log(`  ⚠️  하드코딩된 값: ${violation.values.join(', ')}`);
        console.log(`     파일: ${violation.file}`);
      }
    });
    
    console.log('\n🚨 규칙 위반을 수정한 후 다시 실행하세요!');
    console.log('💡 모든 값은 API, DB, 또는 설정에서 가져와야 합니다.\n');
    
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { validateFile };