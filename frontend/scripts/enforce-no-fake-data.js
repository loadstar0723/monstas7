#!/usr/bin/env node

/**
 * 🚨 가짜 데이터 금지 규칙 강제 적용 스크립트
 * 이 스크립트는 코드에서 금지된 패턴을 자동으로 감지하고 차단합니다.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 금지된 패턴 정의
const FORBIDDEN_PATTERNS = [
  {
    pattern: /Math\.random\(\)/g,
    message: '❌ Math.random() 사용 금지! 실제 데이터를 사용하세요.',
    severity: 'error'
  },
  {
    pattern: /mock[A-Z]\w*|Mock[A-Z]\w*|MOCK_|mockData|fakeDat|dummyData|sampleData|testData/g,
    message: '❌ Mock/Fake/Dummy 데이터 사용 금지!',
    severity: 'error'
  },
  {
    pattern: /setTimeout\([^,]*simulate/gi,
    message: '❌ 시뮬레이션 함수 사용 금지!',
    severity: 'error'
  },
  {
    pattern: /\*\s*0\.[1-9]|\*\s*0\.0[1-9]/g,
    message: '⚠️ 하드코딩된 계산값 감지. 설정값 사용 권장.',
    severity: 'warning'
  },
  {
    pattern: /price:\s*\d+|amount:\s*\d+|value:\s*\d+/g,
    message: '⚠️ 하드코딩된 숫자값 감지.',
    severity: 'warning'
  },
  {
    pattern: /\/\/\s*(임시|테스트|TODO|FIXME|HACK)/gi,
    message: '⚠️ 임시 코드 주석 감지.',
    severity: 'warning'
  }
];

// 검사 제외 디렉토리
const IGNORE_DIRS = ['.next', 'node_modules', '.git', 'dist', 'build'];

// 파일 검사 함수
function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const violations = [];
  
  FORBIDDEN_PATTERNS.forEach(({ pattern, message, severity }) => {
    const matches = content.match(pattern);
    if (matches) {
      // 각 매치에 대해 라인 번호 찾기
      const lines = content.split('\n');
      matches.forEach(match => {
        lines.forEach((line, index) => {
          if (line.includes(match)) {
            violations.push({
              file: filePath,
              line: index + 1,
              match,
              message,
              severity,
              code: line.trim()
            });
          }
        });
      });
    }
  });
  
  return violations;
}

// 디렉토리 순회 함수
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    
    // 제외 디렉토리 스킵
    if (IGNORE_DIRS.some(ignore => fullPath.includes(ignore))) {
      return;
    }
    
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath, callback);
    } else if (
      fullPath.endsWith('.ts') || 
      fullPath.endsWith('.tsx') || 
      fullPath.endsWith('.js') || 
      fullPath.endsWith('.jsx')
    ) {
      callback(fullPath);
    }
  });
}

// 메인 실행
function main() {
  console.log('🔍 가짜 데이터 검증 시작...\n');
  
  const allViolations = [];
  const startDir = process.argv[2] || '.';
  
  walkDir(startDir, (file) => {
    const violations = checkFile(file);
    if (violations.length > 0) {
      allViolations.push(...violations);
    }
  });
  
  // 결과 출력
  if (allViolations.length === 0) {
    console.log('✅ 규칙 위반 없음! 모든 코드가 깨끗합니다.\n');
    process.exit(0);
  } else {
    console.log(`\n🚨 총 ${allViolations.length}개의 규칙 위반 발견!\n`);
    
    // 심각도별 그룹화
    const errors = allViolations.filter(v => v.severity === 'error');
    const warnings = allViolations.filter(v => v.severity === 'warning');
    
    if (errors.length > 0) {
      console.log('❌ 에러 (반드시 수정 필요):');
      errors.forEach(v => {
        console.log(`  ${v.file}:${v.line}`);
        console.log(`    문제: ${v.message}`);
        console.log(`    코드: ${v.code}`);
        console.log('');
      });
    }
    
    if (warnings.length > 0) {
      console.log('⚠️  경고 (검토 필요):');
      warnings.forEach(v => {
        console.log(`  ${v.file}:${v.line}`);
        console.log(`    문제: ${v.message}`);
        console.log(`    코드: ${v.code}`);
        console.log('');
      });
    }
    
    // 에러가 있으면 종료 코드 1 반환
    if (errors.length > 0) {
      console.log('\n❌ 빌드 중단! 에러를 먼저 수정하세요.');
      process.exit(1);
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { checkFile, FORBIDDEN_PATTERNS };