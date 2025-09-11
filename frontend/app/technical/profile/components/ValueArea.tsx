'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  FaLayerGroup, FaArrowUp, FaArrowDown, FaCheckCircle,
  FaExclamationCircle, FaChartArea, FaTachometerAlt
} from 'react-icons/fa'
import { formatPrice, formatPercentage } from '@/lib/formatters'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface VolumeProfileData {
  levels: any[]
  poc: number
  vah: number
  val: number
  totalVolume: number
  buyVolume: number
  sellVolume: number
  hvnLevels: number[]
  lvnLevels: number[]
}

interface ValueAreaProps {
  data: VolumeProfileData | null
  currentPrice: number
}

export default function ValueArea({ data, currentPrice }: ValueAreaProps) {
  // Value Area 분석
  const vaAnalysis = useMemo(() => {
    if (!data) {
      return {
        isInVA: false,
        position: 'unknown',
        vahDistance: 0,
        valDistance: 0,
        pocDistance: 0,
        vaWidth: 0,
        vaWidthPercent: 0,
        pricePositionInVA: 0,
        recommendation: '',
        signals: []
      }
    }
    
    const isInVA = currentPrice >= data.val && currentPrice <= data.vah
    const vahDistance = ((data.vah - currentPrice) / currentPrice) * 100
    const valDistance = ((currentPrice - data.val) / currentPrice) * 100
    const pocDistance = ((currentPrice - data.poc) / currentPrice) * 100
    const vaWidth = data.vah - data.val
    const vaWidthPercent = (vaWidth / data.poc) * 100
    
    let position: 'above' | 'inside' | 'below' = 'inside'
    if (currentPrice > data.vah) position = 'above'
    else if (currentPrice < data.val) position = 'below'
    
    // VA 내부에서의 위치 (0-100%)
    const pricePositionInVA = isInVA 
      ? ((currentPrice - data.val) / vaWidth) * 100
      : position === 'above' ? 100 : 0
    
    // 시그널 생성
    const signals = []
    
    if (position === 'above') {
      signals.push({
        type: 'bullish',
        message: 'VAH 돌파 - 상승 추세 지속 가능',
        strength: vahDistance > 2 ? 'strong' : 'moderate'
      })
    } else if (position === 'below') {
      signals.push({
        type: 'bearish', 
        message: 'VAL 하향 돌파 - 하락 추세 가능',
        strength: valDistance > 2 ? 'strong' : 'moderate'
      })
    } else {
      if (Math.abs(pocDistance) < 1) {
        signals.push({
          type: 'neutral',
          message: 'POC 근처 - 균형 상태',
          strength: 'moderate'
        })
      }
      if (pricePositionInVA > 80) {
        signals.push({
          type: 'caution',
          message: 'VAH 근접 - 저항 주의',
          strength: 'moderate'
        })
      } else if (pricePositionInVA < 20) {
        signals.push({
          type: 'caution',
          message: 'VAL 근접 - 지지 확인 필요',
          strength: 'moderate'
        })
      }
    }
    
    // 추천 전략
    let recommendation = ''
    if (position === 'above' && vahDistance < 3) {
      recommendation = 'VAH 재테스트 시 매수 고려. 상승 추세 지속 가능성 높음.'
    } else if (position === 'below' && valDistance < 3) {
      recommendation = 'VAL 반등 실패 시 추가 하락 주의. 단기 반등 노려볼 수 있음.'
    } else if (isInVA) {
      if (pricePositionInVA > 50) {
        recommendation = 'POC 위에서 거래 중. VAH 돌파 시도 가능성 주시.'
      } else {
        recommendation = 'POC 아래에서 거래 중. VAL 지지 확인 필요.'
      }
    }
    
    return {
      isInVA,
      position,
      vahDistance,
      valDistance,
      pocDistance,
      vaWidth,
      vaWidthPercent,
      pricePositionInVA,
      recommendation,
      signals
    }
  }, [data, currentPrice])
  
  // 차트 데이터 생성
  const chartData = useMemo(() => {
    if (!data || !data.levels) return []
    
    return data.levels.map(level => ({
      price: level.price,
      volume: level.totalVolume,
      buyVolume: level.buyVolume,
      sellVolume: level.sellVolume,
      isInVA: level.price >= data.val && level.price <= data.vah
    }))
  }, [data])
  
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <FaLayerGroup className="text-purple-400" />
        Value Area 상세 분석
      </h3>
      
      {/* 현재 위치 상태 */}
      <div className={`p-4 rounded-lg mb-6 ${
        vaAnalysis.position === 'inside' 
          ? 'bg-purple-900/20 border-purple-700/30'
          : vaAnalysis.position === 'above'
          ? 'bg-green-900/20 border-green-700/30'
          : 'bg-red-900/20 border-red-700/30'
      } border`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">현재 가격 위치</p>
            <p className={`text-2xl font-bold ${
              vaAnalysis.position === 'inside' ? 'text-purple-400' :
              vaAnalysis.position === 'above' ? 'text-green-400' :
              'text-red-400'
            }`}>
              {vaAnalysis.position === 'inside' ? 'Value Area 내부' :
               vaAnalysis.position === 'above' ? 'Value Area 위' :
               'Value Area 아래'}
            </p>
          </div>
          
          {vaAnalysis.isInVA && (
            <div className="text-right">
              <p className="text-sm text-gray-400 mb-1">VA 내 위치</p>
              <div className="flex items-center gap-2">
                <div className="w-32 h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-400"
                    style={{ width: `${vaAnalysis.pricePositionInVA}%` }}
                  />
                </div>
                <span className="text-purple-400 font-bold">
                  {vaAnalysis.pricePositionInVA.toFixed(0)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 주요 지표 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900/50 rounded-lg p-3">
          <p className="text-gray-400 text-xs mb-1">VAH까지</p>
          <p className={`text-lg font-bold ${
            vaAnalysis.vahDistance > 0 ? 'text-green-400' : 'text-gray-400'
          }`}>
            {vaAnalysis.vahDistance > 0 ? '+' : ''}{formatPercentage(vaAnalysis.vahDistance)}%
          </p>
          <p className="text-gray-500 text-xs">
            ${formatPrice(data?.vah || 0)}
          </p>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-3">
          <p className="text-gray-400 text-xs mb-1">VAL부터</p>
          <p className={`text-lg font-bold ${
            vaAnalysis.valDistance > 0 ? 'text-green-400' : 'text-gray-400'
          }`}>
            +{formatPercentage(vaAnalysis.valDistance)}%
          </p>
          <p className="text-gray-500 text-xs">
            ${formatPrice(data?.val || 0)}
          </p>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-3">
          <p className="text-gray-400 text-xs mb-1">POC 거리</p>
          <p className={`text-lg font-bold ${
            Math.abs(vaAnalysis.pocDistance) < 1 ? 'text-yellow-400' :
            vaAnalysis.pocDistance > 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {vaAnalysis.pocDistance > 0 ? '+' : ''}{formatPercentage(vaAnalysis.pocDistance)}%
          </p>
          <p className="text-gray-500 text-xs">
            ${formatPrice(data?.poc || 0)}
          </p>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-3">
          <p className="text-gray-400 text-xs mb-1">VA 너비</p>
          <p className="text-lg font-bold text-purple-400">
            {formatPercentage(vaAnalysis.vaWidthPercent)}%
          </p>
          <p className="text-gray-500 text-xs">
            ${vaAnalysis.vaWidth.toFixed(2)}
          </p>
        </div>
      </div>
      
      {/* Value Area 차트 */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="price"
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              tickFormatter={(value) => formatPrice(value)}
            />
            <YAxis 
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              tickFormatter={(value) => (value / 1000).toFixed(0) + 'K'}
            />
            <Tooltip
              formatter={(value: any) => [value.toFixed(0), 'Volume']}
              labelFormatter={(label) => `$${formatPrice(label)}`}
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
            />
            
            {/* VAH/VAL 라인 */}
            {data && (
              <>
                <ReferenceLine x={data.vah} stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5">
                  <label value="VAH" position="top" fill="#8b5cf6" />
                </ReferenceLine>
                <ReferenceLine x={data.val} stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5">
                  <label value="VAL" position="top" fill="#8b5cf6" />
                </ReferenceLine>
                <ReferenceLine x={data.poc} stroke="#facc15" strokeWidth={2}>
                  <label value="POC" position="top" fill="#facc15" />
                </ReferenceLine>
                <ReferenceLine x={currentPrice} stroke="#ef4444" strokeWidth={2}>
                  <label value="현재" position="top" fill="#ef4444" />
                </ReferenceLine>
              </>
            )}
            
            <Area 
              type="monotone" 
              dataKey="volume" 
              stroke="#8b5cf6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#volumeGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* 시그널 및 추천 */}
      <div className="space-y-4">
        {/* 시그널 */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-3">거래 시그널</h4>
          <div className="space-y-2">
            {vaAnalysis.signals.map((signal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-lg flex items-center gap-3 ${
                  signal.type === 'bullish' ? 'bg-green-900/20 border-green-700/30' :
                  signal.type === 'bearish' ? 'bg-red-900/20 border-red-700/30' :
                  signal.type === 'caution' ? 'bg-yellow-900/20 border-yellow-700/30' :
                  'bg-gray-900/50 border-gray-700'
                } border`}
              >
                {signal.type === 'bullish' ? (
                  <FaArrowUp className="text-green-400" />
                ) : signal.type === 'bearish' ? (
                  <FaArrowDown className="text-red-400" />
                ) : signal.type === 'caution' ? (
                  <FaExclamationCircle className="text-yellow-400" />
                ) : (
                  <FaCheckCircle className="text-gray-400" />
                )}
                
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{signal.message}</p>
                  <p className="text-gray-400 text-xs">
                    신호 강도: {signal.strength === 'strong' ? '강함' : '보통'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* 추천 전략 */}
        {vaAnalysis.recommendation && (
          <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4">
            <p className="text-purple-300 text-sm">
              💡 <strong>추천 전략:</strong> {vaAnalysis.recommendation}
            </p>
          </div>
        )}
        
        {/* Value Area 활용 팁 */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h4 className="font-medium text-white mb-2 flex items-center gap-2">
            <FaChartArea className="text-purple-400" />
            Value Area 활용 팁
          </h4>
          <ul className="space-y-1 text-gray-300 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">•</span>
              <span>VA 내부에서는 평균 회귀 전략이 유효합니다</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">•</span>
              <span>VAH/VAL 돌파 시 추세 전환 가능성을 주시하세요</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">•</span>
              <span>POC는 강력한 자석 역할을 합니다</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">•</span>
              <span>VA 너비가 좁을수록 큰 움직임이 예상됩니다</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}