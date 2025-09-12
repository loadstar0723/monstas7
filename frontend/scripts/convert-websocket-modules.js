#!/usr/bin/env node

/**
 * WebSocket 모듈 자동 변환 스크립트
 * - 기존 WebSocket 구현을 최적화된 WebSocket 훅으로 변환
 * - setInterval, setTimeout 제거
 * - WebSocketManager, useWebSocketFirst 등을 useOptimizedWebSocket으로 교체
 */

const fs = require('fs')
const path = require('path')

// 변환 대상 파일들
const TARGET_FILES = [
  // Quant 폴더
  '/c/monsta/monstas7/frontend/app/quant/grid-bot/GridBotUltraModule.tsx',
  '/c/monsta/monstas7/frontend/app/quant/market-making/MarketMakingUltraModule.tsx',
  
  // Microstructure 폴더
  '/c/monsta/monstas7/frontend/app/microstructure/orderbook/OrderbookHeatmapUltimate.tsx',
  '/c/monsta/monstas7/frontend/app/microstructure/hft/HFTPatternModule.tsx',
  '/c/monsta/monstas7/frontend/app/microstructure/imbalance/ImbalanceModule.tsx',
  '/c/monsta/monstas7/frontend/app/microstructure/sweep/SweepDetectionModule.tsx',
  
  // Technical 폴더
  '/c/monsta/monstas7/frontend/app/technical/indicators/TechnicalIndicatorsModule.tsx',
  '/c/monsta/monstas7/frontend/app/technical/patterns/PatternRecognitionUltimate.tsx',
  '/c/monsta/monstas7/frontend/app/technical/profile/VolumeProfileModule.tsx',
  '/c/monsta/monstas7/frontend/app/technical/elliott/ElliottWaveModule.tsx'
]

// 변환 규칙
const CONVERSION_RULES = [
  // Import 변경
  {
    from: /import WebSocketManager from ['"]@\/lib\/websocketManager['"]/g,
    to: ""
  },
  {
    from: /import.*useWebSocketFirst.*from ['"]@\/lib\/useWebSocketFirst['"]/g,
    to: ""
  },
  {
    from: /import.*BINANCE_CONFIG.*from ['"]@\/lib\/binanceConfig['"]/g,
    to: ""
  },
  // 새 Import 추가
  {
    from: /('use client')/,
    to: `$1

import { useRealtimePrice, useRealtimeKlines, useRealtimeOrderbook, useRealtimeTrades } from '@/lib/hooks/useOptimizedWebSocket'`
  },
  
  // WebSocket 연결 관련 변수 제거
  {
    from: /const wsRef = useRef<WebSocket \| null>\(null\)/g,
    to: "// WebSocket 최적화로 wsRef 제거됨"
  },
  {
    from: /const reconnectTimeoutRef = useRef<NodeJS\.Timeout \| null>\(null\)/g,
    to: "// WebSocket 최적화로 reconnectTimeoutRef 제거됨"
  },
  {
    from: /const pollingIntervalRef = useRef<NodeJS\.Timeout \| null>\(null\)/g,
    to: "// WebSocket 최적화로 pollingIntervalRef 제거됨"
  },
  
  // setInterval, setTimeout 제거
  {
    from: /setInterval\([^}]+}\s*,\s*\d+\)/g,
    to: "// setInterval 제거 - WebSocket으로 실시간 처리"
  },
  {
    from: /setTimeout\([^}]+}\s*,\s*\d+\)/g,
    to: "// setTimeout 제거 - WebSocket으로 실시간 처리"
  },
  
  // clearInterval, clearTimeout 제거
  {
    from: /clearInterval\([^)]+\)/g,
    to: "// clearInterval 제거됨"
  },
  {
    from: /clearTimeout\([^)]+\)/g,
    to: "// clearTimeout 제거됨"
  },
  
  // WebSocket 수동 연결 코드 제거
  {
    from: /const connectWebSocket = [\s\S]*?}(?=\s*(?:\/\/|\/\*|const|function|useEffect|return))/g,
    to: "// connectWebSocket 함수 제거 - useOptimizedWebSocket으로 대체"
  },
  
  // WebSocketManager 사용 제거
  {
    from: /WebSocketManager\.[^;]+;/g,
    to: "// WebSocketManager 사용 제거됨"
  },
  
  // 오래된 WebSocket 훅 제거
  {
    from: /const.*= useWebSocketFirst\([^)]+\)/g,
    to: "// useWebSocketFirst 제거 - useOptimizedWebSocket으로 대체"
  }
]

