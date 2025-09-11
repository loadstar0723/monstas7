'use client'

export default function StrategyTab({ currentPrice, selectedCoin, stats }: any) {
  // 실제 변동성 기반 전략 계산
  const volatility = stats?.avgIV || 30
  const volMultiplier = volatility / 100
  
  const entryPrice = currentPrice
  const stopLoss = currentPrice * (1 - volMultiplier * 0.1)  // 변동성 기반 손절
  const target1 = currentPrice * (1 + volMultiplier * 0.15)  // 변동성 기반 1차 목표
  const target2 = currentPrice * (1 + volMultiplier * 0.3)   // 변동성 기반 2차 목표
  const target3 = currentPrice * (1 + volMultiplier * 0.5)   // 변동성 기반 3차 목표

  return (
    <div className="space-y-6">
      {/* 트레이딩 전략 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-green-400">
          🎯 트레이딩 전략
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-yellow-400 mb-3">롱 포지션 전략</h4>
            <div className="space-y-2 text-sm">
              <div>진입가: ${entryPrice.toLocaleString()}</div>
              <div className="text-red-400">손절가: ${stopLoss.toLocaleString()} (-3%)</div>
              <div className="text-green-400">목표가1: ${target1.toLocaleString()} (+5%)</div>
              <div className="text-green-400">목표가2: ${target2.toLocaleString()} (+10%)</div>
              <div className="text-green-400">목표가3: ${target3.toLocaleString()} (+20%)</div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-red-400 mb-3">숏 포지션 전략</h4>
            <div className="space-y-2 text-sm">
              <div>진입가: ${entryPrice.toLocaleString()}</div>
              <div className="text-red-400">손절가: ${(currentPrice * 1.03).toLocaleString()} (+3%)</div>
              <div className="text-green-400">목표가1: ${(currentPrice * 0.95).toLocaleString()} (-5%)</div>
              <div className="text-green-400">목표가2: ${(currentPrice * 0.90).toLocaleString()} (-10%)</div>
              <div className="text-green-400">목표가3: ${(currentPrice * 0.80).toLocaleString()} (-20%)</div>
            </div>
          </div>
        </div>
      </div>

      {/* 옵션 전략 매트릭스 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-purple-400">
          📊 옵션 전략 매트릭스
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2">전략</th>
                <th className="text-left py-2">시장 전망</th>
                <th className="text-left py-2">최대 이익</th>
                <th className="text-left py-2">최대 손실</th>
                <th className="text-left py-2">손익분기점</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-700/50">
                <td className="py-2 text-green-400">Long Call</td>
                <td className="py-2">강세</td>
                <td className="py-2">무제한</td>
                <td className="py-2">프리미엄</td>
                <td className="py-2">${(currentPrice * 1.02).toFixed(0)}</td>
              </tr>
              <tr className="border-b border-gray-700/50">
                <td className="py-2 text-red-400">Long Put</td>
                <td className="py-2">약세</td>
                <td className="py-2">행사가</td>
                <td className="py-2">프리미엄</td>
                <td className="py-2">${(currentPrice * 0.98).toFixed(0)}</td>
              </tr>
              <tr className="border-b border-gray-700/50">
                <td className="py-2 text-blue-400">Straddle</td>
                <td className="py-2">고변동성</td>
                <td className="py-2">무제한</td>
                <td className="py-2">프리미엄×2</td>
                <td className="py-2">${(currentPrice * 0.95).toFixed(0)}-${(currentPrice * 1.05).toFixed(0)}</td>
              </tr>
              <tr className="border-b border-gray-700/50">
                <td className="py-2 text-yellow-400">Iron Condor</td>
                <td className="py-2">횡보</td>
                <td className="py-2">순프리미엄</td>
                <td className="py-2">스프레드-프리미엄</td>
                <td className="py-2">${(currentPrice * 0.97).toFixed(0)}-${(currentPrice * 1.03).toFixed(0)}</td>
              </tr>
              <tr className="border-b border-gray-700/50">
                <td className="py-2 text-purple-400">Butterfly</td>
                <td className="py-2">저변동성</td>
                <td className="py-2">제한적</td>
                <td className="py-2">순지불액</td>
                <td className="py-2">${safePrice(currentPrice, 0)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 리스크 관리 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-red-400">
          ⚠️ 리스크 관리 원칙
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-red-500">🔴</span>
              <span>포지션 크기: 총 자본의 2-5%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-500">🔴</span>
              <span>손절 철저히 지키기 (-3%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-500">🔴</span>
              <span>레버리지 최대 3배 이하</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">⚡</span>
              <span>분할 매수/매도 전략</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">⚡</span>
              <span>변동성 높을 때 포지션 축소</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">⚡</span>
              <span>수익 실현 원칙 준수</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}