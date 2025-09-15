const fs = require('fs');
const path = require('path');

// 수정할 파일 목록
const filesToFix = [
  'app/ai/gru/GRUModule.tsx',
  'app/ai/lightgbm/LightGBMModule.tsx',
  'app/ai/arima/components/FanChart.tsx',
  'app/ai/lightgbm/components/ParameterOptimization.tsx',
  'app/ai/lstm/components/BacktestingCenter.tsx',
  'app/ai/neural/components/PredictionInterface.tsx',
  'app/ai/randomforest/components/OOBAnalysis.tsx',
  'app/ai/randomforest/components/PartialDependence.tsx',
  'app/ai/randomforest/components/TreeVisualization3D.tsx'
];

// onChange 패턴을 안전한 버전으로 교체
function fixOnChangeHandler(content) {
  // 간단한 onChange 패턴 수정
  const simplePattern = /onChange=\{(\(e\)) => ([a-zA-Z]+)\(e\.target\.value(.*?)\)\}/g;
  
  content = content.replace(simplePattern, (match, param, funcName, extra) => {
    return `onChange={(e) => {
                if (e && e.target && e.target.value) {
                  ${funcName}(e.target.value${extra})
                }
              }}`;
  });

  // parseFloat/parseInt 패턴 수정
  const parsePattern = /onChange=\{(\(e\)) => ([a-zA-Z]+)\((parseFloat|parseInt)\(e\.target\.value\)(.*?)\)\}/g;
  
  content = content.replace(parsePattern, (match, param, funcName, parseFunc, extra) => {
    return `onChange={(e) => {
                if (e && e.target && e.target.value) {
                  ${funcName}(${parseFunc}(e.target.value)${extra})
                }
              }}`;
  });

  // as any 패턴 수정
  const asAnyPattern = /onChange=\{(\(e\)) => ([a-zA-Z]+)\(e\.target\.value as any\)\}/g;
  
  content = content.replace(asAnyPattern, (match, param, funcName) => {
    return `onChange={(e) => {
                if (e && e.target && e.target.value) {
                  ${funcName}(e.target.value as any)
                }
              }}`;
  });

  // array index 패턴 수정
  const arrayPattern = /onChange=\{(\(e\)) => ([a-zA-Z]+)\(\[([^,]+), ([a-zA-Z.()]+)\(e\.target\.value\)\]\)\}/g;
  
  content = content.replace(arrayPattern, (match, param, funcName, firstArg, parseFunc) => {
    return `onChange={(e) => {
                if (e && e.target && e.target.value) {
                  ${funcName}([${firstArg}, ${parseFunc}(e.target.value)])
                }
              }}`;
  });

  return content;
}

// 파일 처리
filesToFix.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (fs.existsSync(fullPath)) {
    console.log(`Processing: ${filePath}`);
    
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    
    content = fixOnChangeHandler(content);
    
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Fixed: ${filePath}`);
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
    }
  } else {
    console.log(`❌ File not found: ${filePath}`);
  }
});

console.log('\n✨ onChange handler fix complete!');