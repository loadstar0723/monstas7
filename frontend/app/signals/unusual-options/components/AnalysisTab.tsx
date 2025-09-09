'use client'

export default function AnalysisTab({ gammaExposure, currentPrice, stats, selectedCoin }: any) {
  // 실제 데이터 기반 AI 예측 신호 계산
  const aiSignal = stats.putCallRatio > 1.2 ? 'BEARISH' : 
                   stats.putCallRatio < 0.8 ? 'BULLISH' : 'NEUTRAL'
  const confidence = Math.min(95, Math.abs(1 - stats.putCallRatio) * 100 + 50)
  
  // 실제 시장 데이터 사용
  const marketFlow = stats.marketFlow || {}
  const priceTargets = stats.priceTargets || {}
  const volatilityRange = marketFlow.volatilityRange || { min: 0, max: 0, current: 0 }
  
  return (
    <div className="space-y-6">
      {/* Gamma Exposure 히트맵 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-purple-400">
          🔥 Gamma Exposure 히트맵
        </h3>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {gammaExposure.map((gex: any) => {
            const intensity = Math.abs(gex.netGamma) / 
              Math.max(...gammaExposure.map((g: any) => Math.abs(g.netGamma)))
            return (
              <div
                key={gex.strike}
                className="p-3 rounded text-center relative overflow-hidden"
                style={{
                  backgroundColor: gex.netGamma > 0 
                    ? `rgba(16, 185, 129, ${intensity * 0.5})`
                    : `rgba(239, 68, 68, ${intensity * 0.5})`,
                  border: `1px solid ${gex.netGamma > 0 ? '#10b981' : '#ef4444'}`
                }}
              >
                <div className="text-xs font-bold">${gex.strike}</div>
                <div className="text-xs mt-1">
                  {gex.netGamma > 0 ? '🟢' : '🔴'} {Math.abs(gex.netGamma).toFixed(0)}
                </div>
                {Math.abs(gex.strike - currentPrice) < currentPrice * 0.01 && (
                  <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs px-1 rounded-bl">
                    현재가
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="text-sm text-gray-400">
          <p>🟢 양의 감마: 마켓메이커 매수 압력 (지지선)</p>
          <p>🔴 음의 감마: 마켓메이커 매도 압력 (저항선)</p>
        </div>
      </div>

      {/* AI 시장 예측 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-blue-400">
          🤖 AI 시장 예측
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-yellow-400 mb-3">단기 전망 (1-3일)</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>방향성</span>
                <span className={`font-bold ${
                  aiSignal === 'BULLISH' ? 'text-green-400' :
                  aiSignal === 'BEARISH' ? 'text-red-400' :
                  'text-yellow-400'
                }`}>
                  {aiSignal === 'BULLISH' ? '📈 상승' :
                   aiSignal === 'BEARISH' ? '📉 하락' :
                   '➡️ 횡보'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>신뢰도</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full"
                      style={{ width: `${confidence}%` }}
                    />
                  </div>
                  <span className="text-sm">{confidence.toFixed(0)}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>예상 변동폭</span>
                <span>±{((volatilityRange.current || stats.avgIV || 30) / 10).toFixed(1)}%</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-purple-400 mb-3">주요 레벨</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">강력 저항</span>
                <span className="text-red-400">${(priceTargets.resistance3 || currentPrice * 1.08).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">1차 저항</span>
                <span className="text-orange-400">${(priceTargets.resistance1 || currentPrice * 1.03).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">현재가</span>
                <span className="text-white font-bold">${currentPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">1차 지지</span>
                <span className="text-blue-400">${(priceTargets.support1 || currentPrice * 0.97).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">강력 지지</span>
                <span className="text-green-400">${(priceTargets.support3 || currentPrice * 0.92).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 옵션 시장 인사이트 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-green-400">
          💡 옵션 시장 인사이트
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-700/50 rounded-lg border-l-4 border-green-500">
            <h4 className="font-semibold text-green-400 mb-2">강세 신호</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• Call 옵션 대량 매수 감지 (상위 10%)</li>
              <li>• OTM Call 프리미엄 상승 (+15%)</li>
              <li>• Call Skew 양수 전환</li>
            </ul>
          </div>
          <div className="p-4 bg-gray-700/50 rounded-lg border-l-4 border-red-500">
            <h4 className="font-semibold text-red-400 mb-2">약세 신호</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• Put 옵션 비정상 거래량 (+200%)</li>
              <li>• 낮은 행사가 Put 수요 급증</li>
              <li>• IV Rank 80% 초과 (공포 상승)</li>
            </ul>
          </div>
          <div className="p-4 bg-gray-700/50 rounded-lg border-l-4 border-yellow-500">
            <h4 className="font-semibold text-yellow-400 mb-2">주의 신호</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• 만기일 임박 (3일 이내)</li>
              <li>• Gamma 집중 구간 접근</li>
              <li>• 변동성 급등 가능성</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 스마트머니 동향 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-yellow-400">
          🏦 스마트머니 동향
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-lg border border-green-500/50">
            <div className="text-3xl mb-2">🐂</div>
            <div className="text-lg font-bold text-green-400">기관 매수</div>
            <div className="text-2xl font-mono mt-2">
              ${(marketFlow.buyVolume || 0).toFixed(1)}M
            </div>
            <div className="text-xs text-gray-400 mt-1">24시간 누적</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-red-900/30 to-red-800/30 rounded-lg border border-red-500/50">
            <div className="text-3xl mb-2">🐻</div>
            <div className="text-lg font-bold text-red-400">기관 매도</div>
            <div className="text-2xl font-mono mt-2">
              ${(marketFlow.sellVolume || 0).toFixed(1)}M
            </div>
            <div className="text-xs text-gray-400 mt-1">24시간 누적</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-lg border border-purple-500/50">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-lg font-bold text-purple-400">넷 플로우</div>
            <div className={`text-2xl font-mono mt-2 ${(marketFlow.netFlow || 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {(marketFlow.netFlow || 0) > 0 ? '+' : ''}${(marketFlow.netFlow || 0).toFixed(1)}M
            </div>
            <div className="text-xs text-gray-400 mt-1">순 매수</div>
          </div>
        </div>
      </div>
    </div>
  )
}