const fs = require('fs');
const path = require('path');

// 중복 키 문제를 해결하기 위한 스크립트
const fixDuplicateKeys = () => {
  const files = [
    '../app/signals/whale-tracker/WhaleTrackerUltimate.tsx',
    '../app/signals/liquidation/LiquidationUltimate.tsx',
    '../app/signals/insider-flow/InsiderFlowUltimate.tsx',
    '../app/signals/arbitrage/ArbitrageUltimate.tsx',
    '../app/signals/dex-flow/DexFlowUltimate.tsx',
    '../app/signals/fear-greed/FearGreedUltimate.tsx',
    '../app/signals/funding-rate/FundingRateUltimate.tsx',
    '../app/signals/social-sentiment/SocialSentimentUltimate.tsx',
    '../app/signals/unusual-options/UnusualOptionsUltimate.tsx'
  ];

  files.forEach(file => {
    const filePath = path.join(__dirname, file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ 파일이 존재하지 않음: ${file}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    // 1. Date.now()만 사용하는 ID를 더 유니크하게 변경
    // id: Date.now().toString() → id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    content = content.replace(
      /id:\s*Date\.now\(\)\.toString\(\)/g,
      'id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`'
    );

    // 2. 간단한 템플릿 리터럴 ID를 더 유니크하게
    // id: `${symbol}-${data.a || Date.now()}` → id: `${symbol}-${Date.now()}-${idx}-${data.a}`
    content = content.replace(
      /id:\s*`\$\{([^}]+)\}-\$\{([^}]+)\s*\|\|\s*Date\.now\(\)\}`,?/g,
      (match, var1, var2) => {
        return `id: \`\${${var1}}-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}-\${${var2}}\`,`;
      }
    );

    // 3. 배열 map 함수 내에서 인덱스 추가
    // .map((item) => ({ → .map((item, idx) => ({
    content = content.replace(
      /\.map\(\((\w+)\)\s*=>\s*\(\{/g,
      '.map(($1, idx) => ({'
    );

    // 4. 이미 idx가 있는 경우 활용
    content = content.replace(
      /id:\s*`([^`]*)\$\{Date\.now\(\)\}([^`]*)`,?/g,
      'id: `$1${Date.now()}-${idx || 0}-${Math.random().toString(36).substr(2, 9)}$2`,'
    );

    // 5. hist- 접두사가 있는 ID 개선
    content = content.replace(
      /id:\s*`hist-\$\{([^}]+)\}`,?/g,
      'id: `hist-${$1}-${idx || 0}-${Date.now()}`,',
    );

    // 6. rt- 접두사가 있는 ID 개선 (실시간 데이터)
    content = content.replace(
      /id:\s*`rt-\$\{([^}]+)\}`,?/g,
      'id: `rt-${$1}-${Math.random().toString(36).substr(2, 9)}`,',
    );

    // 7. 고유 ID 생성 헬퍼 함수 추가 (파일 상단에)
    if (!content.includes('generateUniqueId')) {
      const helperFunction = `
// 고유 ID 생성 함수
const generateUniqueId = (prefix: string = '', suffix: string = '') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return \`\${prefix}-\${timestamp}-\${random}\${suffix ? '-' + suffix : ''}\`;
}

`;
      // 첫 번째 함수 선언 전에 추가
      const firstFunctionIndex = content.indexOf('export default function');
      if (firstFunctionIndex !== -1) {
        content = content.slice(0, firstFunctionIndex) + helperFunction + content.slice(firstFunctionIndex);
        modified = true;
      }
    }

    // 파일 저장
    if (content !== fs.readFileSync(filePath, 'utf-8')) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ ${file} - 중복 키 문제 수정 완료`);
    } else {
      console.log(`ℹ️ ${file} - 수정 사항 없음`);
    }
  });
};

// 실행
console.log('🔧 시그널 페이지 중복 키 문제 수정 시작...');
fixDuplicateKeys();
console.log('✨ 모든 시그널 페이지 수정 완료!');