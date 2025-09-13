const fs = require('fs');
const path = require('path');
const glob = require('glob');

// console.log를 제거하는 함수
function removeConsoleLogs(content) {
  // console.log, console.error, console.warn 등을 제거
  // 에러 핸들링용 console.error는 유지
  const patterns = [
    /console\.(log|info|debug|trace|warn)\([^)]*\);?\s*/g,
    /console\.(log|info|debug|trace|warn)\([^)]*\)[,;]?\s*\n/g,
    /console\.(log|info|debug|trace|warn)\([\s\S]*?\);?\s*\n/g
  ];
  
  let cleaned = content;
  patterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  
  // 빈 줄 정리
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return cleaned;
}

// 파일 처리 함수
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const cleaned = removeConsoleLogs(content);
    
    if (content !== cleaned) {
      fs.writeFileSync(filePath, cleaned, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// 메인 실행
async function main() {
  const patterns = [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'utils/**/*.{ts,tsx}'
  ];
  
  let totalFiles = 0;
  let modifiedFiles = 0;
  
  for (const pattern of patterns) {
    const files = glob.sync(pattern, {
      ignore: ['**/node_modules/**', '**/.next/**'],
      cwd: path.join(__dirname, '..')
    });
    
    for (const file of files) {
      const fullPath = path.join(__dirname, '..', file);
      totalFiles++;
      
      if (processFile(fullPath)) {
        modifiedFiles++;
        console.log(`✓ Cleaned: ${file}`);
      }
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`- Total files checked: ${totalFiles}`);
  console.log(`- Files modified: ${modifiedFiles}`);
  console.log(`- Console logs removed successfully!`);
}

main().catch(console.error);