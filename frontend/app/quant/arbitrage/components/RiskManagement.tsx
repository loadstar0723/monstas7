'use client'

import { useState, useEffect } from 'react'
import type { BotConfig } from '../ArbitrageBotModule'

interface RiskManagementProps {
  selectedCoin: {
    symbol: string
    name: string
    color: string
    bgColor: string
  }
  config: BotConfig
  onConfigChange: (config: BotConfig) => void
}

interface RiskMetric {
  name: string
  value: number
  level: 'low' | 'medium' | 'high' | 'critical'
  description: string
}

export default function RiskManagement({ selectedCoin, config, onConfigChange }: RiskManagementProps) {
  const [riskScore, setRiskScore] = useState(35)
  const [activeTab, setActiveTab] = useState<'settings' | 'monitoring' | 'alerts'>('settings')
  const [riskMetrics, setRiskMetrics] = useState<RiskMetric[]>([])
  
  // 리스크 메트릭 계산 - useEffect 내에서만 실행
  useEffect(() => {
    const metrics: RiskMetric[] = [
      {
        name: '포지션 크기 리스크',
        value: (config.maxPosition / 10000) * 100,
        level: config.maxPosition > 5000 ? 'high' : config.maxPosition > 2000 ? 'medium' : 'low',
        description: '거래당 최대 포지션 크기'
      },
      {
        name: '레버리지 리스크',
        value: config.strategy === 'dex-cex' ? 80 : 30,
        level: config.strategy === 'dex-cex' ? 'high' : 'low',
        description: '전략별 레버리지 위험도'
      },
      {
        name: '슬리피지 리스크',
        value: config.slippage * 100,
        level: config.slippage > 0.3 ? 'high' : config.slippage > 0.15 ? 'medium' : 'low',
        description: '가격 슬리피지 허용치'
      },
      {
        name: '자동 실행 리스크',
        value: config.autoExecute ? 70 : 20,
        level: config.autoExecute ? 'medium' : 'low',
        description: '자동 거래 실행 여부'
      },
      {
        name: '손절 설정',
        value: 100 - (config.stopLoss * 10),
        level: config.stopLoss < 2 ? 'high' : config.stopLoss < 5 ? 'medium' : 'low',
        description: '손실 제한 설정'
      }
    ]
    
    // 전체 리스크 점수 계산
    const avgRisk = metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length
    setRiskScore(Math.round(avgRisk))
    setRiskMetrics(metrics)
  }, [config])
  
  const tabs = [
    { id: 'settings' as const, label: '리스크 설정', icon: '⚙️' },
    { id: 'monitoring' as const, label: '실시간 모니터링', icon: '📊' },
    { id: 'alerts' as const, label: '알림 설정', icon: '🔔' }
  ]
  
  return (
    <div className="space-y-6">
      {/* 전체 리스크 점수 */}
      <div className={`p-6 rounded-xl border ${
        riskScore > 70 ? 'bg-red-900/20 border-red-500/30' :
        riskScore > 40 ? 'bg-yellow-900/20 border-yellow-500/30' :
        'bg-green-900/20 border-green-500/30'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              전체 리스크 점수
            </h3>
            <p className="text-sm text-gray-400">
              현재 봇 설정의 종합 리스크 평가
            </p>
          </div>
          <div className="text-center">
            <div className={`text-4xl font-bold ${
              riskScore > 70 ? 'text-red-400' :
              riskScore > 40 ? 'text-yellow-400' :
              'text-green-400'
            }`}>
              {riskScore}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              {riskScore > 70 ? '높음' :
               riskScore > 40 ? '중간' :
               '낮음'}
            </div>
          </div>
        </div>
        
        {/* 리스크 게이지 */}
        <div className="mt-4">
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all ${
                riskScore > 70 ? 'bg-red-400' :
                riskScore > 40 ? 'bg-yellow-400' :
                'bg-green-400'
              }`}
              style={{ width: `${riskScore}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* 탭 네비게이션 */}
      <div className="flex gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? `${selectedCoin.bgColor} ${selectedCoin.color} border border-current`
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      
      {/* 탭 컨텐츠 */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* 리스크 메트릭 */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h4 className="font-semibold text-gray-300 mb-4">리스크 요소 분석</h4>
            
            <div className="space-y-3">
              {riskMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
                  <div className="flex-1">
                    <div className="font-medium text-white">{metric.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{metric.description}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-900/50 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          metric.level === 'critical' ? 'bg-purple-400' :
                          metric.level === 'high' ? 'bg-red-400' :
                          metric.level === 'medium' ? 'bg-yellow-400' :
                          'bg-green-400'
                        }`}
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                    <span className={`text-sm font-medium w-16 text-right ${
                      metric.level === 'critical' ? 'text-purple-400' :
                      metric.level === 'high' ? 'text-red-400' :
                      metric.level === 'medium' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {metric.level === 'critical' ? '심각' :
                       metric.level === 'high' ? '높음' :
                       metric.level === 'medium' ? '중간' :
                       '낮음'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 리스크 한도 설정 */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h4 className="font-semibold text-gray-300 mb-4">리스크 한도 설정</h4>
            
            <div className="space-y-6">
              {/* 일일 최대 손실 */}
              <div>
                <label className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">일일 최대 손실</span>
                  <span className="text-lg font-mono text-red-400">-$500</span>
                </label>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="100"
                  defaultValue="500"
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$100</span>
                  <span>일일 손실 한도</span>
                  <span>$2000</span>
                </div>
              </div>
              
              {/* 최대 동시 포지션 */}
              <div>
                <label className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">최대 동시 포지션</span>
                  <span className="text-lg font-mono text-yellow-400">5개</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  defaultValue="5"
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1개</span>
                  <span>동시 거래 수</span>
                  <span>10개</span>
                </div>
              </div>
              
              {/* 최대 노출 비율 */}
              <div>
                <label className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">최대 자본 노출</span>
                  <span className="text-lg font-mono text-blue-400">30%</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="10"
                  defaultValue="30"
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10%</span>
                  <span>전체 자본 대비</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          {/* 실시간 리스크 지표 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">현재 노출</div>
              <div className="text-2xl font-bold text-yellow-400">
                $3,250
              </div>
              <div className="text-xs text-gray-500 mt-1">
                전체 자본의 32.5%
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">오늘 손실</div>
              <div className="text-2xl font-bold text-red-400">
                -$125
              </div>
              <div className="text-xs text-gray-500 mt-1">
                한도의 25%
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">활성 포지션</div>
              <div className="text-2xl font-bold text-blue-400">
                3 / 5
              </div>
              <div className="text-xs text-gray-500 mt-1">
                60% 사용 중
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">VaR (95%)</div>
              <div className="text-2xl font-bold text-purple-400">
                $450
              </div>
              <div className="text-xs text-gray-500 mt-1">
                95% 신뢰수준
              </div>
            </div>
          </div>
          
          {/* 리스크 히트맵 */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h4 className="font-semibold text-gray-300 mb-4">리스크 히트맵</h4>
            
            <div className="grid grid-cols-5 gap-2">
              {['시장', '유동성', '기술', '운영', '규제'].map((category, i) => (
                <div key={i} className="text-center">
                  <div className={`h-20 rounded-lg mb-2 flex items-center justify-center text-2xl font-bold ${
                    i === 0 ? 'bg-red-500/30 text-red-400' :
                    i === 1 ? 'bg-yellow-500/30 text-yellow-400' :
                    i === 2 ? 'bg-green-500/30 text-green-400' :
                    i === 3 ? 'bg-green-500/30 text-green-400' :
                    'bg-blue-500/30 text-blue-400'
                  }`}>
                    {i === 0 ? '75' :
                     i === 1 ? '45' :
                     i === 2 ? '20' :
                     i === 3 ? '15' :
                     '30'}
                  </div>
                  <div className="text-xs text-gray-400">{category}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {/* 알림 설정 */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h4 className="font-semibold text-gray-300 mb-4">리스크 알림 설정</h4>
            
            <div className="space-y-4">
              {[
                { name: '일일 손실 한도 도달', enabled: true, threshold: '80%' },
                { name: '포지션 크기 초과', enabled: true, threshold: '$5000' },
                { name: '비정상 슬리피지 감지', enabled: false, threshold: '0.5%' },
                { name: '연속 손실 거래', enabled: true, threshold: '3회' },
                { name: '자본 노출 한도 초과', enabled: true, threshold: '50%' },
                { name: 'API 오류 발생', enabled: true, threshold: '즉시' }
              ].map((alert, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
                  <div className="flex-1">
                    <div className="font-medium text-white">{alert.name}</div>
                    <div className="text-xs text-gray-500 mt-1">임계값: {alert.threshold}</div>
                  </div>
                  <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      alert.enabled ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        alert.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* 알림 채널 */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h4 className="font-semibold text-gray-300 mb-4">알림 채널</h4>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">📧</span>
                  <div>
                    <div className="font-medium text-white">이메일</div>
                    <div className="text-xs text-gray-500">user@example.com</div>
                  </div>
                </div>
                <button className="text-sm text-green-400">설정</button>
              </div>
              
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">💬</span>
                  <div>
                    <div className="font-medium text-white">텔레그램</div>
                    <div className="text-xs text-gray-500">@username</div>
                  </div>
                </div>
                <button className="text-sm text-green-400">연결</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}