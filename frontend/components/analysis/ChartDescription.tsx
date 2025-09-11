'use client'

import React from 'react'
import { Info } from 'lucide-react'

interface ChartDescriptionProps {
  title: string
  description: string
  keyPoints?: string[]
  interpretation?: {
    bullish?: string
    bearish?: string
    neutral?: string
  }
}

export default function ChartDescription({ 
  title, 
  description, 
  keyPoints = [],
  interpretation
}: ChartDescriptionProps) {
  return (
    <div className="bg-gray-800/30 rounded-lg p-4 mb-4 border border-gray-700/50">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-white mb-2">{title} 개념</h4>
          <p className="text-xs text-gray-400 mb-3 leading-relaxed">
            {description}
          </p>
          
          {keyPoints.length > 0 && (
            <div className="mb-3">
              <h5 className="text-xs font-medium text-gray-300 mb-2">핵심 포인트:</h5>
              <ul className="space-y-1">
                {keyPoints.map((point, index) => (
                  <li key={index} className="text-xs text-gray-400 flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {interpretation && (
            <div className="bg-gray-900/50 rounded p-3 space-y-2">
              <h5 className="text-xs font-medium text-gray-300 mb-2">해석 방법:</h5>
              {interpretation.bullish && (
                <div className="flex items-start gap-2">
                  <span className="text-green-400 text-xs">↑</span>
                  <span className="text-xs text-gray-400">{interpretation.bullish}</span>
                </div>
              )}
              {interpretation.bearish && (
                <div className="flex items-start gap-2">
                  <span className="text-red-400 text-xs">↓</span>
                  <span className="text-xs text-gray-400">{interpretation.bearish}</span>
                </div>
              )}
              {interpretation.neutral && (
                <div className="flex items-start gap-2">
                  <span className="text-yellow-400 text-xs">→</span>
                  <span className="text-xs text-gray-400">{interpretation.neutral}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 차트별 설명 데이터
export const chartDescriptions = {
  rsi: {
    title: "RSI (상대강도지수)",
    description: "RSI는 가격의 상승압력과 하락압력의 상대적인 강도를 측정하는 모멘텀 지표입니다. 0-100 사이의 값으로 표시되며, 과매수와 과매도 상태를 판단하는데 사용됩니다.",
    keyPoints: [
      "14일 기준이 가장 일반적으로 사용됨",
      "70 이상: 과매수 구간 (가격 하락 가능성)",
      "30 이하: 과매도 구간 (가격 상승 가능성)",
      "50 기준선: 상승/하락 추세 판단",
      "다이버전스: 가격과 RSI의 방향이 다를 때 추세 전환 신호"
    ],
    interpretation: {
      bullish: "RSI가 30 이하에서 상승 전환하거나, 상승 다이버전스 발생 시 매수 신호",
      bearish: "RSI가 70 이상에서 하락 전환하거나, 하락 다이버전스 발생 시 매도 신호",
      neutral: "RSI가 40-60 구간에 있을 때는 추세가 불명확한 상태"
    }
  },
  
  macd: {
    title: "MACD (이동평균수렴확산)",
    description: "MACD는 단기 이동평균과 장기 이동평균의 차이를 이용하여 추세의 변화를 포착하는 지표입니다. MACD선, 신호선, 히스토그램으로 구성됩니다.",
    keyPoints: [
      "MACD선 = 12일 EMA - 26일 EMA",
      "신호선 = MACD의 9일 EMA",
      "히스토그램 = MACD선 - 신호선",
      "골든크로스: MACD가 신호선을 상향 돌파",
      "데드크로스: MACD가 신호선을 하향 돌파"
    ],
    interpretation: {
      bullish: "MACD가 신호선을 상향 돌파하고 히스토그램이 양수로 전환 시 매수",
      bearish: "MACD가 신호선을 하향 돌파하고 히스토그램이 음수로 전환 시 매도",
      neutral: "MACD와 신호선이 0 근처에서 횡보할 때는 관망"
    }
  },
  
  bollingerBands: {
    title: "볼린저밴드",
    description: "볼린저밴드는 존 볼린저가 개발한 기술적 지표로, 가격의 변동성을 시각화하고 과매수/과매도 구간을 판단합니다. 중심선(이동평균)을 기준으로 상하 표준편차 밴드를 그려 현재 가격이 평균 대비 얼마나 벗어나 있는지를 보여줍니다.",
    keyPoints: [
      "중심선: 20일 단순이동평균선 (SMA)",
      "상단 밴드: 중심선 + (2 × 표준편차)",
      "하단 밴드: 중심선 - (2 × 표준편차)",
      "밴드 스퀴즈: 밴드 폭이 좁아지면 큰 변동성 예고",
      "밴드 확장: 변동성 증가 및 강한 추세 진행",
      "가격의 95%가 밴드 내에서 움직임",
      "밴드 워킹: 추세장에서 밴드를 따라 움직임"
    ],
    interpretation: {
      bullish: "하단 밴드 터치 후 반등, 밴드 스퀴즈 후 상단 돌파, 중심선 위에서 지지받을 때",
      bearish: "상단 밴드 터치 후 반락, 밴드 스퀴즈 후 하단 이탈, 중심선 아래에서 저항받을 때",
      neutral: "가격이 중심선 근처에서 횡보하거나 밴드 내에서 규칙적으로 진동할 때"
    }
  },
  
  stochastic: {
    title: "스토캐스틱",
    description: "스토캐스틱은 일정 기간 동안의 최고가와 최저가 범위 내에서 현재 가격의 위치를 백분율로 나타내는 모멘텀 지표입니다.",
    keyPoints: [
      "%K: 빠른 선 (현재 가격의 상대적 위치)",
      "%D: 느린 선 (%K의 3일 이동평균)",
      "80 이상: 과매수 구간",
      "20 이하: 과매도 구간",
      "Fast와 Slow 스토캐스틱 구분"
    ],
    interpretation: {
      bullish: "%K가 %D를 상향 돌파하고 20 이하 과매도 구간에서 상승 시",
      bearish: "%K가 %D를 하향 돌파하고 80 이상 과매수 구간에서 하락 시",
      neutral: "50 근처에서 %K와 %D가 엉켜있을 때"
    }
  },
  
  atr: {
    title: "ATR (평균진폭)",
    description: "ATR은 가격의 변동성을 측정하는 지표로, 일정 기간 동안의 가격 변동 폭의 평균을 나타냅니다. 추세의 방향이 아닌 변동성의 크기만을 측정합니다.",
    keyPoints: [
      "높은 ATR: 변동성이 큰 시장",
      "낮은 ATR: 변동성이 작은 시장",
      "손절선 설정: 진입가 ± (1.5-2 × ATR)",
      "포지션 크기: 리스크 금액 ÷ ATR",
      "브레이크아웃 예측: ATR 급증 시 큰 움직임 예상"
    ],
    interpretation: {
      bullish: "ATR이 낮은 수준에서 상승하기 시작하면 새로운 추세 시작 가능",
      bearish: "ATR이 극도로 높은 수준은 추세 마무리 단계일 가능성",
      neutral: "ATR이 일정 수준을 유지하면 현재 추세 지속"
    }
  },
  
  dmi: {
    title: "DMI (방향성 지수)",
    description: "DMI는 추세의 방향과 강도를 동시에 측정하는 지표로, +DI(상승 방향)와 -DI(하락 방향)의 교차를 통해 매매 신호를 포착합니다.",
    keyPoints: [
      "+DI: 상승 추세의 강도",
      "-DI: 하락 추세의 강도",
      "DI 크로스: 추세 전환 신호",
      "+DI > -DI: 상승 추세 우세",
      "-DI > +DI: 하락 추세 우세"
    ],
    interpretation: {
      bullish: "+DI가 -DI를 상향 돌파하고 ADX가 상승하면 강한 상승 추세",
      bearish: "-DI가 +DI를 상향 돌파하고 ADX가 상승하면 강한 하락 추세",
      neutral: "+DI와 -DI가 비슷한 수준에서 횡보하면 추세 없음"
    }
  },
  
  adx: {
    title: "ADX (평균방향지수)",
    description: "ADX는 추세의 강도를 측정하는 지표로, 추세의 방향과 관계없이 추세가 얼마나 강한지를 0-100 사이의 값으로 나타냅니다.",
    keyPoints: [
      "25 이상: 강한 추세 존재",
      "20 이하: 추세 없음 (횡보장)",
      "40 이상: 매우 강한 추세",
      "50 이상: 극도로 강한 추세",
      "ADX 상승: 추세 강화, ADX 하락: 추세 약화"
    ],
    interpretation: {
      bullish: "ADX가 25 이상이고 +DI > -DI일 때 추세 추종 매수",
      bearish: "ADX가 25 이상이고 -DI > +DI일 때 추세 추종 매도",
      neutral: "ADX가 20 이하일 때는 박스권 매매 전략"
    }
  },
  
  movingAverage: {
    title: "이동평균선 (MA/EMA)",
    description: "이동평균선은 일정 기간 동안의 평균 가격을 연결한 선으로, 가격의 추세를 파악하는 가장 기본적인 지표입니다. 단순이동평균(SMA)과 지수이동평균(EMA)이 주로 사용되며, 여러 기간의 이동평균선을 조합하여 매매 신호를 포착합니다.",
    keyPoints: [
      "단기 이평선: 5일, 10일, 20일 (민감한 반응)",
      "중기 이평선: 50일, 60일 (중기 추세)",
      "장기 이평선: 120일, 200일 (장기 추세)",
      "골든크로스: 단기선이 장기선을 상향 돌파 (강력한 매수 신호)",
      "데드크로스: 단기선이 장기선을 하향 돌파 (강력한 매도 신호)",
      "EMA는 최근 가격에 더 큰 가중치를 부여하여 빠른 반응",
      "이평선은 지지선과 저항선 역할을 함"
    ],
    interpretation: {
      bullish: "가격이 이평선 위에 있고, 단기선 > 중기선 > 장기선 순으로 정배열될 때",
      bearish: "가격이 이평선 아래 있고, 장기선 > 중기선 > 단기선 순으로 역배열될 때",
      neutral: "이평선들이 수평으로 움직이거나 서로 엉켜있을 때 방향성 불명확"
    }
  },
  
  vwap: {
    title: "VWAP (거래량 가중 평균가격)",
    description: "VWAP은 거래량을 가중치로 사용한 평균 가격으로, 기관투자자들이 주로 사용하는 벤치마크 지표입니다.",
    keyPoints: [
      "당일 누적 거래량 가중 평균",
      "기관의 평균 매수/매도 가격 추정",
      "VWAP 상단: 매도 우위 구간",
      "VWAP 하단: 매수 우위 구간",
      "일중 매매의 기준선"
    ],
    interpretation: {
      bullish: "가격이 VWAP 아래에서 상향 돌파하고 거래량 증가 시",
      bearish: "가격이 VWAP 위에서 하향 돌파하고 거래량 증가 시",
      neutral: "가격이 VWAP 근처에서 움직이며 거래량이 평균적일 때"
    }
  },
  
  ichimoku: {
    title: "일목균형표",
    description: "일목균형표는 5개의 선을 이용하여 지지/저항선, 추세, 모멘텀을 한눈에 파악할 수 있는 종합적인 기술적 지표입니다.",
    keyPoints: [
      "전환선(9일): 단기 추세선",
      "기준선(26일): 중기 추세선",
      "선행스팬A: 전환선과 기준선의 중간값을 26일 앞에 표시",
      "선행스팬B: 52일 중간값을 26일 앞에 표시",
      "구름대: 선행스팬 A와 B 사이의 영역"
    ],
    interpretation: {
      bullish: "가격이 구름대 위에 있고, 전환선이 기준선을 상향 돌파",
      bearish: "가격이 구름대 아래에 있고, 전환선이 기준선을 하향 돌파",
      neutral: "가격이 구름대 내부에 있을 때는 방향성 불명확"
    }
  },
  
  roc: {
    title: "ROC (변화율)",
    description: "ROC는 현재 가격과 일정 기간 전 가격의 변화율을 백분율로 나타내는 모멘텀 지표입니다.",
    keyPoints: [
      "0 이상: 상승 모멘텀",
      "0 이하: 하락 모멘텀",
      "ROC 상승: 모멘텀 증가",
      "ROC 하락: 모멘텀 감소",
      "다이버전스: 추세 전환 신호"
    ],
    interpretation: {
      bullish: "ROC가 0을 상향 돌파하거나, 바닥에서 상승 전환 시",
      bearish: "ROC가 0을 하향 돌파하거나, 천장에서 하락 전환 시",
      neutral: "ROC가 0 근처에서 횡보할 때"
    }
  },
  
  momentum: {
    title: "모멘텀 오실레이터",
    description: "모멘텀은 가격의 변화 속도를 측정하는 선행 지표로, 추세의 가속과 감속을 파악하는데 사용됩니다.",
    keyPoints: [
      "양수: 상승 모멘텀",
      "음수: 하락 모멘텀",
      "절대값 증가: 추세 가속",
      "절대값 감소: 추세 감속",
      "0선 돌파: 추세 전환"
    ],
    interpretation: {
      bullish: "모멘텀이 음수에서 양수로 전환하고 증가하는 추세",
      bearish: "모멘텀이 양수에서 음수로 전환하고 감소하는 추세",
      neutral: "모멘텀이 0 근처에서 작은 진폭으로 움직일 때"
    }
  },
  
  obv: {
    title: "OBV (누적거래량)",
    description: "OBV는 가격 상승일의 거래량은 더하고 하락일의 거래량은 빼서 누적한 지표로, 매집과 분산을 파악합니다.",
    keyPoints: [
      "OBV 상승: 매집 진행 (스마트머니 매수)",
      "OBV 하락: 분산 진행 (스마트머니 매도)",
      "가격-OBV 다이버전스: 추세 전환 신호",
      "OBV 기울기: 매집/분산의 강도",
      "이동평균선과 함께 사용"
    ],
    interpretation: {
      bullish: "OBV가 상승하고 가격도 상승하거나, OBV만 먼저 상승 시",
      bearish: "OBV가 하락하고 가격도 하락하거나, OBV만 먼저 하락 시",
      neutral: "OBV가 횡보하면 매집과 분산이 균형 상태"
    }
  },
  
  maRibbon: {
    title: "MA 리본 (Moving Average Ribbon)",
    description: "MA 리본은 여러 개의 이동평균선을 동시에 표시하여 추세의 강도와 방향을 시각적으로 파악하는 지표입니다. 리본의 확장과 수축, 꼬임과 펼쳐짐을 통해 추세 전환을 예측할 수 있습니다.",
    keyPoints: [
      "5일부터 50일까지 다양한 기간의 MA 동시 표시",
      "리본 확장: 강한 추세가 진행 중",
      "리본 수축: 추세 약화 또는 전환 임박",
      "리본 꼬임: 추세 전환 신호",
      "색상 그라데이션으로 추세 강도 시각화",
      "리본의 기울기로 추세 방향 판단",
      "리본 간격이 넓을수록 강한 추세"
    ],
    interpretation: {
      bullish: "리본이 상향 확장되고 단기선이 장기선 위에 정배열될 때 강한 상승 추세",
      bearish: "리본이 하향 확장되고 장기선이 단기선 위에 역배열될 때 강한 하락 추세",
      neutral: "리본이 수평으로 움직이거나 서로 얽혀있을 때는 추세 전환 대기"
    }
  }
}