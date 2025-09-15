const fs = require('fs').promises;
const path = require('path');

async function fixDuplicateImports(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    
    // 중복된 ModuleErrorBoundary import 제거
    const importRegex = /import ModuleErrorBoundary from '@\/components\/common\/ModuleErrorBoundary'/g;
    const imports = content.match(importRegex);
    
    if (imports && imports.length > 1) {
      // 첫 번째 import만 남기고 나머지 제거
      let count = 0;
      content = content.replace(importRegex, (match) => {
        count++;
        return count === 1 ? match : '';
      });
      
      // 빈 줄 정리
      content = content.replace(/\n\n\n+/g, '\n\n');
      
      await fs.writeFile(filePath, content);
      console.log(`✅ 중복 import 제거: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ 에러 발생 ${filePath}:`, error.message);
  }
}

async function processDirectory(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        await processDirectory(fullPath);
      } else if (entry.name === 'page.tsx') {
        await fixDuplicateImports(fullPath);
      }
    }
  } catch (error) {
    console.error(`디렉토리 처리 중 에러: ${dirPath}`, error.message);
  }
}

async function main() {
  const appDir = path.join(process.cwd(), 'app');
  await processDirectory(appDir);
  console.log('\n✨ 중복 import 제거 완료!');
}

main().catch(console.error);