// 파일 변환 함수
function convertFile(filePath) {
  try {
    // 파일 존재 확인
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  파일 없음: ${filePath}`)
      return false
    }

    // 백업 생성
    const backupPath = filePath + '.pre-websocket-optimization'
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(filePath, backupPath)
      console.log(`📄 백업 생성: ${path.basename(backupPath)}`)
    }

    // 파일 읽기
    let content = fs.readFileSync(filePath, 'utf8')
    const originalLength = content.length

    // 변환 규칙 적용
    let changesCount = 0
    CONVERSION_RULES.forEach((rule, index) => {
      const beforeLength = content.length
      content = content.replace(rule.from, rule.to)
      if (content.length !== beforeLength) {
        changesCount++
      }
    })

    // WebSocket 훅 추가 (파일 구조에 따라)
    if (content.includes('useState') && !content.includes('useRealtimePrice')) {
      // 기본 가격 추적 훅 추가
      const hookInsertion = `
  // 최적화된 WebSocket 훅 사용
  const realtimePrice = useRealtimePrice(selectedSymbol || selectedCoin, { enabled: true })
  const { currentKline, klines, isConnected } = useRealtimeKlines(selectedSymbol || selectedCoin, '1m', { enabled: true })
`
      
      // useState 선언 다음에 훅 추가
      content = content.replace(
        /(const \[.*?\] = useState[^}]+}?\))/,
        `$1${hookInsertion}`
      )
      changesCount++
    }

    // 변경사항이 있으면 파일 저장
    if (changesCount > 0) {
      fs.writeFileSync(filePath, content)
      console.log(`✅ 변환 완료: ${path.basename(filePath)} (${changesCount}개 규칙 적용)`)
      
      // 크기 변화 리포트
      const newLength = content.length
      const sizeDiff = newLength - originalLength
      console.log(`   📏 크기 변화: ${originalLength} → ${newLength} (${sizeDiff > 0 ? '+' : ''}${sizeDiff})`)
      
      return true
    } else {
      console.log(`ℹ️  변경사항 없음: ${path.basename(filePath)}`)
      return false
    }

  } catch (error) {
    console.error(`❌ 변환 실패: ${filePath}`)
    console.error(error.message)
    return false
  }
}

// 메인 실행 함수
function main() {
  console.log('🚀 WebSocket 모듈 최적화 변환 시작\n')
  
  let successCount = 0
  let totalCount = 0

  TARGET_FILES.forEach(filePath => {
    totalCount++
    console.log(`\n📁 처리 중: ${path.basename(filePath)}`)
    
    if (convertFile(filePath)) {
      successCount++
    }
  })

  console.log(`\n🎉 변환 완료!`)
  console.log(`   성공: ${successCount}/${totalCount} 파일`)
  console.log(`   실패: ${totalCount - successCount} 파일`)
  
  if (successCount > 0) {
    console.log('\n📋 다음 단계:')
    console.log('1. npm run dev로 개발 서버 실행')
    console.log('2. 각 모듈의 동작 확인')
    console.log('3. WebSocket 연결 상태 확인')
    console.log('4. 실시간 데이터 업데이트 확인')
  }

  // 변환 후 검증 스크립트 생성
  generateValidationScript()
}

// 검증 스크립트 생성
function generateValidationScript() {
  const validationScript = `#!/usr/bin/env node

/**
 * WebSocket 최적화 검증 스크립트
 */

const fs = require('fs')

const files = ${JSON.stringify(TARGET_FILES, null, 2)}

console.log('🔍 WebSocket 최적화 검증 시작\\n')

files.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(\`⚠️  파일 없음: \${filePath}\`)
    return
  }

  const content = fs.readFileSync(filePath, 'utf8')
  const fileName = filePath.split('/').pop()
  
  console.log(\`📄 검증 중: \${fileName}\`)
  
  // 금지된 패턴 체크
  const forbiddenPatterns = [
    { pattern: /setInterval/, name: 'setInterval' },
    { pattern: /setTimeout/, name: 'setTimeout' },
    { pattern: /WebSocketManager/, name: 'WebSocketManager' },
    { pattern: /useWebSocketFirst/, name: 'useWebSocketFirst' },
    { pattern: /wsRef\\.current/, name: 'manual WebSocket ref' }
  ]
  
  let violations = 0
  forbiddenPatterns.forEach(({ pattern, name }) => {
    if (pattern.test(content)) {
      console.log(\`   ❌ \${name} 발견\`)
      violations++
    }
  })
  
  // 필수 패턴 체크
  const requiredPatterns = [
    { pattern: /useRealtimePrice/, name: 'useRealtimePrice hook' },
    { pattern: /useOptimizedWebSocket/, name: 'optimized WebSocket import' }
  ]
  
  let missing = 0
  requiredPatterns.forEach(({ pattern, name }) => {
    if (!pattern.test(content)) {
      console.log(\`   ⚠️  \${name} 누락\`)
      missing++
    }
  })
  
  if (violations === 0 && missing === 0) {
    console.log(\`   ✅ 최적화 완료\`)
  }
  
  console.log()
})

console.log('✨ 검증 완료')
`

  fs.writeFileSync('/c/monsta/monstas7/frontend/scripts/validate-websocket-optimization.js', validationScript)
  console.log('\n📋 검증 스크립트 생성됨: scripts/validate-websocket-optimization.js')
}

// 스크립트 실행
if (require.main === module) {
  main()
}

module.exports = { convertFile, CONVERSION_RULES }