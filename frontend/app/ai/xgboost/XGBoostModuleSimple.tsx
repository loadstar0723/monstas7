'use client'

import React, { useState, useEffect } from 'react'

export default function XGBoostModuleSimple() {
  const [loading, setLoading] = useState(false)
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [prediction, setPrediction] = useState<any>(null)

  // 백엔드 상태 확인
  useEffect(() => {
    fetch('http://localhost:8093/api/v1/ai/models/status')
      .then(res => res.json())
      .then(data => {
        if (data.xgboost?.active) {
          setBackendStatus('connected')
        } else {
          setBackendStatus('error')
        }
      })
      .catch(() => setBackendStatus('error'))
  }, [])

  // 예측 실행
  const runPrediction = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8093/api/v1/ai/xgboost/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: 'BTCUSDT',
          timeframe: '1h',
          historical: [115000, 115100, 115200, 115300, 115400, 115500],
          features: {
            volume: 250.5,
            high: 116000,
            low: 115000,
            trades: 100,
            volatility: 500,
            trend: 1
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        setPrediction(data)
      }
    } catch (error) {
      console.error('예측 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="bg-gray-900/80 backdrop-blur rounded-xl p-6 mb-6 border border-red-800/30">
          <h1 className="text-3xl font-bold text-white mb-2">
            XGBoost AI 예측 엔진
          </h1>
          <p className="text-gray-400">Go 하이브리드 극한의 그래디언트 부스팅</p>
        </div>

        {/* 백엔드 상태 */}
        <div className="bg-gray-900/60 backdrop-blur rounded-xl p-6 mb-6 border border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">백엔드 연결 상태</h2>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                backendStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                backendStatus === 'checking' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className={`text-sm font-medium ${
                backendStatus === 'connected' ? 'text-green-400' :
                backendStatus === 'checking' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {backendStatus === 'connected' ? 'Go 엔진 연결됨' :
                 backendStatus === 'checking' ? '연결 확인 중...' : '연결 실패'}
              </span>
            </div>
          </div>
        </div>

        {/* 예측 실행 */}
        <div className="bg-gray-900/60 backdrop-blur rounded-xl p-6 mb-6 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">실시간 예측 테스트</h2>

          <button
            onClick={runPrediction}
            disabled={loading || backendStatus !== 'connected'}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              loading || backendStatus !== 'connected'
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-700 hover:to-orange-700'
            }`}
          >
            {loading ? '예측 중...' : 'XGBoost 예측 실행'}
          </button>

          {/* 예측 결과 */}
          {prediction && (
            <div className="mt-6 p-4 bg-black/40 rounded-lg border border-green-800/30">
              <h3 className="text-lg font-semibold text-green-400 mb-2">예측 결과</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">모델:</span>
                  <span className="text-white ml-2">{prediction.model}</span>
                </div>
                <div>
                  <span className="text-gray-400">심볼:</span>
                  <span className="text-white ml-2">{prediction.symbol}</span>
                </div>
                <div>
                  <span className="text-gray-400">현재가:</span>
                  <span className="text-white ml-2">${prediction.current_price?.toFixed(2) || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400">예측가:</span>
                  <span className="text-white ml-2">${prediction.predicted_price?.toFixed(2) || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400">신뢰도:</span>
                  <span className="text-white ml-2">{prediction.confidence?.toFixed(1) || 'N/A'}%</span>
                </div>
                <div>
                  <span className="text-gray-400">추천:</span>
                  <span className={`ml-2 font-semibold ${
                    prediction.action === 'BUY' ? 'text-green-400' :
                    prediction.action === 'SELL' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {prediction.action || prediction.recommendation || 'HOLD'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 시스템 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900/60 backdrop-blur rounded-lg p-4 border border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-gray-400">포트</span>
            </div>
            <p className="text-white">8093</p>
          </div>

          <div className="bg-gray-900/60 backdrop-blur rounded-lg p-4 border border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-gray-400">모델 상태</span>
            </div>
            <p className="text-white">활성화</p>
          </div>

          <div className="bg-gray-900/60 backdrop-blur rounded-lg p-4 border border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-gray-400">엔진</span>
            </div>
            <p className="text-white">Go 하이브리드</p>
          </div>
        </div>
      </div>
    </div>
  )
}