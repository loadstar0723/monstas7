'use client'

import { useState } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'

export default function ExecutionTab({ currentPrice, stats }: any) {
  const [checklist, setChecklist] = useState({
    marketAnalysis: false,
    riskAssessment: false,
    positionSize: false,
    entryStrategy: false,
    exitPlan: false,
    confirmation: false
  })

  const handleCheck = (key: string) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const allChecked = Object.values(checklist).every(v => v)

  return (
    <div className="space-y-6">
      {/* 실행 체크리스트 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-blue-400">
          ✅ 실행 전 체크리스트
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={checklist.marketAnalysis}
              onChange={() => handleCheck('marketAnalysis')}
              className="w-5 h-5 rounded border-gray-600 bg-gray-700"
            />
            <span className={checklist.marketAnalysis ? 'text-green-400' : 'text-gray-400'}>
              시장 분석 완료 (Put/Call Ratio: {stats.putCallRatio?.toFixed(2) || '0.00'})
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={checklist.riskAssessment}
              onChange={() => handleCheck('riskAssessment')}
              className="w-5 h-5 rounded border-gray-600 bg-gray-700"
            />
            <span className={checklist.riskAssessment ? 'text-green-400' : 'text-gray-400'}>
              리스크 평가 완료 (최대 손실 계산)
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={checklist.positionSize}
              onChange={() => handleCheck('positionSize')}
              className="w-5 h-5 rounded border-gray-600 bg-gray-700"
            />
            <span className={checklist.positionSize ? 'text-green-400' : 'text-gray-400'}>
              포지션 크기 결정 (자본의 2-5%)
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={checklist.entryStrategy}
              onChange={() => handleCheck('entryStrategy')}
              className="w-5 h-5 rounded border-gray-600 bg-gray-700"
            />
            <span className={checklist.entryStrategy ? 'text-green-400' : 'text-gray-400'}>
              진입 전략 수립 (분할 매수/타이밍)
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={checklist.exitPlan}
              onChange={() => handleCheck('exitPlan')}
              className="w-5 h-5 rounded border-gray-600 bg-gray-700"
            />
            <span className={checklist.exitPlan ? 'text-green-400' : 'text-gray-400'}>
              청산 계획 수립 (손절/익절 설정)
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={checklist.confirmation}
              onChange={() => handleCheck('confirmation')}
              className="w-5 h-5 rounded border-gray-600 bg-gray-700"
            />
            <span className={checklist.confirmation ? 'text-green-400' : 'text-gray-400'}>
              최종 확인 완료
            </span>
          </label>
        </div>
        {allChecked && (
          <div className="mt-4 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-400">
            ✅ 모든 체크리스트 완료! 거래 실행 준비 완료
          </div>
        )}
      </div>

      {/* 실행 계획 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-purple-400">
          🚀 실행 계획
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-700/50 rounded-lg">
            <h4 className="font-semibold text-green-400 mb-2">1단계: 진입</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• 현재가: ${currentPrice.toLocaleString()}</li>
              <li>• 1차 진입: 계획 물량의 30%</li>
              <li>• 2차 진입: -2% 하락 시 30% 추가</li>
              <li>• 3차 진입: -4% 하락 시 40% 추가</li>
            </ul>
          </div>
          <div className="p-4 bg-gray-700/50 rounded-lg">
            <h4 className="font-semibold text-yellow-400 mb-2">2단계: 관리</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• 손절선: -3% (${(currentPrice * 0.97).toLocaleString()})</li>
              <li>• 1차 익절: +5% 물량의 30%</li>
              <li>• 2차 익절: +10% 물량의 30%</li>
              <li>• 3차 익절: +20% 나머지 40%</li>
            </ul>
          </div>
          <div className="p-4 bg-gray-700/50 rounded-lg">
            <h4 className="font-semibold text-red-400 mb-2">3단계: 청산</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• 손절 신호: RSI &lt; 30 + 거래량 급증</li>
              <li>• 익절 신호: RSI &gt; 70 + 거래량 감소</li>
              <li>• 시간 청산: 만기 3일 전 포지션 정리</li>
              <li>• 긴급 청산: 변동성 급증 시</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 실시간 알림 설정 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-orange-400">
          🔔 실시간 알림 설정
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-green-400">가격 알림</h4>
            <div className="text-sm space-y-1">
              <div>• 목표가 도달: ${(currentPrice * 1.05).toLocaleString()}</div>
              <div>• 손절가 접근: ${(currentPrice * 0.98).toLocaleString()}</div>
              <div>• 급등/급락: ±3% 변동</div>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-400">지표 알림</h4>
            <div className="text-sm space-y-1">
              <div>• Put/Call Ratio &gt; 1.5</div>
              <div>• IV Rank &gt; 80%</div>
              <div>• 대규모 포지션 변화</div>
            </div>
          </div>
        </div>
      </div>

      {/* 리스크 경고 */}
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-red-400">
          ⚠️ 리스크 경고
        </h3>
        <div className="space-y-2 text-sm">
          <p>• 옵션 거래는 원금 손실 위험이 있습니다</p>
          <p>• 레버리지 사용 시 손실이 확대될 수 있습니다</p>
          <p>• 시장 상황에 따라 유동성이 부족할 수 있습니다</p>
          <p>• 투자 결정은 본인의 책임하에 신중히 하시기 바랍니다</p>
        </div>
      </div>
    </div>
  )
}