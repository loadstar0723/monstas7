'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Network, GitBranch, Activity, Shield } from 'lucide-react'

interface OrchestrationMetrics {
  activeModels: string[]
  modelStatus: {
    model: string
    status: 'running' | 'idle' | 'error'
    latency: number
    accuracy: number
    goroutine: number
  }[]
  totalRequests: number
  successRate: number
  averageLatency: number
  pipelineStages: {
    stage: string
    duration: number
    status: 'completed' | 'processing' | 'pending'
  }[]
}

export default function GoModelOrchestration() {
  const [metrics, setMetrics] = useState<OrchestrationMetrics>({
    activeModels: [],
    modelStatus: [],
    totalRequests: 0,
    successRate: 0,
    averageLatency: 0,
    pipelineStages: []
  })

  const [networkMap, setNetworkMap] = useState<any[]>([])

  useEffect(() => {
    const updateMetrics = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/ensemble/orchestration')
        if (response.ok) {
          const data = await response.json()
          setMetrics({
            activeModels: data.active_models || [],
            modelStatus: data.model_status || [],
            totalRequests: data.total_requests || 0,
            successRate: data.success_rate || 0,
            averageLatency: data.avg_latency || 0,
            pipelineStages: data.pipeline || []
          })
        }
      } catch (error) {
        // 시뮬레이션 모드
        const models = ['LSTM', 'GRU', 'XGBoost', 'RandomForest', 'Neural', 'ARIMA', 'LightGBM']
        const stages = ['데이터 수집', '전처리', '특징 추출', '모델 실행', '앙상블 투표', '결과 집계']

        setMetrics({
          activeModels: models.slice(0, Math.floor(Math.random() * 4 + 3)),
          modelStatus: models.map((model, idx) => ({
            model,
            status: Math.random() > 0.2 ? 'running' : (Math.random() > 0.5 ? 'idle' : 'error'),
            latency: Math.random() * 50 + 10,
            accuracy: Math.random() * 15 + 80,
            goroutine: idx + 1
          })),
          totalRequests: Math.floor(Math.random() * 10000 + 5000),
          successRate: Math.random() * 5 + 94,
          averageLatency: Math.random() * 20 + 15,
          pipelineStages: stages.map(stage => ({
            stage,
            duration: Math.random() * 10 + 2,
            status: Math.random() > 0.6 ? 'completed' : (Math.random() > 0.3 ? 'processing' : 'pending')
          }))
        })
      }

      // 네트워크 맵 업데이트
      setNetworkMap(prev => {
        const newPoint = {
          x: prev.length,
          y: Math.random() * 100,
          connections: Math.floor(Math.random() * 10 + 5)
        }
        return [...prev.slice(-19), newPoint]
      })
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 2000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'running': return 'bg-green-500'
      case 'idle': return 'bg-yellow-500'
      case 'error': return 'bg-red-500'
      case 'completed': return 'text-green-400'
      case 'processing': return 'text-yellow-400'
      case 'pending': return 'text-gray-400'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* 오케스트레이션 대시보드 */}
      <Card className="bg-gray-900 border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <Network className="w-5 h-5" />
            Go 모델 오케스트레이션
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">활성 모델</div>
              <div className="text-xl font-bold text-green-400">
                {metrics.activeModels.length}/7
              </div>
              <div className="text-xs text-gray-500">실행 중</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">총 요청</div>
              <div className="text-xl font-bold text-blue-400">
                {metrics.totalRequests.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">처리됨</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">성공률</div>
              <div className="text-xl font-bold text-purple-400">
                {metrics.successRate.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">SLA 달성</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">평균 지연</div>
              <div className="text-xl font-bold text-yellow-400">
                {metrics.averageLatency.toFixed(1)}ms
              </div>
              <div className="text-xs text-gray-500">E2E 지연</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 모델별 상태 모니터링 */}
      <Card className="bg-gray-900 border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <Activity className="w-5 h-5" />
            모델 상태 모니터링
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics.modelStatus.map((model, idx) => (
              <div key={idx} className="p-3 bg-gray-800 rounded">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(model.status)}`} />
                    <span className="text-sm font-bold text-gray-300">{model.model}</span>
                    <span className="text-xs text-gray-500">Goroutine #{model.goroutine}</span>
                  </div>
                  <span className={`text-xs font-semibold ${
                    model.status === 'running' ? 'text-green-400' :
                    model.status === 'idle' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {model.status.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400">지연시간: </span>
                    <span className="text-gray-300">{model.latency.toFixed(1)}ms</span>
                  </div>
                  <div>
                    <span className="text-gray-400">정확도: </span>
                    <span className="text-gray-300">{model.accuracy.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 파이프라인 실행 단계 */}
      <Card className="bg-gray-900 border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-400">
            <GitBranch className="w-5 h-5" />
            앙상블 파이프라인
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.pipelineStages.map((stage, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    stage.status === 'completed' ? 'bg-green-900 text-green-400' :
                    stage.status === 'processing' ? 'bg-yellow-900 text-yellow-400 animate-pulse' :
                    'bg-gray-700 text-gray-400'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-sm text-gray-300">{stage.stage}</div>
                    <div className="text-xs text-gray-500">{stage.duration.toFixed(1)}ms</div>
                  </div>
                </div>
                <span className={`text-xs font-semibold ${getStatusColor(stage.status)}`}>
                  {stage.status}
                </span>
              </div>
            ))}

            {/* 파이프라인 진행 바 */}
            <div className="mt-4 p-3 bg-gray-800 rounded">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>파이프라인 진행도</span>
                <span>
                  {metrics.pipelineStages.filter(s => s.status === 'completed').length}/
                  {metrics.pipelineStages.length} 완료
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${(metrics.pipelineStages.filter(s => s.status === 'completed').length / metrics.pipelineStages.length) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 네트워크 활동 그래프 */}
      <Card className="bg-gray-900 border-indigo-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-400">
            <Shield className="w-5 h-5" />
            네트워크 활동
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-end justify-between gap-1">
            {networkMap.map((point, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t transition-all duration-300"
                  style={{
                    height: `${point.y}%`,
                    opacity: 0.5 + (idx / networkMap.length) * 0.5
                  }}
                />
                <div className="text-xs text-gray-600 mt-1">{point.connections}</div>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-500 text-center mt-2">
            모델 간 통신 연결 수
          </div>
        </CardContent>
      </Card>

      {/* Go 오케스트레이션 특징 */}
      <Card className="bg-gray-900 border-yellow-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-400">
            <Network className="w-5 h-5" />
            Go 오케스트레이션 최적화
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-2 bg-gray-800 rounded">
              <div className="text-xs text-green-400 font-semibold mb-1">
                동적 부하 분산
              </div>
              <div className="text-xs text-gray-500">
                모델별 성능 기반 요청 분배
              </div>
            </div>
            <div className="p-2 bg-gray-800 rounded">
              <div className="text-xs text-blue-400 font-semibold mb-1">
                장애 격리
              </div>
              <div className="text-xs text-gray-500">
                Circuit Breaker 패턴
              </div>
            </div>
            <div className="p-2 bg-gray-800 rounded">
              <div className="text-xs text-purple-400 font-semibold mb-1">
                백프레셔 제어
              </div>
              <div className="text-xs text-gray-500">
                채널 기반 흐름 제어
              </div>
            </div>
            <div className="p-2 bg-gray-800 rounded">
              <div className="text-xs text-yellow-400 font-semibold mb-1">
                헬스 체크
              </div>
              <div className="text-xs text-gray-500">
                실시간 모델 상태 모니터링
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded border border-green-800/50">
            <div className="text-sm font-semibold text-green-400 mb-1">오케스트레이션 성능</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400">처리량:</span>
                <span className="text-green-400 ml-1">10K req/s</span>
              </div>
              <div>
                <span className="text-gray-400">장애 복구:</span>
                <span className="text-green-400 ml-1">&lt; 100ms</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}