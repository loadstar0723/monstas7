const fs = require('fs').promises;
const path = require('path');

const aiModels = [
  { name: 'randomforest', label: 'Random Forest', color: 'orange' },
  { name: 'xgboost', label: 'XGBoost', color: 'red' },
  { name: 'lightgbm', label: 'LightGBM', color: 'yellow' },
  { name: 'neural', label: '신경망 모델', color: 'purple' },
  { name: 'ensemble', label: '앙상블 모델', color: 'indigo' },
  { name: 'pattern-recognition', label: '패턴 인식', color: 'pink' }
];

async function updateAIPage(model) {
  const pagePath = path.join(process.cwd(), 'app', 'ai', model.name, 'page.tsx');
  
  const content = `'use client'

import dynamic from 'next/dynamic'
import ModuleErrorBoundary from '@/components/common/ModuleErrorBoundary'

const ${model.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}Module = dynamic(() => import('./${model.name === 'pattern-recognition' ? 'PatternRecognitionModule' : model.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('') + 'ModuleEnhanced'}'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-${model.color}-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">${model.label} 로딩 중...</p>
      </div>
    </div>
  )
})

export default function ${model.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}Page() {
  return (
    <ModuleErrorBoundary moduleName="${model.label}">
      <${model.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}Module />
    </ModuleErrorBoundary>
  )
}`;

  try {
    await fs.writeFile(pagePath, content);
    console.log(`✅ Updated: ${model.name}`);
  } catch (error) {
    console.error(`❌ Error updating ${model.name}:`, error.message);
  }
}

async function main() {
  for (const model of aiModels) {
    await updateAIPage(model);
  }
  console.log('\n✨ AI 페이지 업데이트 완료!');
}

main().catch(console.error);