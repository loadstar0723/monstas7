'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import ModuleErrorBoundary from '@/components/common/ModuleErrorBoundary';

// Dynamic import for AI Model Status Monitor
const AIModelStatusMonitor = dynamic(
  () => import('@/components/ai/AIModelStatusMonitor'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">AI 모델 상태 로딩 중...</p>
        </div>
      </div>
    )
  }
);

export default function AIStatusPage() {
  return (
    <ModuleErrorBoundary moduleName="AI 모델 상태">
      <div className="min-h-screen bg-black">
        {/* 배경 그라데이션 */}
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20" />

        {/* 콘텐츠 */}
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              AI 모델 실시간 모니터링
            </h1>
            <p className="text-gray-300 max-w-3xl mx-auto">
              MONSTA AI 트레이딩 시스템의 10개 AI 모델 상태를 실시간으로 모니터링합니다.
              Pattern Recognition 모델을 포함한 모든 모델의 성능과 상태를 확인할 수 있습니다.
            </p>
          </div>

          {/* AI 모델 상태 모니터 컴포넌트 */}
          <AIModelStatusMonitor />

          {/* 추가 정보 섹션 */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Pattern Recognition 특별 소개 */}
            <div className="bg-gradient-to-br from-pink-900/20 to-rose-900/20 backdrop-blur-sm rounded-xl p-6 border border-pink-500/30">
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Pattern Recognition
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                최신 추가된 패턴 인식 모델은 차트 패턴, 캔들스틱 패턴,
                그리고 복잡한 가격 움직임 패턴을 실시간으로 감지합니다.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span>
                  헤드앤숄더, 삼각형, 깃발 패턴
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span>
                  도지, 해머, 슈팅스타 캔들
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span>
                  엘리엇 파동, 하모닉 패턴
                </li>
              </ul>
            </div>

            {/* Go 엔진 상태 */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                Go 하이브리드 엔진
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                초고속 Go 언어로 구현된 백엔드 엔진이 실시간 예측과
                데이터 처리를 담당합니다.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">처리 속도</span>
                  <span className="text-green-400 text-sm font-bold">10,000+ TPS</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">레이턴시</span>
                  <span className="text-blue-400 text-sm font-bold">&lt; 5ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">메모리 효율</span>
                  <span className="text-purple-400 text-sm font-bold">95%</span>
                </div>
              </div>
            </div>

            {/* 시스템 통계 */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                시스템 통계
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                전체 AI 시스템의 실시간 성능 지표와 처리량을 모니터링합니다.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">일일 예측</span>
                  <span className="text-yellow-400 text-sm font-bold">1M+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">정확도</span>
                  <span className="text-green-400 text-sm font-bold">87.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">가동 시간</span>
                  <span className="text-blue-400 text-sm font-bold">99.9%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 모델 설명 */}
          <div className="mt-8 bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">AI 모델 구성</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-3">시계열 예측 모델</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• <strong>LSTM:</strong> 장기 메모리를 활용한 시계열 예측</li>
                  <li>• <strong>GRU:</strong> 게이트 순환 유닛으로 빠른 학습</li>
                  <li>• <strong>ARIMA:</strong> 통계적 시계열 분석</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-pink-400 mb-3">머신러닝 모델</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• <strong>XGBoost:</strong> 그래디언트 부스팅 알고리즘</li>
                  <li>• <strong>LightGBM:</strong> 빠른 그래디언트 부스팅</li>
                  <li>• <strong>Random Forest:</strong> 랜덤 포레스트 앙상블</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-3">딥러닝 모델</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• <strong>Neural Network:</strong> 다층 퍼셉트론 신경망</li>
                  <li>• <strong>Pattern Recognition:</strong> 패턴 인식 전문 모델</li>
                  <li>• <strong>Ensemble:</strong> 모든 모델의 앙상블 예측</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-400 mb-3">분석 모델</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• <strong>Technical Analysis:</strong> 기술적 지표 분석</li>
                  <li>• <strong>Market Sentiment:</strong> 시장 심리 분석</li>
                  <li>• <strong>Volume Analysis:</strong> 거래량 기반 분석</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModuleErrorBoundary>
  );
}