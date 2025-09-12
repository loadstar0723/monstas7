const fs = require('fs');
const path = require('path');

// InsiderFlowUltimate.tsx 파일 수정
function fixInsiderFlow() {
  const filePath = path.join(__dirname, '../app/signals/insider-flow/InsiderFlowUltimate.tsx');
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // 닫는 태그 구조 수정
  const lines = content.split('\n');
  let braceCount = 0;
  let parenCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    braceCount += (lines[i].match(/\{/g) || []).length;
    braceCount -= (lines[i].match(/\}/g) || []).length;
    parenCount += (lines[i].match(/\(/g) || []).length;
    parenCount -= (lines[i].match(/\)/g) || []).length;
  }
  
  // 마지막 부분 재구성
  if (lines[540] && lines[540].includes('</div>')) {
    // Fragment 구조 확인
    const lastLines = lines.slice(-10).join('\n');
    if (!lastLines.includes('</>') && lastLines.includes('</div>')) {
      // 올바른 Fragment 닫기 추가
      content = content.replace(/(\s*<\/div>\s*\)\s*\}\s*)$/, '</>\n    </div>\n  )\n}');
    }
  }
  
  fs.writeFileSync(filePath, content);
  console.log('✅ InsiderFlowUltimate.tsx 수정 완료');
}

// LiquidationUltimate.tsx 파일 수정
function fixLiquidation() {
  const filePath = path.join(__dirname, '../app/signals/liquidation/LiquidationUltimate.tsx');
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // useEffect 구조 확인 및 수정
  const useEffectPattern = /useEffect\(\(\) => \{[\s\S]*?\}, \[\]\)/g;
  const matches = content.match(useEffectPattern);
  
  if (!matches || matches.length === 0) {
    // useEffect가 불완전한 경우 수정
    content = content.replace(
      /useEffect\(\(\) => \{[\s\S]*?connectWebSocket\(selectedCoin\)[\s\S]*?return \(\) => \{[\s\S]*?\}/,
      `useEffect(() => {
    connectWebSocket(selectedCoin)
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [selectedCoin])`
    );
  }
  
  // 마지막 괄호 구조 확인
  const lastLines = content.split('\n').slice(-5);
  if (!lastLines.some(line => line.trim() === '}')) {
    content = content.trimEnd() + '\n}\n';
  }
  
  fs.writeFileSync(filePath, content);
  console.log('✅ LiquidationUltimate.tsx 수정 완료');
}

// 실행
console.log('🔧 빌드 에러 수정 시작...');
fixInsiderFlow();
fixLiquidation();
console.log('✨ 모든 수정 완료!');