'use client'

import { useState, useMemo } from 'react'
import type { BotConfig } from '../ArbitrageBotModule'

interface BotConfigurationProps {
  selectedCoin: {
    symbol: string
    name: string
    color: string
    bgColor: string
  }
  config: BotConfig
  onConfigChange: (config: BotConfig) => void
}

export default function BotConfiguration({ selectedCoin, config, onConfigChange }: BotConfigurationProps) {
  const [activePreset, setActivePreset] = useState<'conservative' | 'moderate' | 'aggressive' | 'custom'>('custom')
  
  // 프리셋 설정 - useMemo로 메모이제이션 (config 의존성 제거)
  const presets = useMemo(() => ({
    conservative: {
      label: '안정형',
      icon: '🛡️',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      config: {
        minProfit: 0.3,
        maxPosition: 500,
        slippage: 0.05,
        gasLimit: 200000,
        autoExecute: false,
        stopLoss: 1,
        takeProfit: 2
      }
    },
    moderate: {
      label: '균형형',
      icon: '⚖️',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      config: {
        minProfit: 0.5,
        maxPosition: 1000,
        slippage: 0.1,
        gasLimit: 300000,
        autoExecute: false,
        stopLoss: 2,
        takeProfit: 5
      }
    },
    aggressive: {
      label: '공격형',
      icon: '🚀',
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      config: {
        minProfit: 0.8,
        maxPosition: 5000,
        slippage: 0.2,
        gasLimit: 500000,
        autoExecute: true,
        stopLoss: 5,
        takeProfit: 10
      }
    },
    custom: {
      label: '사용자 정의',
      icon: '⚙️',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      config: {} // config spread 제거
    }
  }), [])
  
  const handlePresetSelect = (preset: keyof typeof presets) => {
    setActivePreset(preset)
    if (preset !== 'custom') {
      onConfigChange({
        ...config,
        ...presets[preset].config
      })
    }
  }
  
  const handleConfigUpdate = (key: keyof BotConfig, value: any) => {
    const newConfig = { ...config, [key]: value }
    onConfigChange(newConfig)
    setActivePreset('custom')
  }
  
  return (
    <div className="space-y-6">
      {/* 프리셋 선택 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-300 mb-4">봇 설정 프리셋</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(presets).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => handlePresetSelect(key as keyof typeof presets)}
              className={`p-4 rounded-lg border transition-all ${
                activePreset === key
                  ? `${preset.bgColor} border-current ${preset.color}`
                  : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
              }`}
            >
              <div className="text-2xl mb-2">{preset.icon}</div>
              <div className="font-medium">{preset.label}</div>
            </button>
          ))}
        </div>
      </div>
      
      {/* 전략 선택 */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">차익거래 전략</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { value: 'triangular', label: '삼각 차익거래', icon: '🔺', desc: '3개 통화쌍 순환' },
            { value: 'statistical', label: '통계적 차익거래', icon: '📊', desc: '평균 회귀 전략' },
            { value: 'cross-exchange', label: '거래소 간 차익', icon: '🔄', desc: '거래소 가격차 활용' },
            { value: 'dex-cex', label: 'DEX-CEX 차익', icon: '🌐', desc: '탈중앙/중앙 거래소' }
          ].map(strategy => (
            <button
              key={strategy.value}
              onClick={() => handleConfigUpdate('strategy', strategy.value)}
              className={`p-4 rounded-lg border transition-all text-left ${
                config.strategy === strategy.value
                  ? `${selectedCoin.bgColor} border-current ${selectedCoin.color}`
                  : 'bg-gray-900/50 border-gray-700 hover:bg-gray-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{strategy.icon}</span>
                <div>
                  <div className="font-medium">{strategy.label}</div>
                  <div className="text-xs text-gray-400 mt-1">{strategy.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* 상세 설정 */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">상세 설정</h3>
        
        <div className="space-y-6">
          {/* 최소 수익률 */}
          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">최소 수익률</span>
              <span className="text-lg font-mono text-green-400">{config.minProfit}%</span>
            </label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={config.minProfit}
              onChange={(e) => handleConfigUpdate('minProfit', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.1%</span>
              <span>낮을수록 많은 기회</span>
              <span>2%</span>
            </div>
          </div>
          
          {/* 최대 포지션 크기 */}
          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">최대 포지션 크기</span>
              <span className="text-lg font-mono text-yellow-400">${config.maxPosition}</span>
            </label>
            <input
              type="range"
              min="100"
              max="10000"
              step="100"
              value={config.maxPosition}
              onChange={(e) => handleConfigUpdate('maxPosition', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>$100</span>
              <span>거래당 최대 금액</span>
              <span>$10,000</span>
            </div>
          </div>
          
          {/* 슬리피지 허용치 */}
          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">슬리피지 허용치</span>
              <span className="text-lg font-mono text-blue-400">{config.slippage}%</span>
            </label>
            <input
              type="range"
              min="0.05"
              max="0.5"
              step="0.05"
              value={config.slippage}
              onChange={(e) => handleConfigUpdate('slippage', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.05%</span>
              <span>가격 변동 허용 범위</span>
              <span>0.5%</span>
            </div>
          </div>
          
          {/* 손절/익절 설정 */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">손절 라인</span>
                <span className="text-lg font-mono text-red-400">-{config.stopLoss}%</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={config.stopLoss}
                onChange={(e) => handleConfigUpdate('stopLoss', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div>
              <label className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">익절 라인</span>
                <span className="text-lg font-mono text-green-400">+{config.takeProfit}%</span>
              </label>
              <input
                type="range"
                min="2"
                max="20"
                step="1"
                value={config.takeProfit}
                onChange={(e) => handleConfigUpdate('takeProfit', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
          
          {/* 자동 실행 토글 */}
          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
            <div>
              <div className="font-medium text-gray-300">자동 실행 모드</div>
              <div className="text-xs text-gray-500 mt-1">
                기회 발견 시 자동으로 거래 실행
              </div>
            </div>
            <button
              onClick={() => handleConfigUpdate('autoExecute', !config.autoExecute)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                config.autoExecute ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  config.autoExecute ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
      
      {/* 설정 요약 */}
      <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-500/30">
        <h3 className="text-lg font-semibold text-green-400 mb-4">현재 봇 설정 요약</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">코인</span>
              <span className="text-white font-medium">{selectedCoin.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">전략</span>
              <span className="text-white font-medium">
                {config.strategy === 'triangular' ? '삼각 차익거래' :
                 config.strategy === 'statistical' ? '통계적 차익거래' :
                 config.strategy === 'cross-exchange' ? '거래소 간 차익' :
                 'DEX-CEX 차익'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">최소 수익률</span>
              <span className="text-green-400 font-medium">{config.minProfit}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">최대 포지션</span>
              <span className="text-yellow-400 font-medium">${config.maxPosition}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">슬리피지</span>
              <span className="text-white font-medium">{config.slippage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">손절선</span>
              <span className="text-red-400 font-medium">-{config.stopLoss}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">익절선</span>
              <span className="text-green-400 font-medium">+{config.takeProfit}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">자동 실행</span>
              <span className={config.autoExecute ? 'text-green-400' : 'text-gray-400'}>
                {config.autoExecute ? '활성화' : '비활성화'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}