'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  FaInfoCircle, FaChartLine, FaBalanceScale, FaCrosshairs,
  FaFire, FaGraduationCap, FaCheckCircle, FaExclamationTriangle,
  FaArrowUp, FaArrowDown, FaTachometerAlt, FaBook
} from 'react-icons/fa'

interface OFIDynamicGuideProps {
  tabId: string
  currentImbalance?: number
  buyVolume?: number
  sellVolume?: number
  delta?: number
  cvd?: number
  price?: number
}

export default function OFIDynamicGuide({
  tabId,
  currentImbalance = 0,
  buyVolume = 0,
  sellVolume = 0,
  delta = 0,
  cvd = 0,
  price = 0
}: OFIDynamicGuideProps) {
  
  // 시장 상태 판단
  const marketBias = currentImbalance > 0.3 ? 'bullish' : currentImbalance < -0.3 ? 'bearish' : 'neutral'
  const volumeRatio = buyVolume > 0 ? buyVolume / (buyVolume + sellVolume) : 0.5
  const deltaTrend = delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral'
  
  // 탭별 동적 콘텐츠
  const getTabContent = () => {
    switch(tabId) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* OFI 개념 설명 */}
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-500/30">
              <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                <FaBook className="w-5 h-5" />
                Order Flow Imbalance (OFI) 완벽 가이드
              </h3>
              
              <div className="space-y-4 text-gray-300">
                <div>
                  <h4 className="text-lg font-semibold text-purple-300 mb-2">📊 OFI란 무엇인가?</h4>
                  <p className="text-sm leading-relaxed">
                    Order Flow Imbalance는 매수 주문과 매도 주문 간의 불균형을 측정하는 고급 시장 미시구조 지표입니다. 
                    주문 흐름의 방향성과 강도를 파악하여 단기 가격 움직임을 예측하는 데 사용됩니다.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-purple-300 mb-2">🔍 OFI 계산 방법</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">•</span>
                      <span><strong>기본 공식:</strong> OFI = (Bid Volume - Ask Volume) / Total Volume</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">•</span>
                      <span><strong>가중 OFI:</strong> 가격 레벨별 가중치를 적용한 정교한 계산</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">•</span>
                      <span><strong>누적 OFI:</strong> 시간에 따른 OFI 값의 누적으로 트렌드 파악</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-purple-300 mb-2">📈 OFI 해석 방법</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-green-900/20 p-3 rounded-lg border border-green-500/30">
                      <p className="text-green-400 font-semibold text-sm mb-1">양의 OFI (+)</p>
                      <p className="text-xs text-gray-300">
                        매수 압력이 우세하여 가격 상승 가능성이 높음
                      </p>
                    </div>
                    <div className="bg-red-900/20 p-3 rounded-lg border border-red-500/30">
                      <p className="text-red-400 font-semibold text-sm mb-1">음의 OFI (-)</p>
                      <p className="text-xs text-gray-300">
                        매도 압력이 우세하여 가격 하락 가능성이 높음
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-purple-300 mb-2">⚡ OFI 활용 전략</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <FaCheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                      <div>
                        <strong>트렌드 확인:</strong> OFI와 가격이 같은 방향 = 트렌드 지속
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FaCheckCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
                      <div>
                        <strong>다이버전스:</strong> OFI와 가격이 반대 방향 = 반전 가능성
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FaCheckCircle className="w-4 h-4 text-purple-400 mt-0.5" />
                      <div>
                        <strong>극단값:</strong> OFI {'>'} ±0.7 = 과매수/과매도 상태
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 현재 시장 분석 */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
                <FaTachometerAlt className="w-5 h-5" />
                실시간 OFI 분석
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">현재 OFI</p>
                  <p className={`text-2xl font-bold ${currentImbalance > 0 ? 'text-green-400' : currentImbalance < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    {currentImbalance.toFixed(3)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">시장 편향</p>
                  <p className={`text-lg font-semibold ${marketBias === 'bullish' ? 'text-green-400' : marketBias === 'bearish' ? 'text-red-400' : 'text-gray-400'}`}>
                    {marketBias === 'bullish' ? '매수 우세' : marketBias === 'bearish' ? '매도 우세' : '중립'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">볼륨 비율</p>
                  <p className="text-lg font-semibold text-purple-400">
                    {(volumeRatio * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">델타 트렌드</p>
                  <p className={`text-lg font-semibold flex items-center justify-center gap-1 ${deltaTrend === 'positive' ? 'text-green-400' : deltaTrend === 'negative' ? 'text-red-400' : 'text-gray-400'}`}>
                    {deltaTrend === 'positive' ? <FaArrowUp /> : deltaTrend === 'negative' ? <FaArrowDown /> : '-'}
                    {Math.abs(delta).toFixed(0)}
                  </p>
                </div>
              </div>

              {/* 실시간 권장사항 */}
              <div className="mt-4 p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
                <p className="text-sm text-purple-300 font-semibold mb-2">💡 현재 권장 전략</p>
                <p className="text-xs text-gray-300">
                  {marketBias === 'bullish' 
                    ? '매수 압력이 강합니다. 상승 모멘텀을 활용한 롱 포지션을 고려하되, 과매수 구간 주의가 필요합니다.'
                    : marketBias === 'bearish'
                    ? '매도 압력이 강합니다. 하락 모멘텀을 활용한 숏 포지션을 고려하되, 과매도 구간에서는 반등 주의가 필요합니다.'
                    : '시장이 균형 상태입니다. 명확한 방향성이 나타날 때까지 관망하거나 레인지 트레이딩 전략을 고려하세요.'}
                </p>
              </div>
            </div>
          </div>
        )

      case 'orderflow':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-xl p-6 border border-blue-500/30">
              <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
                <FaChartLine className="w-5 h-5" />
                오더 플로우 실시간 분석
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-md font-semibold text-cyan-300 mb-2">📊 주문 흐름 패턴 분석</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">누적 델타</p>
                      <p className={`text-xl font-bold ${cvd > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {cvd.toFixed(0)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {cvd > 0 ? '매수 누적 우세' : '매도 누적 우세'}
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">순간 델타</p>
                      <p className={`text-xl font-bold ${delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {delta.toFixed(0)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {Math.abs(delta) > 1000 ? '강한 흐름' : '약한 흐름'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-semibold text-cyan-300 mb-2">🎯 주요 시그널</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className={`mt-1 ${cvd > 0 && delta > 0 ? 'text-green-400' : 'text-gray-400'}`}>●</span>
                      <div>
                        <strong>Aggressive Buying:</strong> 공격적 매수세가 {cvd > 0 && delta > 0 ? '감지됨' : '약함'}
                        {cvd > 0 && delta > 0 && <span className="text-xs text-green-400 ml-2">✓ 롱 시그널</span>}
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className={`mt-1 ${cvd < 0 && delta < 0 ? 'text-red-400' : 'text-gray-400'}`}>●</span>
                      <div>
                        <strong>Aggressive Selling:</strong> 공격적 매도세가 {cvd < 0 && delta < 0 ? '감지됨' : '약함'}
                        {cvd < 0 && delta < 0 && <span className="text-xs text-red-400 ml-2">✓ 숏 시그널</span>}
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className={`mt-1 ${Math.abs(currentImbalance) > 0.5 ? 'text-yellow-400' : 'text-gray-400'}`}>●</span>
                      <div>
                        <strong>Imbalance Alert:</strong> {Math.abs(currentImbalance) > 0.5 ? '불균형 심화 중' : '균형 상태'}
                        {Math.abs(currentImbalance) > 0.5 && <span className="text-xs text-yellow-400 ml-2">⚠ 주의 필요</span>}
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                  <p className="text-sm text-blue-300 font-semibold mb-2">💡 트레이딩 인사이트</p>
                  <p className="text-xs text-gray-300">
                    {cvd > 1000 && delta > 500 
                      ? '강한 매수 흐름이 지속되고 있습니다. 추세 추종 전략이 유효하며, 단기 조정 시 추가 매수 기회를 노려보세요.'
                      : cvd < -1000 && delta < -500
                      ? '강한 매도 흐름이 지속되고 있습니다. 하락 추세를 활용한 숏 포지션이 유효하며, 반등 시도는 매도 기회로 활용하세요.'
                      : Math.abs(cvd) < 500
                      ? '주문 흐름이 균형을 이루고 있습니다. 명확한 방향성 확립까지 대기하거나 스캘핑 전략을 고려하세요.'
                      : '주문 흐름에 변화가 감지됩니다. 추세 전환 가능성을 염두에 두고 포지션 조정을 준비하세요.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'imbalance':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-xl p-6 border border-yellow-500/30">
              <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
                <FaBalanceScale className="w-5 h-5" />
                매수/매도 불균형 분석
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-md font-semibold text-orange-300 mb-2">⚖️ 불균형 지표</h4>
                  <div className="relative">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-red-400">매도 우세</span>
                      <span className="text-xs text-gray-400">균형</span>
                      <span className="text-xs text-green-400">매수 우세</span>
                    </div>
                    <div className="h-8 bg-gradient-to-r from-red-500 via-gray-500 to-green-500 rounded-full relative">
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"
                        style={{ left: `${(currentImbalance + 1) * 50}%`, transform: 'translateX(-50%) translateY(-50%)' }}
                      />
                    </div>
                    <p className="text-center mt-2 text-sm font-semibold text-gray-300">
                      현재 불균형: {(currentImbalance * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-semibold text-orange-300 mb-2">📈 불균형 레벨 해석</h4>
                  <div className="space-y-2">
                    <div className={`p-3 rounded-lg ${Math.abs(currentImbalance) < 0.3 ? 'bg-gray-800/50 border border-gray-600' : 'bg-gray-900/30'}`}>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-300">균형 구간 (±30%)</span>
                        {Math.abs(currentImbalance) < 0.3 && <FaCheckCircle className="text-green-400" />}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">레인지 거래 적합, 브레이크아웃 대기</p>
                    </div>
                    <div className={`p-3 rounded-lg ${Math.abs(currentImbalance) >= 0.3 && Math.abs(currentImbalance) < 0.7 ? 'bg-yellow-900/30 border border-yellow-600' : 'bg-gray-900/30'}`}>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-yellow-300">불균형 구간 (30-70%)</span>
                        {Math.abs(currentImbalance) >= 0.3 && Math.abs(currentImbalance) < 0.7 && <FaExclamationTriangle className="text-yellow-400" />}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">트렌드 형성 중, 추세 추종 전략 유효</p>
                    </div>
                    <div className={`p-3 rounded-lg ${Math.abs(currentImbalance) >= 0.7 ? 'bg-red-900/30 border border-red-600' : 'bg-gray-900/30'}`}>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-red-300">극단 불균형 (70%+)</span>
                        {Math.abs(currentImbalance) >= 0.7 && <FaExclamationTriangle className="text-red-400" />}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">반전 가능성 높음, 역추세 진입 준비</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
                  <p className="text-sm text-yellow-300 font-semibold mb-2">🎯 불균형 트레이딩 전략</p>
                  <p className="text-xs text-gray-300">
                    {Math.abs(currentImbalance) < 0.3
                      ? '시장이 균형 상태입니다. 불균형이 발생하는 방향으로의 브레이크아웃을 기다리세요. 가격 범위의 상단/하단에서 반대 포지션을 고려할 수 있습니다.'
                      : Math.abs(currentImbalance) < 0.7
                      ? `${currentImbalance > 0 ? '매수' : '매도'} 압력이 우세합니다. 현재 추세 방향으로 포지션을 유지하되, 불균형이 극단으로 치달을 경우 부분 익절을 고려하세요.`
                      : `극단적 ${currentImbalance > 0 ? '매수' : '매도'} 불균형입니다. 반전 가능성이 높으므로 역추세 포지션 진입을 준비하세요. 단, 명확한 반전 신호 확인 후 진입하는 것이 안전합니다.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'footprint':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-cyan-900/20 to-teal-900/20 rounded-xl p-6 border border-cyan-500/30">
              <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
                <FaCrosshairs className="w-5 h-5" />
                풋프린트 차트 분석
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-md font-semibold text-teal-300 mb-2">🎯 풋프린트 패턴 인식</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">P 패턴</p>
                      <p className="text-sm text-green-400">상승 반전 시그널</p>
                      <p className="text-xs text-gray-400 mt-1">하단에서 매수량 증가</p>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">b 패턴</p>
                      <p className="text-sm text-red-400">하락 반전 시그널</p>
                      <p className="text-xs text-gray-400 mt-1">상단에서 매도량 증가</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-semibold text-teal-300 mb-2">📊 델타 분석</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded">
                      <span className="text-gray-300">현재 델타</span>
                      <span className={`font-bold ${delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {delta > 0 ? '+' : ''}{delta.toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded">
                      <span className="text-gray-300">델타 누적</span>
                      <span className={`font-bold ${cvd > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {cvd > 0 ? '+' : ''}{cvd.toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded">
                      <span className="text-gray-300">델타 다이버전스</span>
                      <span className="font-bold text-yellow-400">
                        {(delta > 0 && price < 0) || (delta < 0 && price > 0) ? '감지됨' : '없음'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-cyan-900/20 rounded-lg border border-cyan-500/30">
                  <p className="text-sm text-cyan-300 font-semibold mb-2">💡 풋프린트 트레이딩 팁</p>
                  <div className="space-y-2 text-xs text-gray-300">
                    <p>• 고볼륨 노드(HVN)에서 지지/저항 확인</p>
                    <p>• 델타 전환 지점에서 진입 타이밍 포착</p>
                    <p>• 불균형 영역(Imbalance)에서 가격 반응 관찰</p>
                    <p>• POC(Point of Control) 이탈 시 추세 가속 예상</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'heatmap':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 rounded-xl p-6 border border-red-500/30">
              <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                <FaFire className="w-5 h-5" />
                유동성 히트맵 분석
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-md font-semibold text-orange-300 mb-2">🔥 유동성 집중 구역</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-red-900/30 rounded-lg border border-red-500/30">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-red-300">High Liquidity Zone</span>
                        <span className="text-xs text-red-400">🔴 HOT</span>
                      </div>
                      <p className="text-xs text-gray-400">주요 지지/저항 레벨, 대량 주문 대기</p>
                    </div>
                    <div className="p-3 bg-yellow-900/30 rounded-lg border border-yellow-500/30">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-yellow-300">Medium Liquidity Zone</span>
                        <span className="text-xs text-yellow-400">🟡 WARM</span>
                      </div>
                      <p className="text-xs text-gray-400">중간 수준 유동성, 단기 반응 구간</p>
                    </div>
                    <div className="p-3 bg-blue-900/30 rounded-lg border border-blue-500/30">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-blue-300">Low Liquidity Zone</span>
                        <span className="text-xs text-blue-400">🔵 COLD</span>
                      </div>
                      <p className="text-xs text-gray-400">유동성 공백, 급격한 가격 변동 가능</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-semibold text-orange-300 mb-2">📍 현재 가격 위치</h4>
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-300">현재 가격</span>
                      <span className="text-lg font-bold text-white">${price.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {buyVolume > sellVolume * 1.5
                        ? '고유동성 매수 구역 접근 중 - 저항 예상'
                        : sellVolume > buyVolume * 1.5
                        ? '고유동성 매도 구역 접근 중 - 지지 예상'
                        : '중간 유동성 구역 - 정상 거래 진행'}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-orange-900/20 rounded-lg border border-orange-500/30">
                  <p className="text-sm text-orange-300 font-semibold mb-2">🎯 히트맵 활용 전략</p>
                  <p className="text-xs text-gray-300">
                    유동성이 집중된 구역은 주요 전환점이 됩니다. 
                    고유동성 구역에서는 가격이 일시적으로 정체되거나 반전할 가능성이 높으며, 
                    저유동성 구역에서는 슬리피지 주의가 필요합니다. 
                    히트맵 색상 변화를 관찰하여 대량 주문의 이동을 추적하세요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'strategy':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-xl p-6 border border-indigo-500/30">
              <h3 className="text-lg font-bold text-indigo-400 mb-4 flex items-center gap-2">
                <FaGraduationCap className="w-5 h-5" />
                OFI 트레이딩 마스터 전략
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-md font-semibold text-purple-300 mb-2">📚 기본 전략</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                      <p className="text-sm font-semibold text-green-400 mb-1">추세 추종 전략</p>
                      <p className="text-xs text-gray-300">
                        OFI {'>'} 0.3 & CVD 상승 → 롱 포지션<br/>
                        OFI {'<'} -0.3 & CVD 하락 → 숏 포지션
                      </p>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                      <p className="text-sm font-semibold text-yellow-400 mb-1">반전 전략</p>
                      <p className="text-xs text-gray-300">
                        OFI {'>'} 0.7 & 가격 정체 → 숏 준비<br/>
                        OFI {'<'} -0.7 & 가격 정체 → 롱 준비
                      </p>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                      <p className="text-sm font-semibold text-purple-400 mb-1">다이버전스 전략</p>
                      <p className="text-xs text-gray-300">
                        가격 상승 & OFI 하락 → 약세 다이버전스<br/>
                        가격 하락 & OFI 상승 → 강세 다이버전스
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-semibold text-purple-300 mb-2">🎯 고급 전략</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-indigo-900/30 rounded-lg border border-indigo-500/30">
                      <p className="text-sm font-semibold text-indigo-300 mb-1">Iceberg Detection</p>
                      <p className="text-xs text-gray-400">
                        숨겨진 대량 주문 감지 및 추적
                      </p>
                    </div>
                    <div className="p-3 bg-purple-900/30 rounded-lg border border-purple-500/30">
                      <p className="text-sm font-semibold text-purple-300 mb-1">Absorption Analysis</p>
                      <p className="text-xs text-gray-400">
                        매수/매도 흡수 패턴 분석
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-indigo-900/20 rounded-lg border border-indigo-500/30">
                  <p className="text-sm text-indigo-300 font-semibold mb-2">⚡ 실시간 전략 추천</p>
                  <p className="text-xs text-gray-300">
                    {Math.abs(currentImbalance) > 0.7
                      ? `극단적 ${currentImbalance > 0 ? '매수' : '매도'} 불균형 상태입니다. 반전 트레이딩 셋업을 준비하세요. 확인 신호: 1) 가격 정체 2) 볼륨 감소 3) OFI 방향 전환`
                      : Math.abs(currentImbalance) > 0.3
                      ? `${currentImbalance > 0 ? '매수' : '매도'} 압력이 우세합니다. 추세 추종 전략이 유효합니다. 진입: 풀백 시 / 손절: OFI 0 돌파 / 목표: 다음 저항/지지선`
                      : '균형 상태입니다. 브레이크아웃 대기 전략을 사용하세요. OFI가 ±0.3을 돌파하는 방향으로 포지션을 잡으세요.'}
                  </p>
                </div>

                <div>
                  <h4 className="text-md font-semibold text-purple-300 mb-2">⚠️ 리스크 관리</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2 bg-red-900/20 rounded border border-red-500/30">
                      <p className="text-red-300 font-semibold mb-1">손절 규칙</p>
                      <p className="text-gray-400">OFI 반전 시 즉시 청산</p>
                    </div>
                    <div className="p-2 bg-green-900/20 rounded border border-green-500/30">
                      <p className="text-green-300 font-semibold mb-1">익절 규칙</p>
                      <p className="text-gray-400">극단 OFI 도달 시 부분 익절</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {getTabContent()}
    </motion.div>
  )
}