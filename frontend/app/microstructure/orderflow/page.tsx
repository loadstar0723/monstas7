'use client'

import { useState } from 'react'
import CoinSelector from '@/components/orderflow/CoinSelector'
import OrderFlowImbalance from '@/components/orderflow/OrderFlowImbalance'
import CumulativeDelta from '@/components/orderflow/CumulativeDelta'
import FootprintChart from '@/components/orderflow/FootprintChart'
import MarketProfile from '@/components/orderflow/MarketProfile'
import VolumeAnalysis from '@/components/orderflow/VolumeAnalysis'
import TradingStrategy from '@/components/orderflow/TradingStrategy'

export default function OrderFlowPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')

  return (
    <div className="min-h-screen bg-gray-950">
      {/* 코인 선택 고정 헤더 */}
      <div className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <CoinSelector 
            selectedSymbol={selectedSymbol}
            onSymbolChange={setSelectedSymbol}
          />
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 페이지 타이틀 및 설명 */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            오더 플로우 분석
          </h1>
          <p className="text-gray-400 text-lg">
            실시간 오더북 임밸런스, 거래량 분석, 풋프린트 차트를 통한 스마트 머니 추적
          </p>
        </div>

        {/* 컴포넌트 그리드 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI 트레이딩 전략 - 전체 너비 */}
          <div className="lg:col-span-2">
            <TradingStrategy symbol={selectedSymbol} />
          </div>

          {/* 오더플로우 임밸런스 */}
          <div>
            <OrderFlowImbalance symbol={selectedSymbol} />
          </div>

          {/* 누적 델타 */}
          <div>
            <CumulativeDelta symbol={selectedSymbol} />
          </div>

          {/* 거래량 분석 */}
          <div>
            <VolumeAnalysis symbol={selectedSymbol} />
          </div>

          {/* 마켓 프로파일 */}
          <div>
            <MarketProfile symbol={selectedSymbol} />
          </div>

          {/* 풋프린트 차트 - 전체 너비 */}
          <div className="lg:col-span-2">
            <FootprintChart symbol={selectedSymbol} />
          </div>
        </div>

        {/* 오더플로우 개념 설명 */}
        <div className="mt-12 bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-3xl">📚</span>
            오더플로우 분석이란?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-2">핵심 개념</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <div>
                    <strong className="text-gray-200">오더플로우 임밸런스 (OFI)</strong>
                    <p>매수/매도 주문의 불균형을 측정하여 가격 방향성 예측</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <div>
                    <strong className="text-gray-200">누적 델타</strong>
                    <p>매수량과 매도량의 누적 차이로 추세 강도 파악</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <div>
                    <strong className="text-gray-200">풋프린트 차트</strong>
                    <p>가격별 거래량 분포를 시각화하여 주요 지지/저항 확인</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <div>
                    <strong className="text-gray-200">마켓 프로파일</strong>
                    <p>POC와 Value Area로 주요 거래 구간 파악</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-2">실전 활용법</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">•</span>
                  <div>
                    <strong className="text-gray-200">스마트 머니 추적</strong>
                    <p>대량 주문의 흐름을 감지하여 기관 움직임 포착</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">•</span>
                  <div>
                    <strong className="text-gray-200">진입/청산 타이밍</strong>
                    <p>임밸런스 전환점에서 포지션 진입 및 청산</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">•</span>
                  <div>
                    <strong className="text-gray-200">리스크 관리</strong>
                    <p>거래량 급증 구간을 파악하여 변동성 대응</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">•</span>
                  <div>
                    <strong className="text-gray-200">다이버전스 활용</strong>
                    <p>가격과 델타의 차이로 추세 전환 신호 포착</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-900/10 border border-yellow-500/20 rounded-lg">
            <p className="text-xs text-yellow-400 flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <span>
                오더플로우 분석은 단기 트레이딩에 유용한 도구이지만, 시장 조작이나 
                알고리즘 거래의 영향을 받을 수 있습니다. 다른 기술적 분석 도구와 
                함께 사용하여 종합적인 판단을 내리시기 바랍니다.
              </span>
            </p>
          </div>

          {/* 활용 팁 */}
          <div className="mt-6 p-4 bg-purple-900/10 border border-purple-500/20 rounded-lg">
            <h4 className="text-sm font-medium text-purple-400 mb-2">💡 프로 트레이더 팁</h4>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>• 오더플로우 임밸런스가 +50% 이상일 때 단기 롱 포지션 고려</li>
              <li>• 누적 델타와 가격의 다이버전스 발생 시 추세 전환 주의</li>
              <li>• 풋프린트 차트의 대량 거래 구간은 주요 지지/저항으로 작용</li>
              <li>• POC 근처에서는 단타 매매, VA 벗어날 때 추세 추종</li>
              <li>• 거래량 폭증 시 변동성 대비 포지션 축소 필수</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}