'use client'

import { useEffect, useRef, useState } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { motion, AnimatePresence } from 'framer-motion'
import { config } from '@/lib/config'

declare global {
  interface Window {
    TradingView: any;
  }
}

interface TradingViewSeasonalityProps {
  symbol?: string;
}

export default function TradingViewSeasonality({ 
  symbol = 'BINANCE:BTCUSDT' 
}: TradingViewSeasonalityProps) {
  const [showFullChart, setShowFullChart] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const scriptIdRef = useRef<string>(`tradingview_seasonality_${Date.now()}`)

  useEffect(() => {
    if (!showFullChart || !containerRef.current) return

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/tv.js'
    script.async = true
    script.onload = () => {
      if (window.TradingView && containerRef.current) {
        new window.TradingView.widget({
          symbol: symbol,
          width: '${config.percentage.value100}',
          height: 600,
          locale: 'kr',
          dateRange: '12M',
          colorTheme: 'dark',
          trendLineColor: 'rgba(41, 119, 188, 1)',
          underLineColor: 'rgba(41, 119, 188, config.decimals.value3)',
          underLineBottomColor: 'rgba(41, 119, 188, 0)',
          isTransparent: true,
          autosize: false,
          largeChartUrl: '',
          container_id: scriptIdRef.current,
          interval: 'D',
          timezone: 'Asia/Seoul',
          theme: 'dark',
          style: '1',
          toolbar_bg: '#1e1e1e',
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          studies: [
            {
              id: 'Seasonality@tv-basicstudies',
              inputs: {}
            }
          ],
          show_popup_button: false,
          popup_width: '1000',
          popup_height: '650'
        })
      }
    }
    
    document.head.appendChild(script)

    return () => {
      const container = document.getElementById(scriptIdRef.current)
      if (container) {
        container.innerHTML = ''
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [showFullChart, symbol])

  return (
    <>
      {/* Inline Seasonal Preview */}
      <div className="glass-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold gradient-text">시즌별 분석</h3>
            <p className="text-gray-400 text-sm mt-1">연도별 월간 성과 비교</p>
          </div>
          <motion.button
            onClick={() => setShowFullChart(!showFullChart)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-cyan-700 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: config.decimals.value95 }}
          >
            {showFullChart ? '차트 닫기' : '더 많은 시즌 →'}
          </motion.button>
        </div>

        {/* Simple Preview Chart */}
        {!showFullChart && (
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 mb-4">
            {['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'].map((month, index) => (
              <div key={month} className="text-center">
                <div className="text-xs text-gray-500 mb-1">{month}</div>
                <div className={`text-sm font-bold ${
                  index < 8 ? (index % 3 === 0 ? 'text-red-400' : 'text-emerald-400') : 'text-gray-600'
                }`}>
                  {index < 8 ? (index % 3 === 0 ? '-' : '+') : ''}
                  {index < 8 ? Math.abs(Math.random() * 20).toFixed(1) : 'config.decimals.value0'}%
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Year Legend */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-400 text-sm">2025</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-500"></div>
            <span className="text-gray-400 text-sm">2024</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-gray-400 text-sm">2023</span>
          </div>
        </div>
      </div>

      {/* Full TradingView Seasonal Chart Modal */}
      <AnimatePresence>
        {showFullChart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowFullChart(false)}
          >
            <motion.div
              initial={{ scale: config.decimals.value9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: config.decimals.value9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-6xl bg-gray-900 rounded-xl overflow-hidden border border-purple-500/30"
            >
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-xl font-bold gradient-text">시즌별 상세 분석</h3>
                <button
                  onClick={() => setShowFullChart(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <div id={scriptIdRef.current} ref={containerRef} className="w-full" style={{ minHeight: '600px' }} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}