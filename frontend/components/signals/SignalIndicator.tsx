'use client'

import { motion } from 'framer-motion'

interface SignalIndicatorProps {
  signal: 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

/**
 * 5단계 신호등 시스템 컴포넌트
 * 트레이딩 신호를 시각적으로 표현
 */
export default function SignalIndicator({ signal, size = 'md', showLabel = true }: SignalIndicatorProps) {
  const getSignalConfig = () => {
    switch(signal) {
      case 'strong_buy':
        return {
          lights: [true, true, true, true, true],
          color: 'bg-green-500',
          label: '강력 매수',
          emoji: '🚀',
          pulseColor: 'bg-green-400'
        }
      case 'buy':
        return {
          lights: [true, true, true, false, false],
          color: 'bg-green-500',
          label: '매수',
          emoji: '📈',
          pulseColor: 'bg-green-400'
        }
      case 'neutral':
        return {
          lights: [false, false, true, false, false],
          color: 'bg-yellow-500',
          label: '중립',
          emoji: '⚖️',
          pulseColor: 'bg-yellow-400'
        }
      case 'sell':
        return {
          lights: [false, false, false, true, true],
          color: 'bg-red-500',
          label: '매도',
          emoji: '📉',
          pulseColor: 'bg-red-400'
        }
      case 'strong_sell':
        return {
          lights: [true, true, true, true, true],
          color: 'bg-red-500',
          label: '강력 매도',
          emoji: '🔻',
          pulseColor: 'bg-red-400'
        }
    }
  }

  const config = getSignalConfig()
  const sizeClass = size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-6 h-6'
  const gapClass = size === 'sm' ? 'gap-1' : size === 'md' ? 'gap-2' : 'gap-3'

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`flex ${gapClass} items-center`}>
        {config.lights.map((isOn, index) => {
          let bgColor = 'bg-gray-600'
          if (signal === 'strong_buy' || signal === 'buy') {
            bgColor = isOn ? 'bg-green-500' : 'bg-gray-600'
          } else if (signal === 'neutral') {
            bgColor = index === 2 ? 'bg-yellow-500' : 'bg-gray-600'
          } else {
            bgColor = (signal === 'sell' && index >= 3 && isOn) || (signal === 'strong_sell' && isOn)
              ? 'bg-red-500' 
              : 'bg-gray-600'
          }

          return (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`${sizeClass} ${bgColor} rounded-full relative`}
            >
              {isOn && (
                <>
                  <div className={`absolute inset-0 ${config.pulseColor} rounded-full animate-ping opacity-75`} />
                  <div className={`absolute inset-0 ${bgColor} rounded-full`} />
                </>
              )}
            </motion.div>
          )
        })}
      </div>
      
      {showLabel && (
        <div className="flex items-center gap-2">
          <span className="text-2xl">{config.emoji}</span>
          <span className={`font-bold text-lg ${
            signal.includes('buy') ? 'text-green-400' : 
            signal.includes('sell') ? 'text-red-400' : 
            'text-yellow-400'
          }`}>
            {config.label}
          </span>
        </div>
      )}
    </div>
  )
}