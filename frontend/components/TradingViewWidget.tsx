'use client'

import { useEffect, useRef, memo } from 'react'

interface TradingViewWidgetProps {
  symbol?: string
  theme?: 'light' | 'dark'
  height?: number
  width?: string
  locale?: string
}

function TradingViewWidget({ 
  symbol = 'BINANCE:BTCUSDT',
  theme = 'dark',
  height = 610,
  width = '100%',
  locale = 'kr'
}: TradingViewWidgetProps) {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!container.current) return

    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
    script.type = "text/javascript"
    script.async = true
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": symbol,
      "interval": "D",
      "timezone": "Asia/Seoul",
      "theme": theme,
      "style": "1",
      "locale": locale,
      "enable_publishing": false,
      "allow_symbol_change": true,
      "calendar": false,
      "support_host": "https://www.tradingview.com",
      "studies": [
        "STD;MACD",
        "STD;RSI"
      ],
      "container_id": "tradingview_advanced"
    })

    const widgetContainer = document.createElement("div")
    widgetContainer.className = "tradingview-widget-container"
    widgetContainer.style.height = `${height}px`
    widgetContainer.style.width = width

    const widgetDiv = document.createElement("div")
    widgetDiv.id = "tradingview_advanced"
    widgetDiv.style.height = "100%"

    widgetContainer.appendChild(widgetDiv)
    widgetContainer.appendChild(script)

    if (container.current.firstChild) {
      container.current.removeChild(container.current.firstChild)
    }
    container.current.appendChild(widgetContainer)

    return () => {
      const currentContainer = container.current
      if (currentContainer && currentContainer.firstChild) {
        currentContainer.removeChild(currentContainer.firstChild)
      }
    }
  }, [symbol, theme, height, width, locale])

  return (
    <div ref={container} className="w-full" />
  )
}

export default memo(TradingViewWidget)