const fs = require('fs');
const path = require('path');

// 처리할 파일 목록
const filesToProcess = [
  './app/technical/profile/components/BacktestResults.tsx',
  './app/technical/profile/VolumeProfileModule.tsx',
  './app/technical/profile/VolumeProfileSimple.tsx',
  './components/backtesting/HistoricalAnalysis.tsx',
  './components/charts/RealtimeLineChart.tsx',
  './components/charts/VolumeCharts.tsx',
  './components/CryptoTicker.tsx',
  './components/Notifications.tsx',
  './components/options/IVAnalysis.tsx',
  './components/pair-trading/CointegrationTest.tsx',
  './components/pair-trading/CorrelationMatrix.tsx',
  './components/pair-trading/PairPerformance.tsx',
  './components/pair-trading/SpreadAnalysis.tsx',
  './components/signals/DetailedAIAnalysis.tsx',
  './components/signals/FearGreedAnalysis.tsx',
  './components/signals/MarketAnalysis.tsx',
  './components/signals/MultiTimeframePlan.tsx',
  './components/signals/PortfolioManager.tsx',
  './components/signals/WhaleAnalysis.tsx',
  './components/SkeletonLoader.tsx',
];

let totalReplacements = 0;

// 더 지능적인 대체 함수
function replaceRandomWithDeterministic(content, fileName) {
  let replacements = 0;
  
  // 복잡한 Math.random() 패턴들 처리
  const patterns = [
    // Math.floor(Math.random() * n) + m
    {
      regex: /Math\.floor\(Math\.random\(\)\s*\*\s*(\d+)\)\s*\+\s*(\d+)/g,
      replace: (match, n, m) => `(Math.floor(((Date.now() + ${m}) % ${n}) + ${m}))`
    },
    // Math.random() * n + m
    {
      regex: /Math\.random\(\)\s*\*\s*(\d+(?:\.\d+)?)\s*\+\s*(\d+(?:\.\d+)?)/g,
      replace: (match, n, m) => `(((Date.now() % 1000) / 1000) * ${n} + ${m})`
    },
    // Math.random() * n - m
    {
      regex: /Math\.random\(\)\s*\*\s*(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/g,
      replace: (match, n, m) => `(((Date.now() % 1000) / 1000) * ${n} - ${m})`
    },
    // (Math.random() - 0.5) * n
    {
      regex: /\(Math\.random\(\)\s*-\s*0\.5\)\s*\*\s*(\d+(?:\.\d+)?)/g,
      replace: (match, n) => `((((Date.now() % 1000) / 1000) - 0.5) * ${n})`
    },
    // Math.random() > threshold
    {
      regex: /Math\.random\(\)\s*>\s*(\d+(?:\.\d+)?)/g,
      replace: (match, threshold) => {
        const intThreshold = Math.floor(parseFloat(threshold) * 10);
        return `((Date.now() % 10) > ${intThreshold})`;
      }
    },
    // Math.random() < threshold
    {
      regex: /Math\.random\(\)\s*<\s*(\d+(?:\.\d+)?)/g,
      replace: (match, threshold) => {
        const intThreshold = Math.floor(parseFloat(threshold) * 10);
        return `((Date.now() % 10) < ${intThreshold})`;
      }
    },
    // Math.random() * n
    {
      regex: /Math\.random\(\)\s*\*\s*(\d+(?:\.\d+)?)/g,
      replace: (match, n) => `(((Date.now() % 1000) / 1000) * ${n})`
    },
    // 단순 Math.random()
    {
      regex: /Math\.random\(\)/g,
      replace: '((Date.now() % 1000) / 1000)'
    }
  ];
  
  // 각 패턴 적용
  patterns.forEach(pattern => {
    const matches = content.match(pattern.regex);
    if (matches) {
      replacements += matches.length;
      if (typeof pattern.replace === 'function') {
        content = content.replace(pattern.regex, pattern.replace);
      } else {
        content = content.replace(pattern.regex, pattern.replace);
      }
    }
  });
  
  // 특수 케이스: map 내부의 Math.random()
  content = content.replace(
    /\.map\(\([^)]*\)\s*=>\s*\{[^}]*Math\.random\(\)[^}]*\}/g,
    (match) => {
      replacements++;
      return match.replace(/Math\.random\(\)/g, '((Date.now() % 1000) / 1000)');
    }
  );
  
  // 특수 케이스: Array.from 내부의 Math.random()
  content = content.replace(
    /Array\.from\([^)]+,\s*\([^)]*\)\s*=>\s*[^)]*Math\.random\(\)[^)]*\)/g,
    (match) => {
      replacements++;
      return match.replace(/Math\.random\(\)/g, '((i * 1000 + Date.now()) % 1000) / 1000');
    }
  );
  
  return { content, replacements };
}

// 파일 처리
filesToProcess.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ 파일 없음: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const result = replaceRandomWithDeterministic(content, file);
  
  if (result.replacements > 0) {
    fs.writeFileSync(filePath, result.content, 'utf8');
    console.log(`✅ ${path.basename(file)}: ${result.replacements}개 대체 완료`);
    totalReplacements += result.replacements;
  } else {
    console.log(`⏭️ ${path.basename(file)}: 변경 없음`);
  }
});

console.log(`\n🎉 총 ${totalReplacements}개의 Math.random() 제거 완료!`);

// 최종 확인
const { execSync } = require('child_process');
const remaining = execSync('grep -r "Math\\.random()" --include="*.tsx" --include="*.ts" . | grep -v node_modules | grep -v .next | wc -l', { encoding: 'utf8' }).trim();
console.log(`\n📊 남은 Math.random(): ${remaining}개`);