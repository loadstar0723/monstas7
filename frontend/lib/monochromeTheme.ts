// 모노크롬 차트 테마 설정
export const monochromeTheme = {
  // 배경 색상
  background: {
    primary: '#0a0a0a',      // 메인 배경 (순수 검정)
    secondary: '#141414',    // 섹션 배경 (다크 그레이)
    surface: '#1a1a1a',      // 카드 배경
    overlay: 'rgba(0,0,0,0.8)' // 오버레이
  },
  
  // 테두리 색상
  border: {
    primary: '#262626',      // 메인 보더
    secondary: '#1f1f1f',    // 서브 보더
    light: '#333333',        // 밝은 보더
    focus: '#404040'         // 포커스 보더
  },
  
  // 텍스트 색상
  text: {
    primary: '#ffffff',      // 메인 텍스트 (순백)
    secondary: '#a3a3a3',    // 서브 텍스트 (밝은 그레이)
    muted: '#525252',        // 뮤트 텍스트
    disabled: '#404040'      // 비활성 텍스트
  },
  
  // 차트 색상
  chart: {
    // 라인 차트
    line: {
      primary: '#ffffff',    // 메인 라인 (흰색)
      secondary: '#e5e5e5',  // 서브 라인
      tertiary: '#a3a3a3',   // 보조 라인
      quaternary: '#737373'  // 4차 라인
    },
    
    // 영역 차트
    area: {
      primary: 'rgba(255,255,255,0.1)',   // 메인 영역
      secondary: 'rgba(229,229,229,0.08)', // 서브 영역
      tertiary: 'rgba(163,163,163,0.05)'   // 보조 영역
    },
    
    // 그리드
    grid: {
      primary: '#1f1f1f',    // 메인 그리드
      secondary: '#171717',  // 서브 그리드
      axis: '#2a2a2a'        // 축 라인
    },
    
    // 거래량
    volume: {
      up: 'rgba(255,255,255,0.15)',    // 상승 거래량
      down: 'rgba(255,255,255,0.05)',  // 하락 거래량
      neutral: 'rgba(255,255,255,0.08)' // 중립 거래량
    },
    
    // 캔들스틱
    candle: {
      up: {
        fill: '#ffffff',
        stroke: '#ffffff'
      },
      down: {
        fill: '#000000',
        stroke: '#737373'
      }
    }
  },
  
  // 시그널 색상
  signal: {
    buy: {
      primary: '#ffffff',
      secondary: '#e5e5e5',
      background: 'rgba(255,255,255,0.1)'
    },
    sell: {
      primary: '#737373',
      secondary: '#525252',
      background: 'rgba(115,115,115,0.1)'
    },
    neutral: {
      primary: '#404040',
      secondary: '#333333',
      background: 'rgba(64,64,64,0.1)'
    },
    strong: {
      buy: '#ffffff',
      sell: '#404040'
    }
  },
  
  // 지표별 색상
  indicators: {
    rsi: {
      line: '#ffffff',
      overbought: '#e5e5e5',
      oversold: '#737373',
      fill: 'rgba(255,255,255,0.05)'
    },
    macd: {
      line: '#ffffff',
      signal: '#a3a3a3',
      histogram: {
        positive: 'rgba(255,255,255,0.3)',
        negative: 'rgba(255,255,255,0.1)'
      }
    },
    bollinger: {
      upper: '#e5e5e5',
      middle: '#ffffff',
      lower: '#e5e5e5',
      fill: 'rgba(255,255,255,0.03)'
    },
    stochastic: {
      k: '#ffffff',
      d: '#a3a3a3',
      overbought: '#e5e5e5',
      oversold: '#737373'
    },
    sma: {
      fast: '#ffffff',
      medium: '#d4d4d4',
      slow: '#a3a3a3'
    },
    ema: {
      fast: '#f5f5f5',
      medium: '#d4d4d4',
      slow: '#a3a3a3'
    }
  },
  
  // 그라디언트
  gradients: {
    primary: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
    secondary: 'linear-gradient(180deg, rgba(229,229,229,0.08) 0%, rgba(229,229,229,0) 100%)',
    surface: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
    overlay: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)'
  },
  
  // 그림자
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.5)'
  },
  
  // 애니메이션 설정
  animation: {
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
}

// 차트 공통 설정
export const chartConfig = {
  margin: { top: 10, right: 10, bottom: 30, left: 40 },
  grid: {
    strokeDasharray: '3 3',
    stroke: monochromeTheme.chart.grid.primary,
    opacity: 0.5
  },
  axis: {
    stroke: monochromeTheme.chart.grid.axis,
    tick: {
      fill: monochromeTheme.text.muted,
      fontSize: 10
    }
  },
  tooltip: {
    contentStyle: {
      backgroundColor: monochromeTheme.background.secondary,
      border: `1px solid ${monochromeTheme.border.primary}`,
      borderRadius: '8px',
      padding: '8px 12px'
    },
    labelStyle: {
      color: monochromeTheme.text.primary,
      fontSize: '12px',
      fontWeight: 'bold'
    },
    itemStyle: {
      color: monochromeTheme.text.secondary,
      fontSize: '11px'
    }
  },
  legend: {
    wrapperStyle: {
      paddingTop: '20px'
    },
    iconType: 'line',
    iconSize: 16,
    itemStyle: {
      color: monochromeTheme.text.secondary,
      fontSize: '11px'
    }
  },
  animation: {
    duration: 800,
    easing: 'ease-in-out'
  }
}

// 동적 분석 색상 매핑
export const getAnalysisColor = (value: number, thresholds: { low: number, high: number }) => {
  if (value <= thresholds.low) return monochromeTheme.signal.sell.primary
  if (value >= thresholds.high) return monochromeTheme.signal.buy.primary
  return monochromeTheme.signal.neutral.primary
}

// 신호 강도별 색상
export const getSignalIntensity = (strength: number) => {
  // 0-100 강도를 그레이스케일로 변환
  const intensity = Math.round(255 * (strength / 100))
  return `rgb(${intensity}, ${intensity}, ${intensity})`
}

// 히트맵 색상 생성
export const generateHeatmapColors = (steps: number = 10) => {
  const colors = []
  for (let i = 0; i < steps; i++) {
    const intensity = Math.round((255 / steps) * i)
    colors.push(`rgb(${intensity}, ${intensity}, ${intensity})`)
  }
  return colors
}

export default monochromeTheme