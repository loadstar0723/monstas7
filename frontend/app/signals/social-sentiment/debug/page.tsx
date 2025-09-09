'use client'

import { useState, useEffect } from 'react'

export default function DebugPage() {
  const [logs, setLogs] = useState<string[]>([])
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`])
  }

  useEffect(() => {
    addLog('페이지 마운트됨')
    
    // API 테스트
    fetch('/api/binance/ticker?symbol=BTCUSDT')
      .then(res => {
        addLog(`API 응답 상태: ${res.status}`)
        return res.json()
      })
      .then(data => {
        addLog(`API 데이터 수신: ${JSON.stringify(data).substring(0, 100)}...`)
      })
      .catch(err => {
        addLog(`API 에러: ${err.message}`)
      })
  }, [])

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-4">디버그 페이지</h1>
      
      <div className="bg-gray-800 p-4 rounded mb-4">
        <h2 className="text-xl font-bold mb-2">환경 정보</h2>
        <p>React 버전: {require('react').version}</p>
        <p>현재 시간: {new Date().toLocaleString('ko-KR')}</p>
        <p>페이지 URL: {typeof window !== 'undefined' ? window.location.href : 'SSR'}</p>
      </div>

      <div className="bg-gray-800 p-4 rounded">
        <h2 className="text-xl font-bold mb-2">로그</h2>
        <div className="space-y-1">
          {logs.map((log, i) => (
            <div key={i} className="text-sm font-mono">{log}</div>
          ))}
        </div>
      </div>
    </div>
  )
}