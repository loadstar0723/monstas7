#!/usr/bin/env node

/**
 * 실시간 파일 감시 및 규칙 검증 시스템
 * 파일 저장 시 자동으로 규칙 위반 체크
 */

const chokidar = require('chokidar');
const path = require('path');
const { validateFile } = require('./validate-no-mock');
const chalk = require('chalk');

console.log(chalk.cyan('🔍 MONSTA 실시간 규칙 감시 시작...\n'));
console.log(chalk.yellow('📝 파일 저장 시 자동으로 규칙을 검증합니다.\n'));

// 감시할 파일 패턴
const watcher = chokidar.watch(['**/*.tsx', '**/*.ts'], {
  ignored: ['node_modules/**', '.next/**', 'dist/**'],
  persistent: true
});

// 파일 변경 감지
watcher.on('change', (filePath) => {
  console.log(chalk.blue(`\n📄 파일 변경 감지: ${filePath}`));
  
  const violations = validateFile(filePath);
  
  if (violations.length === 0) {
    console.log(chalk.green('✅ 규칙 준수!'));
  } else {
    console.log(chalk.red(`\n❌ ${violations.length}개 규칙 위반 발견:`));
    
    violations.forEach(violation => {
      if (violation.type === 'FORBIDDEN_KEYWORD') {
        console.log(chalk.red(`  ⚠️  금지 키워드: "${violation.keyword}" (${violation.count}회)`));
      } else if (violation.type === 'HARDCODED_VALUE') {
        console.log(chalk.red(`  ⚠️  하드코딩: ${violation.values.join(', ')}`));
      }
    });
    
    console.log(chalk.yellow('\n💡 수정 제안:'));
    console.log(chalk.yellow('  1. 모든 숫자값은 API나 설정에서 가져오세요'));
    console.log(chalk.yellow('  2. 가짜 데이터 대신 실제 API를 사용하세요'));
    console.log(chalk.yellow('  3. Binance API 또는 DB 연결을 확인하세요\n'));
    
    // 알림음 (선택사항)
    process.stdout.write('\x07');
  }
});

console.log(chalk.green('감시 중... (Ctrl+C로 종료)\n'));

// 프로세스 종료 처리
process.on('SIGINT', () => {
  console.log(chalk.cyan('\n\n👋 감시 종료'));
  process.exit(0);
});