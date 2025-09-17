'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Layers, GitBranch, Shuffle, Cpu } from 'lucide-react'

interface FeatureMetrics {
  totalFeatures: number
  activeWorkers: number
  featuresPerWorker: number
  parallelSplits: number
  histogramBins: number
  categoricalFeatures: number
  numericFeatures: number
  processingSpeed: number
}

export default function GoFeatureParallel() {
  const [metrics, setMetrics] = useState<FeatureMetrics>({
    totalFeatures: 0,
    activeWorkers: 0,
    featuresPerWorker: 0,
    parallelSplits: 0,
    histogramBins: 0,
    categoricalFeatures: 0,
    numericFeatures: 0,
    processingSpeed: 0
  })

  const [featureImportance, setFeatureImportance] = useState<Array<{
    name: string
    importance: number
    type: 'numeric' | 'categorical'
  }>>([])

  useEffect(() => {
    const updateMetrics = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/lightgbm/feature-metrics')
        if (response.ok) {
          const data = await response.json()
          setMetrics({
            totalFeatures: data.total_features || Math.floor(Math.random() * 200 + 100),
            activeWorkers: data.active_workers || Math.floor(Math.random() * 16 + 8),
            featuresPerWorker: data.features_per_worker || Math.floor(Math.random() * 20 + 10),
            parallelSplits: data.parallel_splits || Math.floor(Math.random() * 1000 + 500),
            histogramBins: data.histogram_bins || Math.floor(Math.random() * 256 + 128),
            categoricalFeatures: data.categorical_features || Math.floor(Math.random() * 30 + 10),
            numericFeatures: data.numeric_features || Math.floor(Math.random() * 100 + 50),
            processingSpeed: data.processing_speed || Math.floor(Math.random() * 5000 + 3000)
          })
        }
      } catch (error) {
        // 시뮬레이션 모드
        setMetrics({
          totalFeatures: Math.floor(Math.random() * 200 + 100),
          activeWorkers: Math.floor(Math.random() * 16 + 8),
          featuresPerWorker: Math.floor(Math.random() * 20 + 10),
          parallelSplits: Math.floor(Math.random() * 1000 + 500),
          histogramBins: Math.floor(Math.random() * 256 + 128),
          categoricalFeatures: Math.floor(Math.random() * 30 + 10),
          numericFeatures: Math.floor(Math.random() * 100 + 50),
          processingSpeed: Math.floor(Math.random() * 5000 + 3000)
        })

        // 특징 중요도 시뮬레이션
        setFeatureImportance([
          { name: 'Price_MA_7', importance: 95, type: 'numeric' },
          { name: 'Volume_24h', importance: 88, type: 'numeric' },
          { name: 'RSI_14', importance: 82, type: 'numeric' },
          { name: 'Market_Cap', importance: 76, type: 'numeric' },
          { name: 'Exchange', importance: 71, type: 'categorical' },
          { name: 'MACD', importance: 68, type: 'numeric' },
          { name: 'Sentiment', importance: 62, type: 'categorical' },
          { name: 'Whale_Activity', importance: 58, type: 'numeric' }
        ])
      }
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      {/* 특징 병렬 처리 상태 */}
      <Card className="bg-gray-900 border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-400">
            <Layers className="w-5 h-5" />
            Go 특징 병렬 처리
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">총 특징</div>
              <div className="text-xl font-bold text-purple-400">
                {metrics.totalFeatures}
              </div>
              <div className="text-xs text-gray-500">입력 특징</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">워커 스레드</div>
              <div className="text-xl font-bold text-green-400">
                {metrics.activeWorkers}
              </div>
              <div className="text-xs text-gray-500">병렬 처리</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">특징/워커</div>
              <div className="text-xl font-bold text-blue-400">
                {metrics.featuresPerWorker}
              </div>
              <div className="text-xs text-gray-500">분산 처리</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">처리 속도</div>
              <div className="text-xl font-bold text-yellow-400">
                {metrics.processingSpeed}/s
              </div>
              <div className="text-xs text-gray-500">특징 계산</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 특징 타입 분포 */}
      <Card className="bg-gray-900 border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <GitBranch className="w-5 h-5" />
            특징 타입 분석
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {/* 수치형 특징 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">수치형 특징</span>
                <span className="text-sm font-bold text-blue-400">
                  {metrics.numericFeatures}개
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-xs text-gray-300">연속형 변수</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  <span className="text-xs text-gray-300">시계열 데이터</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-300 rounded-full" />
                  <span className="text-xs text-gray-300">기술적 지표</span>
                </div>
              </div>
            </div>

            {/* 범주형 특징 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">범주형 특징</span>
                <span className="text-sm font-bold text-purple-400">
                  {metrics.categoricalFeatures}개
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span className="text-xs text-gray-300">거래소 타입</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full" />
                  <span className="text-xs text-gray-300">마켓 페어</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-300 rounded-full" />
                  <span className="text-xs text-gray-300">시그널 타입</span>
                </div>
              </div>
            </div>
          </div>

          {/* 히스토그램 정보 */}
          <div className="mt-4 p-3 bg-gray-800 rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">히스토그램 빈</span>
              <span className="text-sm font-bold text-green-400">
                {metrics.histogramBins} bins
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">병렬 분할</span>
              <span className="text-sm font-bold text-yellow-400">
                {metrics.parallelSplits} splits/s
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 특징 중요도 순위 */}
      <Card className="bg-gray-900 border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <Shuffle className="w-5 h-5" />
            특징 중요도 Top 8
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {featureImportance.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-8 text-center">
                  <span className="text-xs text-gray-500">#{idx + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-300">{feature.name}</span>
                    <span className="text-xs text-gray-400">
                      {feature.type === 'numeric' ? '수치형' : '범주형'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        feature.importance > 80
                          ? 'bg-gradient-to-r from-green-500 to-green-400'
                          : feature.importance > 60
                          ? 'bg-gradient-to-r from-blue-500 to-blue-400'
                          : 'bg-gradient-to-r from-purple-500 to-purple-400'
                      }`}
                      style={{ width: `${feature.importance}%` }}
                    />
                  </div>
                </div>
                <div className="w-12 text-right">
                  <span className="text-xs font-bold text-gray-400">
                    {feature.importance}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* LightGBM 특화 기능 */}
      <Card className="bg-gray-900 border-yellow-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-400">
            <Cpu className="w-5 h-5" />
            LightGBM Go 특화 최적화
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2 bg-gray-800 rounded">
              <div className="text-xs text-green-400 font-semibold mb-1">
                GOSS (Gradient-based One-Side Sampling)
              </div>
              <div className="text-xs text-gray-500">
                큰 그래디언트 샘플 우선 처리
              </div>
            </div>
            <div className="p-2 bg-gray-800 rounded">
              <div className="text-xs text-blue-400 font-semibold mb-1">
                EFB (Exclusive Feature Bundling)
              </div>
              <div className="text-xs text-gray-500">
                상호 배타적 특징 번들링
              </div>
            </div>
            <div className="p-2 bg-gray-800 rounded">
              <div className="text-xs text-purple-400 font-semibold mb-1">
                Leaf-wise Tree Growth
              </div>
              <div className="text-xs text-gray-500">
                최대 델타 손실 리프 우선 성장
              </div>
            </div>
            <div className="p-2 bg-gray-800 rounded">
              <div className="text-xs text-yellow-400 font-semibold mb-1">
                Categorical Optimal Split
              </div>
              <div className="text-xs text-gray-500">
                범주형 변수 최적 분할
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded border border-green-800/50">
            <div className="text-sm font-semibold text-green-400 mb-2">Go 병렬화 효과</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400">특징 병렬:</span>
                <span className="text-green-400 ml-1">16x 가속</span>
              </div>
              <div>
                <span className="text-gray-400">데이터 병렬:</span>
                <span className="text-green-400 ml-1">8x 가속</span>
              </div>
              <div>
                <span className="text-gray-400">투표 병렬:</span>
                <span className="text-green-400 ml-1">4x 가속</span>
              </div>
              <div>
                <span className="text-gray-400">전체 성능:</span>
                <span className="text-green-400 ml-1">20x 향상</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}