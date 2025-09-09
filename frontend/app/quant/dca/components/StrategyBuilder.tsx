'use client'

import { useState } from 'react'
import { FaHammer, FaCalendarAlt, FaDollarSign, FaChartLine, FaCog } from 'react-icons/fa'

interface CoinInfo {
  symbol: string
  fullSymbol: string
  name: string
  color: string
  bgColor: string
}

interface DCASettings {
  interval: string
  amount: number
  startDate: string
  totalBudget: number
  stopLoss: number
  takeProfit: number
  strategy: string
}

interface Props {
  selectedCoin: CoinInfo
  settings: DCASettings
  onSettingsChange: (settings: DCASettings) => void
}

export default function StrategyBuilder({ selectedCoin, settings, onSettingsChange }: Props) {
  const [activeSection, setActiveSection] = useState('basic')

  const updateSetting = (key: keyof DCASettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value })
  }

  const calculateEndDate = () => {
    const totalInvestments = Math.floor(settings.totalBudget / settings.amount)
    const startDate = new Date(settings.startDate)
    
    let endDate = new Date(startDate)
    if (settings.interval === 'daily') {
      endDate.setDate(endDate.getDate() + totalInvestments)
    } else if (settings.interval === 'weekly') {
      endDate.setDate(endDate.getDate() + totalInvestments * 7)
    } else if (settings.interval === 'monthly') {
      endDate.setMonth(endDate.getMonth() + totalInvestments)
    }
    
    return endDate.toISOString().split('T')[0]
  }

  const calculateTotalInvestments = () => {
    return Math.floor(settings.totalBudget / settings.amount)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
          <FaHammer className={`text-lg sm:text-xl ${selectedCoin.color}`} />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">전략 빌더</h2>
          <p className="text-sm sm:text-base text-gray-400">{selectedCoin.name} DCA 전략 설정</p>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl border border-gray-700">
        {/* 섹션 탭 */}
        <div className="flex overflow-x-auto border-b border-gray-700">
          <button
            onClick={() => setActiveSection('basic')}
            className={`flex-1 px-4 py-3 text-sm sm:text-base font-medium transition-colors ${
              activeSection === 'basic'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            기본 설정
          </button>
          <button
            onClick={() => setActiveSection('advanced')}
            className={`flex-1 px-4 py-3 text-sm sm:text-base font-medium transition-colors ${
              activeSection === 'advanced'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            고급 설정
          </button>
          <button
            onClick={() => setActiveSection('summary')}
            className={`flex-1 px-4 py-3 text-sm sm:text-base font-medium transition-colors ${
              activeSection === 'summary'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            요약
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {activeSection === 'basic' && (
            <div className="space-y-6">
              {/* 투자 주기 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FaCalendarAlt className="inline mr-2" />
                  투자 주기
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['daily', 'weekly', 'monthly'].map((interval) => (
                    <button
                      key={interval}
                      onClick={() => updateSetting('interval', interval)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        settings.interval === interval
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {interval === 'daily' ? '일간' : interval === 'weekly' ? '주간' : '월간'}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  {settings.interval === 'daily' ? '매일 투자 (고빈도)' :
                   settings.interval === 'weekly' ? '매주 투자 (균형)' :
                   '매월 투자 (안정적)'}
                </p>
              </div>

              {/* 회당 투자 금액 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FaDollarSign className="inline mr-2" />
                  회당 투자 금액 (USD)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={settings.amount}
                    onChange={(e) => updateSetting('amount', Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    min="1"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-400">USD</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[50, 100, 200, 500].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => updateSetting('amount', amount)}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-300"
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* 시작 날짜 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  시작 날짜
                </label>
                <input
                  type="date"
                  value={settings.startDate}
                  onChange={(e) => updateSetting('startDate', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* 총 투자 예산 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  총 투자 예산 (USD)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={settings.totalBudget}
                    onChange={(e) => updateSetting('totalBudget', Math.max(settings.amount, parseInt(e.target.value) || 0))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    min={settings.amount}
                  />
                  <span className="absolute right-3 top-2.5 text-gray-400">USD</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-400">
                  <div>총 투자 횟수: <span className="text-white">{calculateTotalInvestments()}회</span></div>
                  <div>예상 종료일: <span className="text-white">{calculateEndDate()}</span></div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'advanced' && (
            <div className="space-y-6">
              {/* 전략 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FaCog className="inline mr-2" />
                  투자 전략
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'standard', name: '표준 DCA', desc: '고정 금액 투자' },
                    { id: 'martingale', name: '마틴게일', desc: '하락 시 2배 투자' },
                    { id: 'anti-martingale', name: '역마틴게일', desc: '상승 시 증액 투자' },
                    { id: 'value-averaging', name: '가치 평균법', desc: '목표 가치 기준 투자' }
                  ].map((strategy) => (
                    <button
                      key={strategy.id}
                      onClick={() => updateSetting('strategy', strategy.id)}
                      className={`w-full p-3 rounded-lg border transition-all text-left ${
                        settings.strategy === strategy.id
                          ? 'bg-purple-600/20 border-purple-600'
                          : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'
                      }`}
                    >
                      <div className="font-medium text-white">{strategy.name}</div>
                      <div className="text-xs text-gray-400">{strategy.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 손절/익절 설정 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    손절 라인 (%)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      value={settings.stopLoss}
                      onChange={(e) => updateSetting('stopLoss', parseInt(e.target.value))}
                      className="flex-1"
                      min="0"
                      max="50"
                    />
                    <div className="w-16 text-center">
                      <span className="text-red-400 font-medium">-{settings.stopLoss}%</span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    평균 매수가 대비 {settings.stopLoss}% 하락 시 전량 매도
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    익절 라인 (%)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      value={settings.takeProfit}
                      onChange={(e) => updateSetting('takeProfit', parseInt(e.target.value))}
                      className="flex-1"
                      min="0"
                      max="500"
                    />
                    <div className="w-16 text-center">
                      <span className="text-green-400 font-medium">+{settings.takeProfit}%</span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    평균 매수가 대비 {settings.takeProfit}% 상승 시 전량 매도
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'summary' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg p-4 sm:p-6 border border-purple-600/30">
                <h3 className="text-lg font-semibold text-white mb-4">전략 요약</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">선택 코인</span>
                    <span className={`font-medium ${selectedCoin.color}`}>{selectedCoin.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">투자 주기</span>
                    <span className="text-white font-medium">
                      {settings.interval === 'daily' ? '매일' :
                       settings.interval === 'weekly' ? '매주' : '매월'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">회당 금액</span>
                    <span className="text-white font-medium">${settings.amount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">총 예산</span>
                    <span className="text-white font-medium">${settings.totalBudget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">투자 횟수</span>
                    <span className="text-white font-medium">{calculateTotalInvestments()}회</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">시작일</span>
                    <span className="text-white font-medium">{settings.startDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">종료일</span>
                    <span className="text-white font-medium">{calculateEndDate()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">전략</span>
                    <span className="text-purple-400 font-medium">
                      {settings.strategy === 'standard' ? '표준 DCA' :
                       settings.strategy === 'martingale' ? '마틴게일' :
                       settings.strategy === 'anti-martingale' ? '역마틴게일' : '가치 평균법'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">손절/익절</span>
                    <span className="text-white font-medium">
                      <span className="text-red-400">-{settings.stopLoss}%</span> / 
                      <span className="text-green-400"> +{settings.takeProfit}%</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-lg p-4">
                <h4 className="text-yellow-400 font-semibold mb-2">⚠️ 투자 전 확인사항</h4>
                <ul className="space-y-1 text-xs sm:text-sm text-gray-300">
                  <li>• 투자 금액은 여유 자금만 사용하세요</li>
                  <li>• 시장 상황에 따라 전략 조정이 필요할 수 있습니다</li>
                  <li>• 수수료를 고려하여 투자 금액을 설정하세요</li>
                  <li>• 장기 투자를 위한 인내심이 필요합니다</li>
                </ul>
              </div>

              <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium text-white transition-colors">
                전략 시뮬레이션 시작
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}