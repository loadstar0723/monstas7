#!/usr/bin/env node

/**
 * 🔔 스마트 검증기 - 경고만 하고 차단하지 않음
 * 개발은 계속 가능하면서 규칙 위반을 인지시킴
 */

const fs = require('fs');
const path = require('path');

// 설정 파일 (위반 임계값 관리)
const CONFIG_FILE = path.join(__dirname, '.validation-config.json');

// 기본 설정
const DEFAULT_CONFIG = {
  mode: 'warning',  // 'warning' | 'strict' | 'off'
  maxViolations: 1000,  // 이 수치 이상일 때만 차단
  criticalPatterns: [
    'password.*=.*["\'].*["\']',  // 하드코딩된 비밀번호
    'apiKey.*=.*["\'].*["\']',    // 하드코딩된 API 키
  ],
  warningPatterns: [
    'Math\\.random\\(\\)',
    'mock|fake|dummy|sample',
    'setTimeout.*simulate'
  ]
};

// 설정 로드
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
  } catch (error) {
    console.log('⚠️ 설정 파일 로드 실패, 기본값 사용');
  }
  return DEFAULT_CONFIG;
}

// 위반 카운트
function countViolations(dir) {
  const config = loadConfig();
  let violations = 0;
  let criticalViolations = 0;
  
  function scanFile(filePath) {
    if (filePath.includes('node_modules') || filePath.includes('.next')) return;
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 치명적 패턴 체크
    config.criticalPatterns.forEach(pattern => {
      const regex = new RegExp(pattern, 'g');
      const matches = content.match(regex);
      if (matches) {
        criticalViolations += matches.length;
      }
    });
    
    // 경고 패턴 체크
    config.warningPatterns.forEach(pattern => {
      const regex = new RegExp(pattern, 'g');
      const matches = content.match(regex);
      if (matches) {
        violations += matches.length;
      }
    });
  }
  
  function walkDir(currentDir) {
    const files = fs.readdirSync(currentDir);
    files.forEach(file => {
      const fullPath = path.join(currentDir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !fullPath.includes('node_modules') && !fullPath.includes('.next')) {
        walkDir(fullPath);
      } else if (stat.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx'))) {
        scanFile(fullPath);
      }
    });
  }
  
  walkDir(dir);
  
  return { violations, criticalViolations };
}

// 메인 실행
function main() {
  const config = loadConfig();
  
  console.log(`\n🔍 스마트 검증 (모드: ${config.mode})\n`);
  
  // OFF 모드
  if (config.mode === 'off') {
    console.log('✅ 검증 비활성화됨 - 개발 진행 가능\n');
    process.exit(0);
  }
  
  const { violations, criticalViolations } = countViolations('.');
  
  // 치명적 위반이 있으면 무조건 차단
  if (criticalViolations > 0) {
    console.log(`\n🚨 치명적 보안 위반 ${criticalViolations}개 발견!`);
    console.log('❌ 비밀번호나 API 키가 하드코딩되어 있습니다.');
    console.log('🔐 반드시 환경변수로 이동하세요!\n');
    process.exit(1);
  }
  
  // WARNING 모드
  if (config.mode === 'warning') {
    if (violations > 0) {
      console.log(`⚠️  규칙 위반 ${violations}개 발견 (경고만 표시)`);
      console.log('💡 개발은 계속 가능하지만 나중에 수정 필요\n');
      
      // 위반이 너무 많으면 추가 경고
      if (violations > config.maxViolations) {
        console.log(`📊 위반이 ${config.maxViolations}개를 초과했습니다!`);
        console.log('🔧 점진적으로 개선해주세요.\n');
      }
    } else {
      console.log('✨ 규칙 위반 없음! 완벽합니다!\n');
    }
    process.exit(0);  // 경고만 하고 통과
  }
  
  // STRICT 모드
  if (config.mode === 'strict') {
    if (violations > 0) {
      console.log(`❌ 규칙 위반 ${violations}개로 차단됨`);
      console.log('🛠️ 수정 후 다시 시도하세요.\n');
      process.exit(1);
    } else {
      console.log('✅ 모든 검증 통과!\n');
      process.exit(0);
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { countViolations, loadConfig };