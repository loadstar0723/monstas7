const fs = require('fs').promises;
const path = require('path');

// 페이지별 모듈 이름 매핑
const moduleNames = {
  'anomaly': 'Anomaly Detection',
  'clustering': 'Clustering Analysis',
  'gpt': 'GPT AI 모델',
  'predictions': 'AI 예측 시스템',
  'nlp': 'NLP 자연어 처리',
  'reinforcement': '강화학습 모델',
  'quantum': '양자 AI 모델',
  'sentiment': '감성 분석',
  'test': '테스트 모듈',
  'pattern-recognition': '패턴 인식',
  'ensemble': '앙상블 모델',
  'arima': 'ARIMA 시계열 분석',
  'randomforest': 'Random Forest',
  'xgboost': 'XGBoost',
  'lightgbm': 'LightGBM',
  'neural': '신경망 모델',
  'strategy-builder': 'AI 전략 빌더',
  'portfolio-optimizer': '포트폴리오 옵티마이저',
  'risk-management': '리스크 관리'
};

async function updatePageFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    
    // 이미 ModuleErrorBoundary가 있는지 확인
    if (content.includes('ModuleErrorBoundary')) {
      console.log(`✅ 이미 처리됨: ${filePath}`);
      return;
    }
    
    // 폴더명에서 모듈 이름 추출
    const folderName = path.basename(path.dirname(filePath));
    const moduleName = moduleNames[folderName] || folderName;
    
    // dynamic import가 있는지 확인
    const hasDynamicImport = content.includes('dynamic(');
    
    let updatedContent;
    
    if (hasDynamicImport) {
      // dynamic import가 있는 경우
      updatedContent = content
        .replace(/^'use client'/, `'use client'\n\nimport ModuleErrorBoundary from '@/components/common/ModuleErrorBoundary'`)
        .replace(/import dynamic from 'next\/dynamic'/, `import dynamic from 'next/dynamic'\nimport ModuleErrorBoundary from '@/components/common/ModuleErrorBoundary'`)
        .replace(/export default function \w+\(\) \{[\s\S]*?\n\}$/, (match) => {
          // 함수 내용 추출
          const functionContent = match.match(/\{([\s\S]*)\}/)[1].trim();
          
          // return 문 찾기
          if (functionContent.includes('return (')) {
            // return ( 형태
            return match.replace(/return \(([\s\S]*)\)/, (_, content) => {
              return `return (\n    <ModuleErrorBoundary moduleName="${moduleName}">\n      ${content.trim()}\n    </ModuleErrorBoundary>\n  )`;
            });
          } else if (functionContent.includes('return <')) {
            // return < 형태
            return match.replace(/return (<[\s\S]*>)/, (_, content) => {
              return `return (\n    <ModuleErrorBoundary moduleName="${moduleName}">\n      ${content}\n    </ModuleErrorBoundary>\n  )`;
            });
          } else {
            // 기타 형태
            return match.replace(/\{([\s\S]*)\}/, (_, content) => {
              return `{\n  return (\n    <ModuleErrorBoundary moduleName="${moduleName}">\n      ${content.trim()}\n    </ModuleErrorBoundary>\n  )\n}`;
            });
          }
        });
    } else {
      // dynamic import가 없는 경우 - 전체 구조 변경
      const componentMatch = content.match(/export default function (\w+)/);
      if (!componentMatch) {
        console.log(`⚠️ 함수 컴포넌트를 찾을 수 없음: ${filePath}`);
        return;
      }
      
      const componentName = componentMatch[1];
      const moduleComponentName = componentName.replace('Page', 'Module');
      
      // 새로운 구조로 전체 재작성
      updatedContent = `'use client'

import dynamic from 'next/dynamic'
import ModuleErrorBoundary from '@/components/common/ModuleErrorBoundary'

const ${moduleComponentName} = dynamic(() => import('./${moduleComponentName}'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">${moduleName} 로딩 중...</p>
      </div>
    </div>
  )
})

export default function ${componentName}() {
  return (
    <ModuleErrorBoundary moduleName="${moduleName}">
      <${moduleComponentName} />
    </ModuleErrorBoundary>
  )
}`;
    }
    
    await fs.writeFile(filePath, updatedContent);
    console.log(`✅ 업데이트 완료: ${filePath}`);
    
  } catch (error) {
    console.error(`❌ 에러 발생 ${filePath}:`, error.message);
  }
}

async function main() {
  const directories = [
    'app/ai',
    'app/analytics',
    'app/crypto',
    'app/events',
    'app/signals',
    'app/technical',
    'app/microstructure',
    'app/quant',
    'app/trading'
  ];
  
  for (const dir of directories) {
    try {
      const fullPath = path.join(process.cwd(), dir);
      const entries = await fs.readdir(fullPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const pagePath = path.join(fullPath, entry.name, 'page.tsx');
          try {
            await fs.access(pagePath);
            await updatePageFile(pagePath);
          } catch {
            // page.tsx 파일이 없는 경우 무시
          }
        }
      }
    } catch (error) {
      console.log(`디렉토리를 읽을 수 없음: ${dir}`);
    }
  }
  
  console.log('\n✨ 모든 페이지 모듈화 완료!');
}

main().catch(console.error);