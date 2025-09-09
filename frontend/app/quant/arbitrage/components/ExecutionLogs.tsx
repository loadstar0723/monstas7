'use client'

import { useState, useEffect } from 'react'

interface ExecutionLogsProps {
  selectedCoin: {
    symbol: string
    name: string
    color: string
    bgColor: string
  }
  botStatus: 'running' | 'paused' | 'stopped' | 'initializing'
}

interface LogEntry {
  id: string
  timestamp: Date
  type: 'info' | 'success' | 'warning' | 'error'
  category: 'system' | 'trade' | 'api' | 'risk'
  message: string
  details?: any
}

export default function ExecutionLogs({ selectedCoin, botStatus }: ExecutionLogsProps) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filter, setFilter] = useState<'all' | 'trade' | 'system' | 'error'>('all')
  const [autoScroll, setAutoScroll] = useState(true)
  
  // 로그 생성 시뮬레이션
  useEffect(() => {
    if (botStatus === 'running') {
      const logInterval = setInterval(() => {
        generateLog()
      }, 2000 + Math.random() * 3000) // 2-5초마다
      
      return () => clearInterval(logInterval)
    }
  }, [botStatus, selectedCoin])
  
  const generateLog = () => {
    const logTypes = [
      {
        type: 'info' as const,
        category: 'system' as const,
        messages: [
          `${selectedCoin.symbol} 가격 업데이트 수신`,
          'WebSocket 연결 상태 정상',
          '시스템 상태 체크 완료',
          'API Rate Limit: 85% 사용'
        ]
      },
      {
        type: 'success' as const,
        category: 'trade' as const,
        messages: [
          `차익거래 기회 발견: ${selectedCoin.symbol} Binance→Upbit 0.3%`,
          `주문 실행 성공: 매수 ${selectedCoin.symbol} $98,000`,
          `주문 실행 성공: 매도 ${selectedCoin.symbol} $98,300`,
          `수익 실현: +$15.50 (0.25%)`
        ]
      },
      {
        type: 'warning' as const,
        category: 'risk' as const,
        messages: [
          '슬리피지 경고: 0.15% 초과',
          '포지션 크기 한도 근접: 85%',
          '일일 손실 한도 50% 도달',
          'API 응답 지연: 2.5초'
        ]
      },
      {
        type: 'error' as const,
        category: 'api' as const,
        messages: [
          'API 호출 실패: 타임아웃',
          '주문 거부: 잔액 부족',
          'WebSocket 연결 끊김',
          '가격 데이터 불일치 감지'
        ]
      }
    ]
    
    const randomLog = logTypes[Math.floor(Math.random() * logTypes.length)]
    const message = randomLog.messages[Math.floor(Math.random() * randomLog.messages.length)]
    
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      type: randomLog.type,
      category: randomLog.category,
      message,
      details: randomLog.category === 'trade' ? {
        coin: selectedCoin.symbol,
        price: selectedCoin.symbol === 'BTC' ? 98000 : 3500,
        amount: 0.01 + Math.random() * 0.1,
        exchange: ['Binance', 'Upbit', 'Coinbase'][Math.floor(Math.random() * 3)]
      } : undefined
    }
    
    setLogs(prev => [newLog, ...prev.slice(0, 99)]) // 최대 100개 로그 유지
  }
  
  // 초기 로그 생성
  useEffect(() => {
    const initialLogs: LogEntry[] = [
      {
        id: '1',
        timestamp: new Date(),
        type: 'info',
        category: 'system',
        message: '차익거래 봇 시스템 초기화 완료'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 5000),
        type: 'success',
        category: 'system',
        message: `${selectedCoin.name} 봇 설정 로드 완료`
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 10000),
        type: 'info',
        category: 'api',
        message: 'Binance API 연결 성공'
      }
    ]
    setLogs(initialLogs)
  }, [selectedCoin])
  
  // 필터링된 로그
  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true
    if (filter === 'trade') return log.category === 'trade'
    if (filter === 'system') return log.category === 'system' || log.category === 'api'
    if (filter === 'error') return log.type === 'error' || log.type === 'warning'
    return true
  })
  
  const filters = [
    { value: 'all' as const, label: '전체', count: logs.length },
    { value: 'trade' as const, label: '거래', count: logs.filter(l => l.category === 'trade').length },
    { value: 'system' as const, label: '시스템', count: logs.filter(l => l.category === 'system' || l.category === 'api').length },
    { value: 'error' as const, label: '오류', count: logs.filter(l => l.type === 'error' || l.type === 'warning').length }
  ]
  
  return (
    <div className="space-y-6">
      {/* 로그 필터 및 제어 */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                filter === f.value
                  ? `${selectedCoin.bgColor} ${selectedCoin.color} border border-current`
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <span>{f.label}</span>
              <span className="text-xs bg-gray-900/50 px-2 py-0.5 rounded">
                {f.count}
              </span>
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              autoScroll
                ? 'bg-green-500/20 text-green-400'
                : 'bg-gray-700 text-gray-400'
            }`}
          >
            자동 스크롤 {autoScroll ? 'ON' : 'OFF'}
          </button>
          
          <button
            onClick={() => setLogs([])}
            className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-sm transition-colors"
          >
            로그 삭제
          </button>
        </div>
      </div>
      
      {/* 로그 통계 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">정보</div>
          <div className="text-xl font-bold text-blue-400">
            {logs.filter(l => l.type === 'info').length}
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">성공</div>
          <div className="text-xl font-bold text-green-400">
            {logs.filter(l => l.type === 'success').length}
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">경고</div>
          <div className="text-xl font-bold text-yellow-400">
            {logs.filter(l => l.type === 'warning').length}
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">오류</div>
          <div className="text-xl font-bold text-red-400">
            {logs.filter(l => l.type === 'error').length}
          </div>
        </div>
      </div>
      
      {/* 로그 목록 */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h4 className="font-semibold text-gray-300">실행 로그</h4>
        </div>
        
        <div className="max-h-96 overflow-y-auto p-4 space-y-2 font-mono text-xs">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              로그가 없습니다
            </div>
          ) : (
            filteredLogs.map(log => (
              <div
                key={log.id}
                className={`flex gap-3 py-2 border-b border-gray-800 last:border-0 ${
                  log.type === 'error' ? 'bg-red-900/10' :
                  log.type === 'warning' ? 'bg-yellow-900/10' :
                  log.type === 'success' ? 'bg-green-900/10' :
                  ''
                }`}
              >
                {/* 타임스탬프 */}
                <span className="text-gray-500 w-20">
                  {log.timestamp.toLocaleTimeString('ko-KR', { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit' 
                  })}
                </span>
                
                {/* 타입 아이콘 */}
                <span className="w-4">
                  {log.type === 'info' ? '📘' :
                   log.type === 'success' ? '✅' :
                   log.type === 'warning' ? '⚠️' :
                   '❌'}
                </span>
                
                {/* 카테고리 */}
                <span className={`w-16 text-xs px-2 py-0.5 rounded ${
                  log.category === 'trade' ? 'bg-purple-500/20 text-purple-400' :
                  log.category === 'system' ? 'bg-blue-500/20 text-blue-400' :
                  log.category === 'api' ? 'bg-green-500/20 text-green-400' :
                  'bg-orange-500/20 text-orange-400'
                }`}>
                  {log.category}
                </span>
                
                {/* 메시지 */}
                <span className="flex-1 text-gray-300">
                  {log.message}
                </span>
                
                {/* 상세 정보 */}
                {log.details && (
                  <span className="text-gray-500">
                    [{log.details.exchange}: {log.details.amount?.toFixed(4)} {log.details.coin}]
                  </span>
                )}
              </div>
            ))
          )}
        </div>
        
        {/* 로그 푸터 */}
        <div className="p-3 border-t border-gray-700 text-center">
          <span className="text-xs text-gray-500">
            {botStatus === 'running' ? '실시간 로그 수신 중...' :
             botStatus === 'paused' ? '일시 정지됨' :
             '봇이 정지됨'}
          </span>
        </div>
      </div>
      
      {/* 로그 내보내기 */}
      <div className="flex justify-end gap-2">
        <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg text-sm transition-colors">
          CSV 내보내기
        </button>
        <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg text-sm transition-colors">
          JSON 내보내기
        </button>
      </div>
    </div>
  )
}