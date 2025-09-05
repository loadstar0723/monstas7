#!/usr/bin/env node

/**
 * 🚨 가짜 데이터 자동 감지 시스템
 * 실전 배포 전 mock data, 테스트 데이터, 하드코딩된 값들을 자동으로 감지
 */

const fs = require('fs');
const path = require('path');

// 🔴 절대 금지 패턴들
const FORBIDDEN_PATTERNS = [
  // Mock/Fake 데이터 패턴
  { pattern: /mock[A-Z]\w*|mockData|fakeData|dummyData|testData|sampleData/gi, 
    message: '❌ Mock/Fake 데이터 발견! 실제 데이터 사용 필요' },
  
  // 하드코딩된 테스트 값들
  { pattern: /test@test\.com|admin@admin\.com|user@example\.com|test123|password123/gi, 
    message: '❌ 하드코딩된 테스트 계정 발견!' },
  
  // Placeholder 텍스트
  { pattern: /lorem ipsum|placeholder|coming soon|준비\s?중|개발\s?중|구현\s?예정/gi, 
    message: '❌ Placeholder 텍스트 발견! 실제 콘텐츠 필요' },
  
  // 가짜 API URL
  { pattern: /jsonplaceholder|mockapi|fakestoreapi|dummyjson/gi, 
    message: '❌ 가짜 API URL 발견! 실제 API 엔드포인트 사용' },
  
  // TODO/FIXME 주석
  { pattern: /\/\/\s*(TODO|FIXME|HACK|XXX|TEMPORARY|임시)/gi, 
    message: '⚠️ 미완성 코드 주석 발견! 구현 완료 필요' },
  
  // Console.log (프로덕션에서 제거 필요)
  { pattern: /console\.(log|debug|info|warn)/g, 
    message: '⚠️ Console.log 발견! 프로덕션에서 제거 필요' },
  
  // 하드코딩된 숫자 배열 (가짜 차트 데이터)
  { pattern: /\[\s*\d+,\s*\d+,\s*\d+,\s*\d+,\s*\d+.*\]/g, 
    message: '⚠️ 하드코딩된 데이터 배열 발견! API에서 가져와야 함' },
  
  // 가짜 금액/가격
  { pattern: /price:\s*['"`]\$?\d+['"`]|amount:\s*\d{3,}/g, 
    message: '⚠️ 하드코딩된 가격 발견! 실시간 데이터 사용' },
  
  // setTimeout/setInterval로 가짜 데이터 시뮬레이션
  { pattern: /setTimeout.*Math\.random|setInterval.*Math\.random/g, 
    message: '❌ 가짜 실시간 데이터 시뮬레이션 발견!' },
  
  // 빈 함수 구현
  { pattern: /throw new Error\(['"`]Not implemented['"`]\)|return null.*\/\/.*TODO/gi, 
    message: '❌ 미구현 함수 발견! 실제 로직 구현 필요' }
];

// 🟡 경고 패턴들 (심각도 낮음)
const WARNING_PATTERNS = [
  { pattern: /localhost|127\.0\.0\.1/g, 
    message: '⚠️ Localhost URL 발견. 프로덕션 URL 확인 필요' },
  
  { pattern: /test|demo|example/gi, 
    message: '⚠️ 테스트 관련 키워드 발견' }
];

// 검사 제외 파일/폴더
const EXCLUDE_PATHS = [
  'node_modules',
  '.next',
  '.git',
  'coverage',
  'dist',
  'build',
  '__tests__',
  '*.test.ts',
  '*.test.tsx',
  '*.spec.ts',
  '*.spec.tsx',
  'scripts/detect-mock-data.js' // 자기 자신 제외
];

let totalErrors = 0;
let totalWarnings = 0;
const foundIssues = [];

// 파일이 검사 대상인지 확인
function shouldCheckFile(filePath) {
  const ext = path.extname(filePath);
  const validExtensions = ['.js', '.jsx', '.ts', '.tsx'];
  
  if (!validExtensions.includes(ext)) return false;
  
  for (const exclude of EXCLUDE_PATHS) {
    if (filePath.includes(exclude)) return false;
  }
  
  return true;
}

// 파일 검사
function checkFile(filePath) {
  if (!shouldCheckFile(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // 금지 패턴 검사
  FORBIDDEN_PATTERNS.forEach(({ pattern, message }) => {
    lines.forEach((line, index) => {
      if (pattern.test(line)) {
        totalErrors++;
        foundIssues.push({
          type: 'ERROR',
          file: filePath,
          line: index + 1,
          message,
          code: line.trim().substring(0, 100)
        });
      }
    });
  });
  
  // 경고 패턴 검사
  WARNING_PATTERNS.forEach(({ pattern, message }) => {
    lines.forEach((line, index) => {
      if (pattern.test(line)) {
        totalWarnings++;
        foundIssues.push({
          type: 'WARNING',
          file: filePath,
          line: index + 1,
          message,
          code: line.trim().substring(0, 100)
        });
      }
    });
  });
}

// 디렉토리 재귀 탐색
function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!EXCLUDE_PATHS.includes(file)) {
        walkDirectory(filePath);
      }
    } else {
      checkFile(filePath);
    }
  });
}

// 메인 실행
console.log('🔍 가짜 데이터 감지 시스템 시작...\n');

const startPath = process.argv[2] || './app';
if (!fs.existsSync(startPath)) {
  console.error(`❌ 경로를 찾을 수 없습니다: ${startPath}`);
  process.exit(1);
}

walkDirectory(startPath);

// 결과 출력
console.log('\n' + '='.repeat(80));
console.log('📊 검사 결과');
console.log('='.repeat(80));

if (foundIssues.length > 0) {
  foundIssues.forEach(issue => {
    const icon = issue.type === 'ERROR' ? '🔴' : '🟡';
    console.log(`\n${icon} ${issue.type}: ${issue.message}`);
    console.log(`   파일: ${issue.file}:${issue.line}`);
    console.log(`   코드: ${issue.code}`);
  });
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n📈 총계: ${totalErrors}개 에러, ${totalWarnings}개 경고\n`);
  
  if (totalErrors > 0) {
    console.error('❌ 가짜 데이터가 발견되었습니다! 배포를 중단합니다.');
    console.error('💡 해결 방법:');
    console.error('   1. 모든 mock/fake 데이터를 실제 API 호출로 교체');
    console.error('   2. 하드코딩된 값을 환경 변수나 설정 파일로 이동');
    console.error('   3. TODO 주석이 있는 미완성 코드 완성');
    console.error('   4. console.log 제거 또는 프로덕션 로거로 교체\n');
    process.exit(1);
  }
  
  if (totalWarnings > 0) {
    console.log('⚠️ 경고가 발견되었습니다. 검토가 필요합니다.');
  }
} else {
  console.log('✅ 가짜 데이터가 발견되지 않았습니다!');
  console.log('🎉 프로덕션 배포 준비 완료!\n');
}

process.exit(totalErrors > 0 ? 1 : 0);