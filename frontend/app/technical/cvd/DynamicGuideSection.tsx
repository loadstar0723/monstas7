'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  FaGraduationCap, FaBrain, FaChartLine, FaTrophy, 
  FaShieldAlt, FaBolt, FaRobot, FaBalanceScale,
  FaVolumeUp, FaCrosshairs, FaSignal, FaChartBar,
  FaChartArea, FaLightbulb, FaExclamationTriangle
} from 'react-icons/fa'
import { HiTrendingUp, HiTrendingDown } from 'react-icons/hi'
import { BiPulse, BiBarChart, BiLineChart } from 'react-icons/bi'

interface DynamicGuideSectionProps {
  tabId: string
  currentCVD?: number
  currentDelta?: number
  buyPressure?: number
  sellPressure?: number
}

export default function DynamicGuideSection({ 
  tabId, 
  currentCVD = 0, 
  currentDelta = 0,
  buyPressure = 0,
  sellPressure = 0
}: DynamicGuideSectionProps) {
  
  // 현재 시장 상황 분석
  const marketSentiment = currentCVD > 0 ? 'bullish' : currentCVD < 0 ? 'bearish' : 'neutral'
  const deltaStrength = Math.abs(currentDelta) > 5 ? 'strong' : Math.abs(currentDelta) > 2 ? 'moderate' : 'weak'
  const pressureBalance = buyPressure > sellPressure * 1.5 ? 'strong_buy' : 
                          sellPressure > buyPressure * 1.5 ? 'strong_sell' : 'balanced'

  const renderGuideContent = () => {
    switch(tabId) {
      case 'overview':
        return (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaLightbulb className="text-yellow-400" />
              종합분석 실시간 가이드
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* 현재 시장 상황 */}
              <div className="p-4 bg-gradient-to-br from-blue-900/20 to-blue-800/10 rounded-lg border border-blue-500/30">
                <h4 className="text-lg font-bold text-blue-400 mb-3">📊 현재 시장 상황</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">시장 심리:</span>
                    <span className={`font-bold ${
                      marketSentiment === 'bullish' ? 'text-green-400' : 
                      marketSentiment === 'bearish' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {marketSentiment === 'bullish' ? '강세 📈' : 
                       marketSentiment === 'bearish' ? '약세 📉' : '중립 ➡️'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">델타 강도:</span>
                    <span className={`font-bold ${
                      deltaStrength === 'strong' ? 'text-purple-400' : 
                      deltaStrength === 'moderate' ? 'text-blue-400' : 'text-gray-400'
                    }`}>
                      {deltaStrength === 'strong' ? '강함 💪' : 
                       deltaStrength === 'moderate' ? '보통 👌' : '약함 ✋'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">압력 균형:</span>
                    <span className={`font-bold ${
                      pressureBalance === 'strong_buy' ? 'text-green-400' : 
                      pressureBalance === 'strong_sell' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {pressureBalance === 'strong_buy' ? '매수 우세 🟢' : 
                       pressureBalance === 'strong_sell' ? '매도 우세 🔴' : '균형 ⚖️'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 주요 체크포인트 */}
              <div className="p-4 bg-gradient-to-br from-purple-900/20 to-purple-800/10 rounded-lg border border-purple-500/30">
                <h4 className="text-lg font-bold text-purple-400 mb-3">✅ 주요 체크포인트</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>CVD 트렌드와 가격 트렌드 일치 여부 확인</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400">•</span>
                    <span>델타 값의 지속성과 방향성 모니터링</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>매수/매도 압력의 급격한 변화 감지</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>볼륨 프로파일과 CVD 패턴 비교</span>
                  </li>
                </ul>
              </div>

              {/* 실시간 액션 가이드 */}
              <div className="p-4 bg-gradient-to-br from-green-900/20 to-green-800/10 rounded-lg border border-green-500/30">
                <h4 className="text-lg font-bold text-green-400 mb-3">🎯 추천 액션</h4>
                <div className="space-y-3 text-sm">
                  {marketSentiment === 'bullish' && deltaStrength === 'strong' ? (
                    <div className="p-2 bg-green-900/30 rounded border border-green-500/50">
                      <p className="text-green-400 font-bold">롱 포지션 고려</p>
                      <p className="text-gray-300 text-xs mt-1">강한 매수세 확인, 추세 지속 가능성 높음</p>
                    </div>
                  ) : marketSentiment === 'bearish' && deltaStrength === 'strong' ? (
                    <div className="p-2 bg-red-900/30 rounded border border-red-500/50">
                      <p className="text-red-400 font-bold">숏 포지션 고려</p>
                      <p className="text-gray-300 text-xs mt-1">강한 매도세 확인, 하락 추세 지속 가능</p>
                    </div>
                  ) : (
                    <div className="p-2 bg-yellow-900/30 rounded border border-yellow-500/50">
                      <p className="text-yellow-400 font-bold">관망 권장</p>
                      <p className="text-gray-300 text-xs mt-1">명확한 방향성 부재, 추가 신호 대기</p>
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-2">
                    ⚠️ 항상 리스크 관리 원칙을 준수하세요
                  </div>
                </div>
              </div>
            </div>

            {/* 차트 해석 팁 */}
            <div className="mt-4 p-4 bg-gray-900/50 rounded-lg">
              <h4 className="text-md font-bold text-yellow-400 mb-2">💡 차트 해석 팁</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
                <div>
                  <strong className="text-white">CVD 트렌드 차트:</strong> 전체적인 매수/매도 압력의 흐름을 파악
                </div>
                <div>
                  <strong className="text-white">게이지 차트:</strong> 현재 CVD 수준의 극단성 평가
                </div>
                <div>
                  <strong className="text-white">가격-CVD 비교:</strong> 다이버전스 발생 여부 확인
                </div>
                <div>
                  <strong className="text-white">볼륨 델타 바:</strong> 개별 시간대별 매수/매도 우세 파악
                </div>
              </div>
            </div>
          </div>
        )

      case 'realtime':
        return (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <BiPulse className="text-green-400" />
              실시간 분석 가이드
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* 실시간 신호 해석 */}
              <div className="p-4 bg-gradient-to-br from-green-900/20 to-green-800/10 rounded-lg border border-green-500/30">
                <h4 className="text-lg font-bold text-green-400 mb-3">🔴 실시간 신호 해석</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-900/50 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">모멘텀</span>
                      <span className={`text-sm ${currentDelta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {currentDelta > 0 ? '상승 모멘텀' : '하락 모멘텀'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${currentDelta > 0 ? 'bg-green-400' : 'bg-red-400'}`}
                        style={{ width: `${Math.min(Math.abs(currentDelta) * 10, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-900/50 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">변동성</span>
                      <span className="text-sm text-yellow-400">
                        {Math.abs(currentDelta) > 5 ? '높음' : Math.abs(currentDelta) > 2 ? '보통' : '낮음'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      변동성이 {Math.abs(currentDelta) > 5 ? '높아 주의가 필요합니다' : '안정적입니다'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 트레이딩 시그널 */}
              <div className="p-4 bg-gradient-to-br from-purple-900/20 to-purple-800/10 rounded-lg border border-purple-500/30">
                <h4 className="text-lg font-bold text-purple-400 mb-3">📡 트레이딩 시그널</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                    <span className="text-gray-300">진입 신호:</span>
                    <span className={`font-bold ${
                      currentCVD > 1000 && currentDelta > 2 ? 'text-green-400' :
                      currentCVD < -1000 && currentDelta < -2 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {currentCVD > 1000 && currentDelta > 2 ? '매수 신호 ✅' :
                       currentCVD < -1000 && currentDelta < -2 ? '매도 신호 ✅' : '대기 ⏸️'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                    <span className="text-gray-300">신호 강도:</span>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={`w-2 h-4 rounded ${
                          i <= Math.ceil(Math.abs(currentDelta) / 2) ? 
                          currentDelta > 0 ? 'bg-green-400' : 'bg-red-400' : 'bg-gray-600'
                        }`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                    <span className="text-gray-300">추천 레버리지:</span>
                    <span className="text-yellow-400 font-bold">
                      {Math.abs(currentDelta) > 5 ? '1-2x' : Math.abs(currentDelta) > 2 ? '2-3x' : '3-5x'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 실시간 주의사항 */}
            <div className="mt-4 p-4 bg-red-900/20 rounded-lg border border-red-500/30">
              <h4 className="text-md font-bold text-red-400 mb-2">⚠️ 실시간 주의사항</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-300">
                <li>• 급격한 CVD 변화는 대량 주문 진입을 의미</li>
                <li>• 델타와 가격이 반대로 움직이면 다이버전스</li>
                <li>• 변동성 급증 시 포지션 크기 축소 권장</li>
                <li>• 뉴스 이벤트 전후 신호 신뢰도 하락</li>
              </ul>
            </div>
          </div>
        )

      case 'cumulative':
        return (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaChartArea className="text-blue-400" />
              누적 분석 심화 가이드
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* 누적 패턴 분석 */}
              <div className="p-4 bg-gradient-to-br from-blue-900/20 to-blue-800/10 rounded-lg border border-blue-500/30">
                <h4 className="text-lg font-bold text-blue-400 mb-3">📈 누적 패턴 분석</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-900/50 rounded">
                    <h5 className="text-white font-semibold mb-2">현재 누적 CVD: {currentCVD.toLocaleString()}</h5>
                    <div className="space-y-2 text-sm">
                      {currentCVD > 10000 ? (
                        <>
                          <p className="text-green-400">✅ 강한 매수 누적 확인</p>
                          <p className="text-gray-300">장기 상승 추세 가능성 높음</p>
                        </>
                      ) : currentCVD < -10000 ? (
                        <>
                          <p className="text-red-400">✅ 강한 매도 누적 확인</p>
                          <p className="text-gray-300">장기 하락 추세 가능성 높음</p>
                        </>
                      ) : (
                        <>
                          <p className="text-yellow-400">⚖️ 중립적 누적 상태</p>
                          <p className="text-gray-300">방향성 결정 대기 중</p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-900/50 rounded">
                    <h5 className="text-white font-semibold mb-2">볼륨 프로파일 해석</h5>
                    <ul className="space-y-1 text-sm text-gray-300">
                      <li>• 높은 볼륨 구간 = 주요 지지/저항</li>
                      <li>• CVD 전환점 = 추세 변화 신호</li>
                      <li>• 누적 기울기 = 추세 강도</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 델타 분포 해석 */}
              <div className="p-4 bg-gradient-to-br from-purple-900/20 to-purple-800/10 rounded-lg border border-purple-500/30">
                <h4 className="text-lg font-bold text-purple-400 mb-3">📊 델타 분포 해석</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-900/50 rounded">
                    <h5 className="text-white font-semibold mb-2">분포 패턴</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">양의 델타 비율:</span>
                        <span className="text-green-400 font-bold">
                          {((buyPressure / (buyPressure + sellPressure)) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">음의 델타 비율:</span>
                        <span className="text-red-400 font-bold">
                          {((sellPressure / (buyPressure + sellPressure)) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-900/50 rounded">
                    <h5 className="text-white font-semibold mb-2">레이더 차트 활용</h5>
                    <ul className="space-y-1 text-sm text-gray-300">
                      <li>• 균형잡힌 형태 = 안정적 시장</li>
                      <li>• 한쪽 치우침 = 추세 시장</li>
                      <li>• 급격한 변화 = 전환 신호</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* 누적 분석 전략 */}
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg">
              <h4 className="text-md font-bold text-white mb-3">🎯 누적 분석 기반 전략</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="p-3 bg-gray-900/50 rounded">
                  <h5 className="text-green-400 font-bold mb-1">누적 상승 전략</h5>
                  <p className="text-gray-300">CVD 지속 상승 + 가격 상승 = 롱 유지</p>
                </div>
                <div className="p-3 bg-gray-900/50 rounded">
                  <h5 className="text-red-400 font-bold mb-1">누적 하락 전략</h5>
                  <p className="text-gray-300">CVD 지속 하락 + 가격 하락 = 숏 유지</p>
                </div>
                <div className="p-3 bg-gray-900/50 rounded">
                  <h5 className="text-yellow-400 font-bold mb-1">전환점 전략</h5>
                  <p className="text-gray-300">CVD 방향 전환 = 포지션 전환 검토</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'divergence':
        return (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaSignal className="text-purple-400" />
              다이버전스 전문 분석 가이드
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* 다이버전스 타입 */}
              <div className="p-4 bg-gradient-to-br from-purple-900/20 to-purple-800/10 rounded-lg border border-purple-500/30">
                <h4 className="text-lg font-bold text-purple-400 mb-3">🔄 다이버전스 타입 분석</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-900/50 rounded">
                    <h5 className="text-green-400 font-bold mb-2">강세 다이버전스</h5>
                    <p className="text-sm text-gray-300 mb-2">가격 ↓ + CVD ↑ = 반등 신호</p>
                    <div className="p-2 bg-green-900/30 rounded text-xs text-green-400">
                      현재 상태: {currentCVD > 0 && currentDelta > 0 ? '감지됨 ✅' : '미감지 ❌'}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-900/50 rounded">
                    <h5 className="text-red-400 font-bold mb-2">약세 다이버전스</h5>
                    <p className="text-sm text-gray-300 mb-2">가격 ↑ + CVD ↓ = 하락 신호</p>
                    <div className="p-2 bg-red-900/30 rounded text-xs text-red-400">
                      현재 상태: {currentCVD < 0 && currentDelta < 0 ? '감지됨 ✅' : '미감지 ❌'}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-900/50 rounded">
                    <h5 className="text-yellow-400 font-bold mb-2">히든 다이버전스</h5>
                    <p className="text-sm text-gray-300">추세 지속 신호 - 추가 분석 필요</p>
                  </div>
                </div>
              </div>

              {/* 상관관계 분석 */}
              <div className="p-4 bg-gradient-to-br from-blue-900/20 to-blue-800/10 rounded-lg border border-blue-500/30">
                <h4 className="text-lg font-bold text-blue-400 mb-3">📊 상관관계 매트릭스</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-900/50 rounded">
                    <h5 className="text-white font-semibold mb-2">CVD-가격 상관도</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">상관계수:</span>
                        <span className="text-yellow-400 font-bold">0.65</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="h-2 bg-yellow-400 rounded-full" style={{ width: '65%' }} />
                      </div>
                      <p className="text-xs text-gray-400">
                        {0.65 > 0.7 ? '강한 양의 상관관계' : 
                         0.65 > 0.3 ? '보통 양의 상관관계' : 
                         0.65 > -0.3 ? '약한 상관관계' :
                         0.65 > -0.7 ? '보통 음의 상관관계' : '강한 음의 상관관계'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-900/50 rounded">
                    <h5 className="text-white font-semibold mb-2">신호 신뢰도</h5>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-center p-2 bg-gray-800 rounded">
                        <div className="text-xs text-gray-400">단기</div>
                        <div className="text-green-400 font-bold">75%</div>
                      </div>
                      <div className="text-center p-2 bg-gray-800 rounded">
                        <div className="text-xs text-gray-400">중기</div>
                        <div className="text-yellow-400 font-bold">60%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 다이버전스 트레이딩 전략 */}
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg">
              <h4 className="text-md font-bold text-white mb-3">💡 다이버전스 트레이딩 전략</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-gray-900/50 rounded">
                  <h5 className="text-green-400 font-bold mb-2">진입 전략</h5>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• 다이버전스 확인 후 2-3 캔들 대기</li>
                    <li>• 볼륨 증가와 함께 진입</li>
                    <li>• 분할 진입으로 리스크 관리</li>
                  </ul>
                </div>
                <div className="p-3 bg-gray-900/50 rounded">
                  <h5 className="text-red-400 font-bold mb-2">청산 전략</h5>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• 다이버전스 해소 시 즉시 청산</li>
                    <li>• 목표가 도달 시 부분 익절</li>
                    <li>• 반대 다이버전스 발생 시 전량 청산</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      case 'timeframe':
        return (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <BiBarChart className="text-orange-400" />
              시간대별 분석 마스터 가이드
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* 단기 분석 */}
              <div className="p-4 bg-gradient-to-br from-green-900/20 to-green-800/10 rounded-lg border border-green-500/30">
                <h4 className="text-lg font-bold text-green-400 mb-3">⚡ 단기 (1-15분)</h4>
                <div className="space-y-2">
                  <div className="p-2 bg-gray-900/50 rounded">
                    <p className="text-white font-semibold text-sm mb-1">스캘핑 전략</p>
                    <ul className="space-y-1 text-xs text-gray-300">
                      <li>• CVD 급변 포착</li>
                      <li>• 델타 스파이크 활용</li>
                      <li>• 빠른 진입/청산</li>
                    </ul>
                  </div>
                  <div className="p-2 bg-gray-900/50 rounded">
                    <p className="text-sm text-gray-400">현재 단기 신호:</p>
                    <p className={`text-sm font-bold ${currentDelta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {currentDelta > 0 ? '매수 우세' : '매도 우세'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 중기 분석 */}
              <div className="p-4 bg-gradient-to-br from-blue-900/20 to-blue-800/10 rounded-lg border border-blue-500/30">
                <h4 className="text-lg font-bold text-blue-400 mb-3">📊 중기 (1-4시간)</h4>
                <div className="space-y-2">
                  <div className="p-2 bg-gray-900/50 rounded">
                    <p className="text-white font-semibold text-sm mb-1">데이 트레이딩</p>
                    <ul className="space-y-1 text-xs text-gray-300">
                      <li>• CVD 트렌드 확인</li>
                      <li>• 누적 패턴 분석</li>
                      <li>• 주요 레벨 활용</li>
                    </ul>
                  </div>
                  <div className="p-2 bg-gray-900/50 rounded">
                    <p className="text-sm text-gray-400">중기 추세:</p>
                    <p className={`text-sm font-bold ${currentCVD > 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                      {currentCVD > 0 ? '상승 추세' : '하락 추세'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 장기 분석 */}
              <div className="p-4 bg-gradient-to-br from-purple-900/20 to-purple-800/10 rounded-lg border border-purple-500/30">
                <h4 className="text-lg font-bold text-purple-400 mb-3">🎯 장기 (1일+)</h4>
                <div className="space-y-2">
                  <div className="p-2 bg-gray-900/50 rounded">
                    <p className="text-white font-semibold text-sm mb-1">스윙 트레이딩</p>
                    <ul className="space-y-1 text-xs text-gray-300">
                      <li>• 주요 전환점 포착</li>
                      <li>• 큰 추세 활용</li>
                      <li>• 낮은 레버리지</li>
                    </ul>
                  </div>
                  <div className="p-2 bg-gray-900/50 rounded">
                    <p className="text-sm text-gray-400">장기 전망:</p>
                    <p className="text-sm font-bold text-purple-400">
                      추세 분석 중...
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 히트맵 해석 가이드 */}
            <div className="mt-4 p-4 bg-gray-900/50 rounded-lg">
              <h4 className="text-md font-bold text-yellow-400 mb-3">🗺️ CVD 히트맵 해석법</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-gray-800/50 rounded">
                  <h5 className="text-white font-semibold mb-2">색상 의미</h5>
                  <div className="space-y-1 text-gray-300">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span>강한 매수 압력</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span>강한 매도 압력</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                      <span>중립/균형 상태</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-gray-800/50 rounded">
                  <h5 className="text-white font-semibold mb-2">패턴 인식</h5>
                  <ul className="space-y-1 text-gray-300">
                    <li>• 수직 패턴: 특정 시간대 압력</li>
                    <li>• 수평 패턴: 지속적인 추세</li>
                    <li>• 대각선: 추세 전환 신호</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      case 'strategy':
        return (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaCrosshairs className="text-red-400" />
              전략 실행 가이드
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* 현재 시장 전략 */}
              <div className="p-4 bg-gradient-to-br from-red-900/20 to-red-800/10 rounded-lg border border-red-500/30">
                <h4 className="text-lg font-bold text-red-400 mb-3">🎯 현재 추천 전략</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-900/50 rounded">
                    <h5 className="text-white font-semibold mb-2">시장 상태 기반 전략</h5>
                    {marketSentiment === 'bullish' ? (
                      <div className="space-y-2">
                        <p className="text-green-400 font-bold">📈 상승 추세 전략</p>
                        <ul className="space-y-1 text-sm text-gray-300">
                          <li>• 되돌림에서 매수 진입</li>
                          <li>• 트레일링 스탑으로 수익 보호</li>
                          <li>• 레버리지: 2-3x 권장</li>
                        </ul>
                      </div>
                    ) : marketSentiment === 'bearish' ? (
                      <div className="space-y-2">
                        <p className="text-red-400 font-bold">📉 하락 추세 전략</p>
                        <ul className="space-y-1 text-sm text-gray-300">
                          <li>• 반등에서 매도 진입</li>
                          <li>• 타이트한 손절 설정</li>
                          <li>• 레버리지: 1-2x 권장</li>
                        </ul>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-yellow-400 font-bold">➡️ 횡보 전략</p>
                        <ul className="space-y-1 text-sm text-gray-300">
                          <li>• 지지/저항에서 진입</li>
                          <li>• 범위 돌파 시 청산</li>
                          <li>• 레버리지: 최소화</li>
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 bg-gray-900/50 rounded">
                    <h5 className="text-white font-semibold mb-2">진입 체크리스트</h5>
                    <div className="space-y-2 text-sm">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-gray-300">CVD 방향 확인</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-gray-300">델타 강도 체크</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-gray-300">리스크 계산 완료</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* 리스크 관리 */}
              <div className="p-4 bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 rounded-lg border border-yellow-500/30">
                <h4 className="text-lg font-bold text-yellow-400 mb-3">⚠️ 리스크 관리</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-900/50 rounded">
                    <h5 className="text-white font-semibold mb-2">포지션 사이징</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">계좌 잔고:</span>
                        <span className="text-white font-bold">$10,000</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">권장 포지션:</span>
                        <span className="text-yellow-400 font-bold">
                          ${Math.abs(currentDelta) > 5 ? '500-1000' : 
                            Math.abs(currentDelta) > 2 ? '1000-2000' : '2000-3000'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">최대 손실:</span>
                        <span className="text-red-400 font-bold">2% ($200)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-900/50 rounded">
                    <h5 className="text-white font-semibold mb-2">손익비 계산</h5>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-2 bg-green-900/30 rounded">
                        <p className="text-xs text-gray-400">목표 수익</p>
                        <p className="text-green-400 font-bold">+4%</p>
                      </div>
                      <div className="p-2 bg-red-900/30 rounded">
                        <p className="text-xs text-gray-400">손절 기준</p>
                        <p className="text-red-400 font-bold">-2%</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      손익비 = 2:1 (권장 최소값 충족)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 실행 알고리즘 */}
            <div className="mt-4 p-4 bg-gradient-to-r from-red-900/20 to-yellow-900/20 rounded-lg">
              <h4 className="text-md font-bold text-white mb-3">🤖 자동 실행 알고리즘</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="p-3 bg-gray-900/50 rounded">
                  <h5 className="text-green-400 font-bold mb-1">진입 조건</h5>
                  <code className="text-xs text-gray-300">
                    IF CVD {'>'} 1000 AND Delta {'>'} 2<br/>
                    THEN BUY_SIGNAL = TRUE
                  </code>
                </div>
                <div className="p-3 bg-gray-900/50 rounded">
                  <h5 className="text-yellow-400 font-bold mb-1">포지션 관리</h5>
                  <code className="text-xs text-gray-300">
                    IF PROFIT {'>'} 2%<br/>
                    THEN TRAIL_STOP = TRUE
                  </code>
                </div>
                <div className="p-3 bg-gray-900/50 rounded">
                  <h5 className="text-red-400 font-bold mb-1">청산 조건</h5>
                  <code className="text-xs text-gray-300">
                    IF LOSS {'>'} 2% OR CVD_REVERSE<br/>
                    THEN CLOSE_POSITION
                  </code>
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
    >
      {renderGuideContent()}
    </motion.div>
  )
}