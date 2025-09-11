const fs = require('fs');
const path = require('path');

// 수정할 파일 목록
const filesToFix = [
  'components/pin-bar/PinBarChart.tsx',
  'components/pin-bar/PinBarDashboard.tsx',
  'components/pin-bar/PinBarDetector.tsx',
  'components/pin-bar/PinBarHistory.tsx',
  'components/pin-bar/PinBarModule.tsx',
  'components/pin-bar/PinBarSignals.tsx'
];

// safeFormat import 추가
const safeImport = "import { safeFixed, safePrice, safeAmount, safePercent } from '@/lib/safeFormat'";

filesToFix.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 이미 import가 있는지 확인
    if (content.includes("from '@/lib/safeFormat'")) {
      console.log(`✓ ${file} - 이미 import 있음`);
      return;
    }
    
    // 'use client' 다음에 import 추가
    if (content.startsWith("'use client'")) {
      content = content.replace(
        "'use client'\n",
        `'use client'\n\n${safeImport}\n`
      );
    } else {
      // 첫 번째 import 찾아서 그 전에 추가
      const firstImportIndex = content.indexOf('import ');
      if (firstImportIndex !== -1) {
        content = safeImport + '\n' + content;
      }
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${file} - import 추가됨`);
  } else {
    console.log(`❌ ${file} - 파일이 없음`);
  }
});

console.log('\n✅ 완료!');