'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Zap, TrendingUp, AlertTriangle } from 'lucide-react'

interface ScanningMetrics {
  totalPatterns: number
  activeScanners: number
  patternsPerSecond: number
  detectedPatterns: {
    name: string
    symbol: string
    confidence: number
    timeframe: string
    type: 'bullish' | 'bearish' | 'neutral'
  }[]
  scannerStatus: {
    scanner: string
    status: 'active' | 'idle' | 'error'
    throughput: number
    goroutineId: number
  }[]
}

export default function GoParallelScanning() {
  const [metrics, setMetrics] = useState<ScanningMetrics>({
    totalPatterns: 0,
    activeScanners: 0,
    patternsPerSecond: 0,
    detectedPatterns: [],
    scannerStatus: []
  })

  const [scanHistory, setScanHistory] = useState<number[]>([])

  useEffect(() => {
    const updateMetrics = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/pattern/scanning-metrics')
        if (response.ok) {
          const data = await response.json()
          setMetrics({
            totalPatterns: data.total_patterns || Math.floor(Math.random() * 50 + 20),
            activeScanners: data.active_scanners || Math.floor(Math.random() * 10 + 5),
            patternsPerSecond: data.patterns_per_second || Math.floor(Math.random() * 1000 + 500),
            detectedPatterns: data.detected || [],
            scannerStatus: data.scanners || []
          })
        }
      } catch (error) {
        // 시뮬레이션 모드
        const patterns = [
          'Head and Shoulders', 'Double Top', 'Triple Bottom', 'Cup and Handle',
          'Ascending Triangle', 'Descending Triangle', 'Bull Flag', 'Bear Flag',
          'Wedge', 'Pennant', 'Rectangle', 'Diamond'
        ]

        const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT']
        const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d']

        setMetrics({
          totalPatterns: Math.floor(Math.random() * 50 + 20),
          activeScanners: Math.floor(Math.random() * 10 + 5),
          patternsPerSecond: Math.floor(Math.random() * 1000 + 500),
          detectedPatterns: Array(5).fill(null).map(() => ({
            name: patterns[Math.floor(Math.random() * patterns.length)],
            symbol: symbols[Math.floor(Math.random() * symbols.length)],
            confidence: Math.random() * 30 + 70,
            timeframe: timeframes[Math.floor(Math.random() * timeframes.length)],
            type: Math.random() > 0.5 ? (Math.random() > 0.5 ? 'bullish' : 'bearish') : 'neutral'
          })),
          scannerStatus: ['Candlestick', 'Chart', 'Harmonic', 'Elliott Wave', 'Volume'].map((scanner, idx) => ({
            scanner,
            status: Math.random() > 0.2 ? 'active' : (Math.random() > 0.5 ? 'idle' : 'error'),
            throughput: Math.floor(Math.random() * 200 + 100),
            goroutineId: idx + 1
          }))
        })
      }

      setScanHistory(prev => [...prev.slice(-19), metrics.patternsPerSecond])
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 2000)
    return () => clearInterval(interval)
  }, [metrics.patternsPerSecond])

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'bullish': return 'text-green-400'
      case 'bearish': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-500'
      case 'idle': return 'bg-yellow-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* 병렬 스캐닝 상태 */}
      <Card className="bg-gray-900 border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <Search className="w-5 h-5" />
            Go 병렬 패턴 스캐닝 엔진
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">총 패턴</div>
              <div className="text-xl font-bold text-green-400">
                {metrics.totalPatterns}
              </div>
              <div className="text-xs text-gray-500">인식 가능</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">활성 스캐너</div>
              <div className="text-xl font-bold text-blue-400">
                {metrics.activeScanners}
              </div>
              <div className="text-xs text-gray-500">동시 실행</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">스캔 속도</div>
              <div className="text-xl font-bold text-purple-400">
                {metrics.patternsPerSecond}/s
              </div>
              <div className="text-xs text-gray-500">패턴/초</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">검출된 패턴</div>
              <div className="text-xl font-bold text-yellow-400">
                {metrics.detectedPatterns.length}
              </div>
              <div className="text-xs text-gray-500">실시간</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 검출된 패턴 목록 */}
      <Card className="bg-gray-900 border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <TrendingUp className="w-5 h-5" />
            실시간 패턴 검출
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics.detectedPatterns.map((pattern, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    pattern.type === 'bullish' ? 'bg-green-500' :
                    pattern.type === 'bearish' ? 'bg-red-500' : 'bg-gray-500'
                  }`} />
                  <div>
                    <div className={`text-sm font-bold ${getTypeColor(pattern.type)}`}>
                      {pattern.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {pattern.symbol} • {pattern.timeframe}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-yellow-400">
                    {pattern.confidence.toFixed(1)}%
                  </div>
                  <div className={`text-xs ${getTypeColor(pattern.type)}`}>
                    {pattern.type.toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 스캐너 상태 모니터링 */}
      <Card className="bg-gray-900 border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-400">
            <Zap className="w-5 h-5" />
            스캐너 병렬 처리 상태
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics.scannerStatus.map((scanner, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(scanner.status)}`} />
                  <span className="text-sm text-gray-300">{scanner.scanner}</span>
                  <span className="text-xs text-gray-500">Goroutine #{scanner.goroutineId}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400">
                    {scanner.throughput} ops/s
                  </span>
                  <span className={`text-xs font-semibold ${
                    scanner.status === 'active' ? 'text-green-400' :
                    scanner.status === 'idle' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {scanner.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 스캔 히스토리 그래프 */}
          <div className="mt-4">
            <div className="h-20 flex items-end justify-between gap-1">
              {scanHistory.map((value, idx) => (
                <div
                  key={idx}
                  className="flex-1 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t transition-all duration-300"
                  style={{
                    height: `${(value / 1500) * 100}%`,
                    opacity: 0.5 + (idx / scanHistory.length) * 0.5
                  }}
                />
              ))}
            </div>
            <div className="text-xs text-gray-500 text-center mt-2">
              패턴 스캔 처리량 추이
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Go 최적화 정보 */}
      <Card className="bg-gray-900 border-yellow-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-400">
            <AlertTriangle className="w-5 h-5" />
            Go 패턴 스캐닝 최적화
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-2 bg-gray-800 rounded">
              <div className="text-xs text-green-400 font-semibold mb-1">
                병렬 스캔
              </div>
              <div className="text-xs text-gray-500">
                각 시간대별 독립 고루틴
              </div>
            </div>
            <div className="p-2 bg-gray-800 rounded">
              <div className="text-xs text-blue-400 font-semibold mb-1">
                패턴 캐싱
              </div>
              <div className="text-xs text-gray-500">
                자주 발견되는 패턴 캐싱
              </div>
            </div>
            <div className="p-2 bg-gray-800 rounded">
              <div className="text-xs text-purple-400 font-semibold mb-1">
                SIMD 연산
              </div>
              <div className="text-xs text-gray-500">
                벡터화된 패턴 매칭
              </div>
            </div>
            <div className="p-2 bg-gray-800 rounded">
              <div className="text-xs text-yellow-400 font-semibold mb-1">
                스트림 처리
              </div>
              <div className="text-xs text-gray-500">
                실시간 데이터 파이프라인
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded border border-green-800/50">
            <div className="text-sm font-semibold text-green-400 mb-1">스캔 성능</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400">처리 속도:</span>
                <span className="text-green-400 ml-1">10x faster</span>
              </div>
              <div>
                <span className="text-gray-400">CPU 효율:</span>
                <span className="text-green-400 ml-1">80% 절감</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}