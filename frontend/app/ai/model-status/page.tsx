'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, AlertCircle, Activity, Brain, TrendingUp, BarChart3, Layers, Target } from 'lucide-react'

interface ModelInfo {
  loaded: boolean
  version: string
  accuracy: number
}

interface ModelStatus {
  total: number
  active: number
  models: {
    [key: string]: ModelInfo
  }
}

const modelIcons: { [key: string]: any } = {
  lstm: Brain,
  gru: Activity,
  xgboost: TrendingUp,
  arima: BarChart3,
  ensemble: Layers,
  neural: Brain,
  lightgbm: Target,
  random_forest: BarChart3,
  pattern_recognition: Target
}

const modelNames: { [key: string]: string } = {
  lstm: 'LSTM (Long Short-Term Memory)',
  gru: 'GRU (Gated Recurrent Unit)',
  xgboost: 'XGBoost (Extreme Gradient Boosting)',
  arima: 'ARIMA (AutoRegressive Integrated Moving Average)',
  ensemble: 'Ensemble Model',
  neural: 'Neural Network',
  lightgbm: 'LightGBM',
  random_forest: 'Random Forest',
  pattern_recognition: 'Pattern Recognition (차트 패턴 인식)'
}

export default function ModelStatusPage() {
  const [status, setStatus] = useState<ModelStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchModelStatus()
    const interval = setInterval(fetchModelStatus, 5000) // 5초마다 업데이트
    return () => clearInterval(interval)
  }, [])

  const fetchModelStatus = async () => {
    try {
      const response = await fetch('/api/go-backend/models/status')
      if (!response.ok) throw new Error('Failed to fetch model status')
      const data = await response.json()
      setStatus(data)
      setError(null)
    } catch (err) {
      setError('서버 연결 실패')
      console.error('Error fetching model status:', err)
    } finally {
      setLoading(false)
    }
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.85) return 'text-green-500'
    if (accuracy >= 0.80) return 'text-blue-500'
    if (accuracy >= 0.75) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getAccuracyBadge = (accuracy: number) => {
    if (accuracy >= 0.85) return 'bg-green-500/10 text-green-500'
    if (accuracy >= 0.80) return 'bg-blue-500/10 text-blue-500'
    if (accuracy >= 0.75) return 'bg-yellow-500/10 text-yellow-500'
    return 'bg-red-500/10 text-red-500'
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-purple-500">AI 모델 상태 로딩 중...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="bg-red-950/20 border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!status) return null

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          AI 모델 상태 모니터
        </h1>
        <Badge className="bg-green-500/10 text-green-500">
          <CheckCircle2 className="h-4 w-4 mr-1" />
          {status.active}/{status.total} 활성
        </Badge>
      </div>

      {/* 전체 상태 카드 */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-400 mb-1">전체 모델</div>
              <div className="text-2xl font-bold text-white">{status.total}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">활성 모델</div>
              <div className="text-2xl font-bold text-green-500">{status.active}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">평균 정확도</div>
              <div className="text-2xl font-bold text-purple-500">
                {(Object.values(status.models).reduce((acc, model) => acc + model.accuracy, 0) / status.total * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 개별 모델 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(status.models).map(([modelKey, model]) => {
          const Icon = modelIcons[modelKey] || Brain
          return (
            <Card key={modelKey} className="bg-gray-900/50 border-gray-800 hover:border-purple-600 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-purple-500" />
                    <CardTitle className="text-sm font-medium text-white">
                      {modelKey.toUpperCase()}
                    </CardTitle>
                  </div>
                  {model.loaded ? (
                    <Badge className="bg-green-500/10 text-green-500 text-xs">
                      활성
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500/10 text-red-500 text-xs">
                      비활성
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-gray-400 line-clamp-2">
                  {modelNames[modelKey]}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">정확도</span>
                    <span className={`text-sm font-bold ${getAccuracyColor(model.accuracy)}`}>
                      {(model.accuracy * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Progress
                    value={model.accuracy * 100}
                    className="h-1.5 bg-gray-800"
                  />
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-xs text-gray-500">버전</span>
                  <span className="text-xs text-gray-400">{model.version}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* JSON 원본 데이터 (디버깅용 - 토글 가능) */}
      <details className="mt-8">
        <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-400">
          원본 JSON 데이터 보기
        </summary>
        <Card className="mt-2 bg-gray-950 border-gray-800">
          <CardContent className="p-4">
            <pre className="text-xs text-gray-400 overflow-auto">
              {JSON.stringify(status, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </details>
    </div>
  )
}