'use client'

import VolumeChart from './VolumeChart'

export default function RealtimeTab({ optionsFlows, volumeHistory, currentPrice, stats }: any) {
  return (
    <div className="space-y-6">
      {/* 볼륨 차트 */}
      <VolumeChart volumeHistory={volumeHistory} />
      
      {/* 실시간 플로우 테이블 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 overflow-x-auto">
        <h3 className="text-lg font-bold mb-4 text-green-400">
          💹 실시간 옵션 플로우
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-2">Type</th>
              <th className="text-left py-2">Strike</th>
              <th className="text-left py-2">Volume</th>
              <th className="text-left py-2">Premium</th>
              <th className="text-left py-2">IV</th>
              <th className="text-left py-2">Delta</th>
              <th className="text-left py-2">Gamma</th>
              <th className="text-left py-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {optionsFlows.slice(0, 15).map((flow: any) => (
              <tr key={flow.id} className="border-b border-gray-700/50">
                <td className={`py-2 ${
                  flow.type === 'CALL' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {flow.type}
                </td>
                <td className="py-2">${flow.strike.toLocaleString()}</td>
                <td className="py-2">{flow.volume.toLocaleString()}</td>
                <td className="py-2">${flow.premium.toLocaleString()}</td>
                <td className="py-2">{flow.iv.toFixed(1)}%</td>
                <td className="py-2">{flow.delta.toFixed(3)}</td>
                <td className="py-2">{flow.gamma.toFixed(4)}</td>
                <td className="py-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    flow.unusualScore > 70 ? 'bg-red-500/20 text-red-400' :
                    flow.unusualScore > 50 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-700 text-gray-400'
                  }`}>
                    {flow.unusualScore.toFixed(0)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 시장 포지셔닝 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4 text-blue-400">
          📊 시장 포지셔닝
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-green-400">
              {stats.callVolume?.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-gray-400 mt-1">Call 볼륨</div>
          </div>
          <div className="text-center p-4 bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-red-400">
              {stats.putVolume?.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-gray-400 mt-1">Put 볼륨</div>
          </div>
          <div className="text-center p-4 bg-gray-700/50 rounded-lg">
            <div className={`text-2xl font-bold ${
              stats.putCallRatio > 1 ? 'text-red-400' : 'text-green-400'
            }`}>
              {stats.putCallRatio?.toFixed(2) || '0.00'}
            </div>
            <div className="text-sm text-gray-400 mt-1">P/C Ratio</div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-700/30 rounded-lg">
          <div className="text-sm text-gray-300">
            <span className="font-semibold">시장 해석:</span> 
            {stats.putCallRatio > 1.5 ? ' 🔴 극도의 약세 (헤지 수요 급증)' :
             stats.putCallRatio > 1.0 ? ' 🟡 약세 우세 (하락 베팅 증가)' :
             stats.putCallRatio > 0.7 ? ' 🟢 중립 (균형적 포지션)' :
             ' 🟢 강세 우세 (상승 베팅 증가)'}
          </div>
        </div>
      </div>

      {/* 비정상 거래 감지 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4 text-purple-400">
          🚨 비정상 거래 감지
        </h3>
        <div className="space-y-3">
          {optionsFlows
            .filter((flow: any) => flow.unusualScore > 70)
            .slice(0, 5)
            .map((flow: any) => (
              <div key={flow.id} className="p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`font-semibold ${
                      flow.type === 'CALL' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {flow.type} ${flow.strike}
                    </span>
                    <div className="text-sm text-gray-400 mt-1">
                      Volume: {flow.volume.toLocaleString()} | 
                      Premium: ${(flow.premium * flow.volume).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-400">
                      {flow.unusualScore.toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-400">Score</div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-300">
                  💡 {flow.volume > 10000 ? '대규모 포지션 진입' :
                      flow.iv > 100 ? '극도의 높은 변동성 예상' :
                      flow.type === 'PUT' && flow.strike < currentPrice * 0.9 ? '급락 헤지 포지션' :
                      flow.type === 'CALL' && flow.strike > currentPrice * 1.1 ? '급등 베팅 포지션' :
                      '비정상적 거래 패턴 감지'}
                </div>
              </div>
            ))}
        </div>
        {optionsFlows.filter((flow: any) => flow.unusualScore > 70).length === 0 && (
          <div className="text-center text-gray-500 py-4">
            현재 비정상 거래가 감지되지 않았습니다
          </div>
        )}
      </div>

      {/* 실시간 Greeks 모니터링 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4 text-yellow-400">
          🎯 Greeks 실시간 모니터링
        </h3>
        <div className="grid md:grid-cols-4 gap-3">
          <div className="p-3 bg-gray-700/50 rounded-lg">
            <div className="text-xs text-gray-400">Total Delta</div>
            <div className="text-lg font-bold text-white">
              {optionsFlows.reduce((sum: number, f: any) => 
                sum + (f.type === 'CALL' ? f.delta : -f.delta) * f.volume, 0
              ).toFixed(0)}
            </div>
          </div>
          <div className="p-3 bg-gray-700/50 rounded-lg">
            <div className="text-xs text-gray-400">Total Gamma</div>
            <div className="text-lg font-bold text-white">
              {optionsFlows.reduce((sum: number, f: any) => 
                sum + f.gamma * f.volume, 0
              ).toFixed(0)}
            </div>
          </div>
          <div className="p-3 bg-gray-700/50 rounded-lg">
            <div className="text-xs text-gray-400">Avg IV</div>
            <div className="text-lg font-bold text-white">
              {(optionsFlows.reduce((sum: number, f: any) => sum + f.iv, 0) / 
                optionsFlows.length || 0).toFixed(1)}%
            </div>
          </div>
          <div className="p-3 bg-gray-700/50 rounded-lg">
            <div className="text-xs text-gray-400">Max Pain</div>
            <div className="text-lg font-bold text-white">
              ${(currentPrice * 0.98).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}