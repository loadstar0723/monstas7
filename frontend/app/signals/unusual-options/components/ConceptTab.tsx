'use client'

export default function ConceptTab() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* 옵션 기초 개념 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-blue-400">
          📖 옵션 거래 기초
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-green-400 mb-2">CALL 옵션</h4>
            <p className="text-sm text-gray-300">
              특정 가격에 매수할 권리. 가격 상승 예상 시 구매
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-red-400 mb-2">PUT 옵션</h4>
            <p className="text-sm text-gray-300">
              특정 가격에 매도할 권리. 가격 하락 예상 시 구매
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-yellow-400 mb-2">Strike Price</h4>
            <p className="text-sm text-gray-300">
              옵션 행사가격. 매수/매도 권리를 행사할 수 있는 가격
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-purple-400 mb-2">Expiry</h4>
            <p className="text-sm text-gray-300">
              옵션 만기일. 이 날짜까지만 권리 행사 가능
            </p>
          </div>
        </div>
      </div>

      {/* Greeks 설명 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-purple-400">
          🎯 옵션 Greeks
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Delta (Δ)</span>
            <span className="text-sm text-gray-300">가격 민감도</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Gamma (Γ)</span>
            <span className="text-sm text-gray-300">Delta 변화율</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Theta (Θ)</span>
            <span className="text-sm text-gray-300">시간 가치 감소</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Vega (ν)</span>
            <span className="text-sm text-gray-300">변동성 민감도</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Rho (ρ)</span>
            <span className="text-sm text-gray-300">금리 민감도</span>
          </div>
        </div>
      </div>
    </div>
  )
}