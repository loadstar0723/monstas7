const fs = require('fs')
const path = require('path')

// CLAUDE.md 규칙 위반 검사
const violations = []

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const fileName = path.basename(filePath)
  
  // Math.random() 검사
  if (content.includes('Math.random()')) {
    violations.push(`${fileName}: Math.random() 사용 금지`)
  }
  
  // 하드코딩된 숫자 검사 (특정 패턴)
  const hardcodedPatterns = [
    /price:\s*\d+/g,
    /value:\s*\d+/g,
    /\*\s*0\.\d+/g,  // * 0.5 같은 패턴
    /\+\s*\d{2,}/g,  // + 100 같은 패턴
  ]
  
  hardcodedPatterns.forEach(pattern => {
    const matches = content.match(pattern)
    if (matches) {
      violations.push(`${fileName}: 하드코딩된 값 발견 - ${matches.join(', ')}`)
    }
  })
  
  // Mock/Fake 데이터 검사
  const forbiddenWords = ['mock', 'dummy', 'fake', 'sample', 'test', 'example']
  forbiddenWords.forEach(word => {
    if (content.toLowerCase().includes(word)) {
      violations.push(`${fileName}: 금지된 단어 '${word}' 발견`)
    }
  })
}

// social-sentiment 디렉토리의 모든 컴포넌트 검사
const componentsDir = path.join(__dirname, '../app/signals/social-sentiment/components')
const files = fs.readdirSync(componentsDir).filter(file => file.endsWith('.tsx'))

files.forEach(file => {
  checkFile(path.join(componentsDir, file))
})

// 결과 출력
console.log('=== CLAUDE.md 규칙 검증 결과 ===')
if (violations.length === 0) {
  console.log('✅ 모든 컴포넌트가 규칙을 준수하고 있습니다!')
} else {
  console.log(`❌ ${violations.length}개의 규칙 위반 발견:`)
  violations.forEach(v => console.log(`  - ${v}`))
}