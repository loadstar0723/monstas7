/**
 * 기존 Binance API 코드를 최적화된 데이터 서비스로 자동 마이그레이션
 */

const fs = require('fs').promises
const path = require('path')

// 수정할 파일들 목록
const filesToMigrate = [
  // Signals 페이지들
  'app/signals/whale-tracker/WhaleTrackerUltimate.tsx',
  'app/signals/smart-money/SmartMoneyUltimate.tsx',
  'app/signals/liquidation/LiquidationUltimate.tsx',
  'app/signals/dex-flow/DexFlowUltimate.tsx',
  'app/signals/funding-rate/FundingRateUltimate.tsx',
  'app/signals/insider-flow/InsiderFlowUltimate.tsx',
  'app/signals/fear-greed/hooks/useFearGreedData.ts',
  'app/signals/social-sentiment/components/SentimentOverview.tsx',
  'app/signals/social-sentiment/components/TradingStrategy.tsx',
  'app/signals/social-sentiment/components/TrendingAnalysis.tsx',
  'app/signals/social-sentiment/components/VisualizationDashboard.tsx',
  'app/signals/social-sentiment/components/InvestmentSignals.tsx',
  'app/signals/social-sentiment/components/AdvancedTools.tsx',
  
  // Microstructure 페이지들
  'app/microstructure/orderbook/components/OrderBookChart.tsx',
  'app/microstructure/orderbook/components/LiquidityDepth.tsx',
  'app/microstructure/liquidity/components/LiquidityRadar.tsx',
  'app/microstructure/liquidity/components/DepthChart.tsx',
  'app/microstructure/footprint/FootprintChartModule.tsx',
  'app/microstructure/footprint/utils/sampleData.ts',
]

// 교체 패턴들
const replacements = [
  // Import 추가 (파일 상단에)
  {
    pattern: /^('use client'[\s\S]*?import[\s\S]*?from[\s\S]*?\n)/,
    replacement: `$1import { useRealtimePrice, useMultipleRealtimePrices, fetchKlines, fetchOrderBook, fetch24hrTicker } from '@/lib/hooks/useRealtimePrice'\nimport { dataService } from '@/lib/services/finalDataService'\n`
  },
  
  // WebSocket 직접 생성을 대체
  {
    pattern: /new WebSocket\(`?wss:\/\/stream\.binance\.com[^`\)]*`?\)/g,
    replacement: `/* WebSocket replaced with optimized service */`
  },
  
  // WebSocket 이벤트 핸들러를 dataService 구독으로 대체
  {
    pattern: /ws\.onmessage\s*=\s*\([^)]*\)\s*=>\s*{([^}]*)}/g,
    replacement: `dataService.subscribeToPrice(symbol, (data) => {
      // Optimized data service callback
      const price = data.price
      const change = data.change24h
      $1
    })`
  },
  
  // fetch('/api/binance/ticker') 호출 대체
  {
    pattern: /fetch\([`"']\/api\/binance\/ticker[^`"']*[`"']\)/g,
    replacement: `fetch24hrTicker(symbol)`
  },
  
  // fetch('/api/binance/klines') 호출 대체
  {
    pattern: /fetch\([`"']\/api\/binance\/klines[^`"']*[`"']\)/g,
    replacement: `fetchKlines(symbol, interval, limit)`
  },
  
  // fetch('https://api.binance.com/api/v3/ticker') 직접 호출 대체
  {
    pattern: /fetch\([`"']https:\/\/api\.binance\.com\/api\/v3\/ticker[^`"']*[`"']\)/g,
    replacement: `fetch24hrTicker(symbol)`
  },
  
  // fetch('https://api.binance.com/api/v3/klines') 직접 호출 대체
  {
    pattern: /fetch\([`"']https:\/\/api\.binance\.com\/api\/v3\/klines[^`"']*[`"']\)/g,
    replacement: `fetchKlines(symbol, interval, limit)`
  },
  
  // fetch('/api/binance/depth') 또는 orderbook 호출 대체
  {
    pattern: /fetch\([`"']\/api\/binance\/(depth|orderbook)[^`"']*[`"']\)/g,
    replacement: `fetchOrderBook(symbol, limit)`
  },
]

async function migrateFile(filePath) {
  try {
    const fullPath = path.join(__dirname, '..', filePath)
    let content = await fs.readFile(fullPath, 'utf8')
    const originalContent = content
    
    // 이미 마이그레이션된 파일인지 확인
    if (content.includes('useRealtimePrice') || content.includes('dataService')) {
      console.log(`✅ ${filePath} - 이미 마이그레이션됨`)
      return { success: true, alreadyMigrated: true }
    }
    
    // 패턴 교체 적용
    let modified = false
    for (const { pattern, replacement } of replacements) {
      const before = content
      content = content.replace(pattern, replacement)
      if (before !== content) {
        modified = true
      }
    }
    
    // WebSocket 변수 선언 제거
    content = content.replace(/\s*const\s+ws\s*=\s*new\s+WebSocket[^;]*;?/g, '')
    content = content.replace(/\s*let\s+ws\s*=\s*new\s+WebSocket[^;]*;?/g, '')
    content = content.replace(/\s*wsRef\.current\s*=\s*new\s+WebSocket[^;]*;?/g, '')
    
    // ws.close() 호출 제거
    content = content.replace(/\s*ws\.close\(\);?/g, '')
    content = content.replace(/\s*wsRef\.current\?\.close\(\);?/g, '')
    
    if (modified) {
      // 백업 생성
      await fs.writeFile(fullPath + '.backup', originalContent)
      
      // 수정된 내용 저장
      await fs.writeFile(fullPath, content)
      console.log(`✨ ${filePath} - 마이그레이션 완료`)
      return { success: true, modified: true }
    } else {
      console.log(`⏭️ ${filePath} - 변경사항 없음`)
      return { success: true, modified: false }
    }
  } catch (error) {
    console.error(`❌ ${filePath} - 에러:`, error.message)
    return { success: false, error: error.message }
  }
}

async function main() {
  console.log('🚀 Binance API 마이그레이션 시작...\n')
  
  const results = {
    total: filesToMigrate.length,
    migrated: 0,
    alreadyMigrated: 0,
    skipped: 0,
    failed: 0
  }
  
  for (const file of filesToMigrate) {
    const result = await migrateFile(file)
    if (result.success) {
      if (result.alreadyMigrated) {
        results.alreadyMigrated++
      } else if (result.modified) {
        results.migrated++
      } else {
        results.skipped++
      }
    } else {
      results.failed++
    }
  }
  
  console.log('\n📊 마이그레이션 완료:')
  console.log(`  ✨ 새로 마이그레이션: ${results.migrated}`)
  console.log(`  ✅ 이미 마이그레이션됨: ${results.alreadyMigrated}`)
  console.log(`  ⏭️ 변경사항 없음: ${results.skipped}`)
  console.log(`  ❌ 실패: ${results.failed}`)
  console.log(`  📁 총 파일: ${results.total}`)
  
  if (results.migrated > 0) {
    console.log('\n💡 다음 단계:')
    console.log('  1. npm run dev로 개발 서버 재시작')
    console.log('  2. 각 페이지 테스트')
    console.log('  3. git commit -m "✨ 최적화된 데이터 서비스로 마이그레이션"')
    console.log('  4. git push origin master')
  }
}

main().catch(console.error)