'use client'

import React, { useState, useEffect } from 'react'
import { FaUserSecret } from 'react-icons/fa'

export default function InsiderFlowDebug() {
  const [step, setStep] = useState('초기화')
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    console.log('InsiderFlowDebug 컴포넌트 마운트됨')
    setStep('컴포넌트 마운트 완료')
    
    // 3초 후 다음 단계
    setTimeout(() => {
      setStep('대시보드 준비 완료')
    }, 3000)
  }, [])
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-4">
        <FaUserSecret className="inline mr-3 text-yellow-400" />
        내부자 거래 추적 - 디버그 모드
      </h1>
      
      <div className="bg-gray-800 p-6 rounded-lg mb-4">
        <h2 className="text-xl mb-2">현재 상태:</h2>
        <p className="text-lg">{step}</p>
      </div>
      
      {error && (
        <div className="bg-red-800 p-6 rounded-lg mb-4">
          <h2 className="text-xl mb-2">에러 발생:</h2>
          <p>{error}</p>
        </div>
      )}
      
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl mb-2">시스템 정보:</h2>
        <ul className="space-y-2">
          <li>✅ React 컴포넌트 로드됨</li>
          <li>✅ 기본 UI 렌더링 완료</li>
          <li>⏳ WebSocket 연결 대기 중...</li>
        </ul>
      </div>
    </div>
  )
}