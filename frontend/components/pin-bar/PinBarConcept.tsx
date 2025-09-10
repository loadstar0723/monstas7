'use client'

import { useState } from 'react'
import { FaGraduationCap, FaChartLine, FaLightbulb, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'

export default function PinBarConcept() {
  const [activeTab, setActiveTab] = useState('basic')

  const tabs = [
    { id: 'basic', label: '기본 개념', icon: FaGraduationCap },
    { id: 'types', label: '패턴 유형', icon: FaChartLine },
    { id: 'strategy', label: '트레이딩 전략', icon: FaLightbulb },
    { id: 'rules', label: '주의사항', icon: FaExclamationTriangle },
  ]

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700">
      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-700 p-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                activeTab === tab.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <tab.icon className="text-sm" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="p-6">
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">📍 핀 바(Pin Bar)란?</h3>
              <div className="bg-gray-900/50 rounded-lg p-4 space-y-3">
                <p className="text-gray-300 leading-relaxed">
                  핀 바(Pin Bar)는 <span className="text-purple-400 font-medium">가격 반전을 암시하는 강력한 캔들스틱 패턴</span>입니다. 
                  긴 꼬리(wick/shadow)와 작은 몸통(body)을 가진 캔들로, 피노키오의 긴 코처럼 생겼다고 해서 'Pinocchio Bar'라고도 불립니다.
                </p>
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                  <p className="text-purple-300 text-sm">
                    💡 <strong>핵심 포인트:</strong> 시장이 특정 가격을 거부하고 반대 방향으로 움직일 가능성을 시사합니다.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-white mb-3">🎯 핀 바의 구성 요소</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h5 className="text-purple-400 font-medium mb-2">1. 작은 몸통 (Body)</h5>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• 전체 캔들 범위의 30% 이하</li>
                    <li>• 시가와 종가의 차이가 작음</li>
                    <li>• 캔들 한쪽 끝에 위치</li>
                  </ul>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h5 className="text-purple-400 font-medium mb-2">2. 긴 꼬리 (Wick)</h5>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• 전체 캔들 범위의 60% 이상</li>
                    <li>• 가격 거부를 나타냄</li>
                    <li>• 방향에 따라 의미 다름</li>
                  </ul>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h5 className="text-purple-400 font-medium mb-2">3. 위치 (Location)</h5>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• 지지/저항선 근처</li>
                    <li>• 트렌드 끝자락</li>
                    <li>• 중요 가격대</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-white mb-3">📊 핀 바 형성 원리</h4>
              <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-4">
                <ol className="text-gray-300 space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                    <div>
                      <strong>가격 진입:</strong> 매수/매도 세력이 특정 방향으로 가격을 밀어냄
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                    <div>
                      <strong>거부 반응:</strong> 반대 세력이 강하게 개입하여 가격 거부
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                    <div>
                      <strong>반전 시작:</strong> 가격이 반대 방향으로 급격히 이동
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                    <div>
                      <strong>핀 바 완성:</strong> 긴 꼬리와 작은 몸통의 캔들 형성
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'types' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">📈 핀 바 패턴 유형</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bullish Pin Bar */}
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <h4 className="text-green-400 font-bold text-lg mb-3">🟢 Bullish Pin Bar (상승 반전)</h4>
                <div className="space-y-3">
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <h5 className="text-white font-medium mb-2">특징:</h5>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• 긴 아래 꼬리 (Lower Wick)</li>
                      <li>• 몸통이 캔들 상단에 위치</li>
                      <li>• 하락 추세 끝에서 나타남</li>
                      <li>• 매도 압력 거부 신호</li>
                    </ul>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <h5 className="text-white font-medium mb-2">신뢰도 높은 조건:</h5>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>✅ 지지선 근처에서 형성</li>
                      <li>✅ 이전 캔들이 하락세</li>
                      <li>✅ 거래량 증가 동반</li>
                      <li>✅ 아래 꼬리가 전체의 60% 이상</li>
                    </ul>
                  </div>
                  <div className="bg-green-900/30 rounded-lg p-3">
                    <p className="text-green-300 text-sm">
                      <strong>진입 전략:</strong> 핀 바 고점 돌파 시 매수
                    </p>
                  </div>
                </div>
              </div>

              {/* Bearish Pin Bar */}
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <h4 className="text-red-400 font-bold text-lg mb-3">🔴 Bearish Pin Bar (하락 반전)</h4>
                <div className="space-y-3">
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <h5 className="text-white font-medium mb-2">특징:</h5>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• 긴 위 꼬리 (Upper Wick)</li>
                      <li>• 몸통이 캔들 하단에 위치</li>
                      <li>• 상승 추세 끝에서 나타남</li>
                      <li>• 매수 압력 거부 신호</li>
                    </ul>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <h5 className="text-white font-medium mb-2">신뢰도 높은 조건:</h5>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>✅ 저항선 근처에서 형성</li>
                      <li>✅ 이전 캔들이 상승세</li>
                      <li>✅ 거래량 증가 동반</li>
                      <li>✅ 위 꼬리가 전체의 60% 이상</li>
                    </ul>
                  </div>
                  <div className="bg-red-900/30 rounded-lg p-3">
                    <p className="text-red-300 text-sm">
                      <strong>진입 전략:</strong> 핀 바 저점 하향 돌파 시 매도
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-white mb-3">⚡ 타임프레임별 신뢰도</h4>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">1분 - 5분</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div className="bg-yellow-400 h-2 rounded-full" style={{width: '30%'}}></div>
                      </div>
                      <span className="text-yellow-400 text-sm">낮음</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">15분 - 1시간</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-400 h-2 rounded-full" style={{width: '60%'}}></div>
                      </div>
                      <span className="text-blue-400 text-sm">중간</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">4시간 - 1일</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div className="bg-green-400 h-2 rounded-full" style={{width: '90%'}}></div>
                      </div>
                      <span className="text-green-400 text-sm">높음</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mt-3">
                  💡 타임프레임이 클수록 핀 바 패턴의 신뢰도가 높아집니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'strategy' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">🎯 핀 바 트레이딩 전략</h3>
            
            <div>
              <h4 className="text-lg font-bold text-white mb-3">📍 진입 전략</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                  <h5 className="text-blue-400 font-medium mb-2">공격적 진입</h5>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>✓ 핀 바 형성 직후 즉시 진입</li>
                    <li>✓ 리스크: 높음 / 수익: 높음</li>
                    <li>✓ 스탑로스: 핀 바 꼬리 끝</li>
                    <li>✓ 적합: 경험 많은 트레이더</li>
                  </ul>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                  <h5 className="text-purple-400 font-medium mb-2">보수적 진입</h5>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>✓ 다음 캔들 확인 후 진입</li>
                    <li>✓ 리스크: 낮음 / 수익: 중간</li>
                    <li>✓ 스탑로스: 핀 바 중간점</li>
                    <li>✓ 적합: 초보 트레이더</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-white mb-3">💰 손익비 설정</h4>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <h5 className="text-red-400 font-medium mb-2">스탑로스</h5>
                    <p className="text-gray-300 text-sm">핀 바 꼬리 끝</p>
                    <p className="text-gray-400 text-xs mt-1">또는 ATR × 1.5</p>
                  </div>
                  <div className="text-center">
                    <h5 className="text-yellow-400 font-medium mb-2">목표가 1</h5>
                    <p className="text-gray-300 text-sm">리스크의 1.5배</p>
                    <p className="text-gray-400 text-xs mt-1">부분 익절 50%</p>
                  </div>
                  <div className="text-center">
                    <h5 className="text-green-400 font-medium mb-2">목표가 2</h5>
                    <p className="text-gray-300 text-sm">리스크의 3배</p>
                    <p className="text-gray-400 text-xs mt-1">나머지 청산</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-white mb-3">🔄 포지션 관리</h4>
              <div className="space-y-3">
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h5 className="text-purple-400 font-medium mb-2">진입 시</h5>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• 자본의 1-2%만 리스크 노출</li>
                    <li>• 레버리지는 최대 3배 이하</li>
                    <li>• 여러 타임프레임 확인</li>
                  </ul>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h5 className="text-purple-400 font-medium mb-2">포지션 보유 중</h5>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• 이익 발생 시 스탑로스를 손익분기점으로 이동</li>
                    <li>• 목표가 1 도달 시 50% 부분 익절</li>
                    <li>• 추세 전환 신호 시 즉시 청산</li>
                  </ul>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h5 className="text-purple-400 font-medium mb-2">청산 시</h5>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• 스탑로스 터치 시 무조건 손절</li>
                    <li>• 목표가 도달 시 계획대로 익절</li>
                    <li>• 감정적 판단 배제</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-4 border border-purple-500/30">
              <h4 className="text-purple-400 font-bold mb-2">💡 프로 팁</h4>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>🎯 핀 바는 단독으로 사용하지 말고 다른 지표와 함께 활용</li>
                <li>🎯 주요 지지/저항선에서 형성된 핀 바가 더 신뢰도 높음</li>
                <li>🎯 거래량이 평균보다 높을 때 더 강한 신호</li>
                <li>🎯 뉴스나 이벤트 전후는 핀 바 신호 신뢰도 낮음</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">⚠️ 주의사항 및 리스크 관리</h3>
            
            <div>
              <h4 className="text-lg font-bold text-white mb-3">🚫 핀 바 트레이딩 실패 요인</h4>
              <div className="space-y-3">
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <h5 className="text-red-400 font-medium mb-2">1. 잘못된 핀 바 식별</h5>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>❌ 몸통이 너무 큼 (30% 초과)</li>
                    <li>❌ 꼬리가 너무 짧음 (60% 미만)</li>
                    <li>❌ 중요 가격대가 아닌 곳에서 형성</li>
                    <li>❌ 트렌드 중간에 나타난 패턴</li>
                  </ul>
                </div>
                
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <h5 className="text-red-400 font-medium mb-2">2. 시장 환경 무시</h5>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>❌ 강한 트렌드 중 역방향 핀 바 매매</li>
                    <li>❌ 횡보장에서 핀 바 과신</li>
                    <li>❌ 중요 뉴스 발표 시간 무시</li>
                    <li>❌ 거래량 확인 없이 진입</li>
                  </ul>
                </div>
                
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <h5 className="text-red-400 font-medium mb-2">3. 리스크 관리 실패</h5>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>❌ 스탑로스 미설정</li>
                    <li>❌ 과도한 레버리지 사용</li>
                    <li>❌ 자본 대비 큰 포지션</li>
                    <li>❌ 손실 후 복구 매매</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-white mb-3">✅ 성공적인 핀 바 트레이딩 체크리스트</h4>
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-3 text-gray-300">
                    <FaCheckCircle className="text-green-400" />
                    <span>핀 바 패턴이 정확히 형성되었는가? (몸통 30% 이하, 꼬리 60% 이상)</span>
                  </label>
                  <label className="flex items-center gap-3 text-gray-300">
                    <FaCheckCircle className="text-green-400" />
                    <span>중요 지지/저항선 근처에서 형성되었는가?</span>
                  </label>
                  <label className="flex items-center gap-3 text-gray-300">
                    <FaCheckCircle className="text-green-400" />
                    <span>거래량이 평균 이상인가?</span>
                  </label>
                  <label className="flex items-center gap-3 text-gray-300">
                    <FaCheckCircle className="text-green-400" />
                    <span>다른 기술적 지표가 동일한 신호를 주는가?</span>
                  </label>
                  <label className="flex items-center gap-3 text-gray-300">
                    <FaCheckCircle className="text-green-400" />
                    <span>스탑로스와 목표가를 설정했는가?</span>
                  </label>
                  <label className="flex items-center gap-3 text-gray-300">
                    <FaCheckCircle className="text-green-400" />
                    <span>리스크는 자본의 1-2% 이내인가?</span>
                  </label>
                  <label className="flex items-center gap-3 text-gray-300">
                    <FaCheckCircle className="text-green-400" />
                    <span>감정적으로 안정된 상태인가?</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-white mb-3">📈 성과 개선 팁</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-purple-900/20 rounded-lg p-4">
                  <h5 className="text-purple-400 font-medium mb-2">백테스팅</h5>
                  <p className="text-gray-300 text-sm">
                    과거 차트에서 핀 바 패턴을 찾아 가상 매매를 해보고 승률과 손익비를 계산해보세요.
                  </p>
                </div>
                <div className="bg-purple-900/20 rounded-lg p-4">
                  <h5 className="text-purple-400 font-medium mb-2">매매일지</h5>
                  <p className="text-gray-300 text-sm">
                    모든 핀 바 매매를 기록하고 성공/실패 요인을 분석하여 패턴을 찾으세요.
                  </p>
                </div>
                <div className="bg-purple-900/20 rounded-lg p-4">
                  <h5 className="text-purple-400 font-medium mb-2">복합 전략</h5>
                  <p className="text-gray-300 text-sm">
                    RSI, MACD, 이동평균선 등과 함께 사용하여 신호의 신뢰도를 높이세요.
                  </p>
                </div>
                <div className="bg-purple-900/20 rounded-lg p-4">
                  <h5 className="text-purple-400 font-medium mb-2">인내심</h5>
                  <p className="text-gray-300 text-sm">
                    완벽한 핀 바 설정을 기다리는 인내심이 성공의 열쇠입니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="text-yellow-400 text-xl flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-yellow-400 font-bold mb-2">리스크 경고</h4>
                  <p className="text-gray-300 text-sm">
                    핀 바 패턴도 100% 정확하지 않습니다. 항상 리스크 관리를 우선시하고, 
                    손실을 감당할 수 있는 범위 내에서만 투자하세요. 특히 암호화폐 시장은 
                    변동성이 크므로 더욱 신중한 접근이 필요합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}