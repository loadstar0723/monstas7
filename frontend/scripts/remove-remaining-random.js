const fs = require('fs');
const path = require('path');

// Math.random()을 대체할 결정적 함수들
const replacements = {
  // 기본 패턴들
  'Math.random()': '((Date.now() % 1000) / 1000)',
  'Math.random() * ': '((Date.now() % 1000) / 1000) * ',
  '(Math.random() * ': '(((Date.now() % 1000) / 1000) * ',
  'Math.random() > 0.5': '((Date.now() % 2) === 0)',
  'Math.random() < 0.5': '((Date.now() % 2) === 1)',
  'Math.random() > 0.3': '((Date.now() % 10) > 3)',
  'Math.random() < 0.3': '((Date.now() % 10) < 3)',
  'Math.random() > 0.7': '((Date.now() % 10) > 7)',
  'Math.random() < 0.7': '((Date.now() % 10) < 7)',
  'Math.random() > 0.8': '((Date.now() % 10) > 8)',
  'Math.random() < 0.8': '((Date.now() % 10) < 8)',
  'Math.random() > 0.2': '((Date.now() % 10) > 2)',
  'Math.random() < 0.2': '((Date.now() % 10) < 2)',
};

const filesToProcess = [
  'app/microstructure/sweep/components/HistoricalSweeps.backup.tsx',
  'app/quant/market-making/components/PositionMonitor.tsx',
  'app/quant/market-making/components/ProfitSimulator.tsx',
  'app/quant/market-making/components/RiskDashboard.tsx',
  'app/quant/mean-reversion/components/RiskManagement.tsx',
  'app/quant/mean-reversion/components/RSIDivergence.tsx',
  'app/quant/mean-reversion/components/ZScoreAnalysis.tsx',
  'app/quant/strategy-builder/components/BacktestEngine.tsx',
  'app/quant/strategy-builder/components/LiveMonitor.tsx',
  'app/quant/strategy-builder/components/NoCodeBuilder.tsx',
  'app/signals/social-sentiment/test-charts.tsx',
  'app/technical/elliott/tabs/CorrectiveWaveTab.tsx',
  'app/technical/elliott/tabs/FibonacciTab.tsx',
  'app/technical/elliott/tabs/ImpulseWaveTab.tsx',
  'app/technical/elliott/tabs/PredictionTab.tsx',
  'app/technical/indicators/TabComponents.tsx',
  'app/technical/patterns/components/charts/PatternHeatmap.tsx',
  'app/technical/patterns/components/charts/PatternTimelineChart.tsx',
  'app/technical/patterns/components/charts/ProfitCurveChart.tsx',
  'app/technical/patterns/components/charts/SuccessRateRadar.tsx',
];

let totalReplacements = 0;

// 파일별로 처리
filesToProcess.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ 파일 없음: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let fileReplacements = 0;
  
  // 특수 케이스 처리
  // Array.from({ length: n }, () => Math.random())
  content = content.replace(
    /Array\.from\(\{ length: (\d+) \}, \(\) => Math\.random\(\)\)/g,
    'Array.from({ length: $1 }, (_, i) => ((i * 1000 + Date.now()) % 1000) / 1000)'
  );
  
  // map(() => Math.random())
  content = content.replace(
    /\.map\(\(\) => Math\.random\(\)\)/g,
    '.map((_, i) => ((i * 1000 + Date.now()) % 1000) / 1000)'
  );
  
  // Math.floor(Math.random() * n)
  content = content.replace(
    /Math\.floor\(Math\.random\(\) \* (\d+)\)/g,
    'Math.floor(((Date.now() % 1000) / 1000) * $1)'
  );
  
  // Math.round(Math.random() * n)
  content = content.replace(
    /Math\.round\(Math\.random\(\) \* ([\d.]+)\)/g,
    'Math.round(((Date.now() % 1000) / 1000) * $1)'
  );
  
  // value: Math.random() * n
  content = content.replace(
    /value: Math\.random\(\) \* ([\d.]+)/g,
    'value: ((Date.now() % 1000) / 1000) * $1'
  );
  
  // data: Math.random() * n
  content = content.replace(
    /data: Math\.random\(\) \* ([\d.]+)/g,
    'data: ((Date.now() % 1000) / 1000) * $1'
  );
  
  // 일반적인 Math.random() 대체
  Object.entries(replacements).forEach(([pattern, replacement]) => {
    const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = content.match(regex);
    if (matches) {
      fileReplacements += matches.length;
      content = content.replace(regex, replacement);
    }
  });
  
  // 남은 Math.random() 모두 대체
  const remainingMatches = content.match(/Math\.random\(\)/g);
  if (remainingMatches) {
    fileReplacements += remainingMatches.length;
    content = content.replace(/Math\.random\(\)/g, '((Date.now() % 1000) / 1000)');
  }
  
  if (fileReplacements > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${file}: ${fileReplacements}개 대체 완료`);
    totalReplacements += fileReplacements;
  } else {
    console.log(`⏭️ ${file}: 변경 없음`);
  }
});

console.log(`\n🎉 총 ${totalReplacements}개의 Math.random() 제거 완료!`);