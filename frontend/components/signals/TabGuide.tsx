'use client'

import { FaLightbulb, FaChartLine, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa'

interface TabGuideProps {
  title: string
  description: string
  keyPoints: {
    icon: 'success' | 'warning' | 'info' | 'tip'
    title: string
    content: string
  }[]
  tradingTips: string[]
  warnings?: string[]
}

export default function TabGuide({ 
  title, 
  description, 
  keyPoints, 
  tradingTips,
  warnings 
}: TabGuideProps) {
  const getIcon = (type: string) => {
    switch(type) {
      case 'success': return <FaCheckCircle className="text-green-400" />
      case 'warning': return <FaExclamationTriangle className="text-yellow-400" />
      case 'tip': return <FaLightbulb className="text-blue-400" />
      default: return <FaChartLine className="text-purple-400" />
    }
  }

  return (
    <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur rounded-xl p-6 border border-blue-500/20 mb-6">
      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
        <FaLightbulb className="text-yellow-400" />
        {title}
      </h3>
      
      <p className="text-sm text-gray-300 mb-4 leading-relaxed">
        {description}
      </p>
      
      {/* 핵심 포인트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {keyPoints.map((point, idx) => (
          <div key={idx} className="bg-gray-900/50 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="mt-1">{getIcon(point.icon)}</div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-white mb-1">{point.title}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{point.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* 트레이딩 팁 */}
      {tradingTips && tradingTips.length > 0 && (
        <div className="bg-blue-900/30 rounded-lg p-3 mb-3">
          <h4 className="text-xs font-semibold text-blue-300 mb-2 flex items-center gap-1">
            💡 실전 트레이딩 팁
          </h4>
          <ul className="text-xs text-gray-300 space-y-1">
            {tradingTips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-1">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* 주의사항 */}
      {warnings && warnings.length > 0 && (
        <div className="bg-red-900/20 rounded-lg p-3 border border-red-500/30">
          <h4 className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1">
            ⚠️ 주의사항
          </h4>
          <ul className="text-xs text-red-300 space-y-1">
            {warnings.map((warning, idx) => (
              <li key={idx} className="flex items-start gap-1">
                <span className="text-red-400 mt-0.5">!</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// 탭별 가이드 프리셋
export const tabGuides = {
  wallets: {
    title: "고래 지갑 추적 가이드",
    description: "대규모 자금을 보유한 고래 지갑의 동향을 실시간으로 추적합니다. 고래의 포지션 변화는 시장 방향성을 예측하는 핵심 지표입니다.",
    keyPoints: [
      {
        icon: 'success' as const,
        title: "지갑 잔고 증가",
        content: "고래가 매집 중 → 상승 기대감, 중장기 보유 의사"
      },
      {
        icon: 'warning' as const,
        title: "거래소 입금 증가",
        content: "매도 준비 신호 → 단기 하락 가능성, 차익실현 움직임"
      },
      {
        icon: 'info' as const,
        title: "휴면 지갑 활성화",
        content: "오래된 고래 움직임 → 대규모 변동성 예고"
      },
      {
        icon: 'tip' as const,
        title: "신규 고래 출현",
        content: "기관 진입 가능성 → 장기 상승 트렌드 신호"
      }
    ],
    tradingTips: [
      "Top 10 고래 지갑의 누적 변화량을 추적하세요",
      "거래소 입출금과 지갑 잔고를 함께 분석하세요",
      "고래 지갑 분산 = 매도 준비, 집중 = 매집 단계",
      "휴면 고래 활성화 시 단기 변동성 대비 필수"
    ],
    warnings: [
      "단일 고래의 움직임으로 성급한 판단 금지",
      "가짜 거래(워시 트레이딩) 가능성 항상 고려"
    ]
  },
  
  flows: {
    title: "거래소 플로우 분석 가이드",
    description: "주요 거래소의 입출금 흐름을 추적하여 매수/매도 압력을 파악합니다. 거래소 유입은 매도, 유출은 매수 신호로 해석됩니다.",
    keyPoints: [
      {
        icon: 'success' as const,
        title: "거래소 유출 증가",
        content: "콜드월렛 이동 → 장기 보유 의사, 공급 감소로 가격 상승 압력"
      },
      {
        icon: 'warning' as const,
        title: "거래소 유입 급증",
        content: "대량 매도 준비 → 단기 하락 압력, 패닉셀 가능성"
      },
      {
        icon: 'info' as const,
        title: "거래소간 이동",
        content: "차익거래 활성화 → 가격 수렴, 변동성 감소"
      },
      {
        icon: 'tip' as const,
        title: "스테이블코인 플로우",
        content: "USDT/USDC 유입 → 매수 대기 자금, 상승 준비"
      }
    ],
    tradingTips: [
      "넷플로우(유입-유출)가 음수면 매수 우세",
      "거래소 보유량 감소 = 공급 부족 = 가격 상승",
      "스테이블코인 유입은 매수세 대기 신호",
      "주말/새벽 대량 이동은 기관 움직임 가능성"
    ],
    warnings: [
      "거래소 지갑 정비로 인한 이동 구분 필요",
      "해킹이나 보안 이슈로 인한 비정상 이동 주의"
    ]
  },
  
  patterns: {
    title: "패턴 분석 전략 가이드",
    description: "고래의 매집/분산 패턴과 시장 사이클을 분석합니다. Wyckoff 이론을 기반으로 현재 시장 단계를 파악합니다.",
    keyPoints: [
      {
        icon: 'success' as const,
        title: "매집 단계 (Accumulation)",
        content: "횡보 중 고래 매수 증가 → 상승 준비, 바닥 형성"
      },
      {
        icon: 'warning' as const,
        title: "분산 단계 (Distribution)",
        content: "고점 횡보 중 고래 매도 → 천장 형성, 하락 전환"
      },
      {
        icon: 'info' as const,
        title: "마크업 단계 (Markup)",
        content: "본격 상승 구간 → 추세 추종, 모멘텀 전략"
      },
      {
        icon: 'tip' as const,
        title: "마크다운 단계 (Markdown)",
        content: "본격 하락 구간 → 손절/숏 포지션, 방어 전략"
      }
    ],
    tradingTips: [
      "매집 후기에 진입, 분산 초기에 이탈",
      "Spring(스프링) 패턴 = 마지막 하락 후 급반등",
      "UTAD(Upthrust After Distribution) = 가짜 돌파 후 급락",
      "볼륨 프로파일로 지지/저항 구간 확인"
    ],
    warnings: [
      "패턴 완성까지 시간 소요, 성급한 진입 금지",
      "가짜 패턴(Fake Pattern) 주의"
    ]
  },
  
  history: {
    title: "거래 내역 분석 가이드",
    description: "과거 고래 거래 내역을 분석하여 패턴과 트렌드를 파악합니다. 특정 가격대의 거래 집중도로 지지/저항을 예측합니다.",
    keyPoints: [
      {
        icon: 'info' as const,
        title: "거래 집중 구간",
        content: "특정 가격대 대량 거래 → 강력한 지지/저항선"
      },
      {
        icon: 'tip' as const,
        title: "시간대별 패턴",
        content: "특정 시간 거래 증가 → 기관/지역별 특성"
      },
      {
        icon: 'success' as const,
        title: "연속 매수 패턴",
        content: "같은 고래 반복 매수 → 강한 상승 확신"
      },
      {
        icon: 'warning' as const,
        title: "대량 매도 이력",
        content: "과거 매도 가격대 → 저항선 작용 가능"
      }
    ],
    tradingTips: [
      "최근 7일 vs 30일 거래 패턴 비교",
      "거래량 가중 평균가(VWAP) 활용",
      "고래 평균 매수가 = 강력한 지지선",
      "시간대별 거래 패턴으로 최적 진입 시점 파악"
    ]
  },
  
  alerts: {
    title: "알림 설정 활용 가이드",
    description: "중요한 고래 움직임을 실시간으로 알림받아 즉각 대응합니다. 맞춤 알림으로 24시간 시장을 모니터링합니다.",
    keyPoints: [
      {
        icon: 'tip' as const,
        title: "임계값 설정",
        content: "코인별 시총 대비 0.1% 이상 거래 추천"
      },
      {
        icon: 'success' as const,
        title: "다중 조건 알림",
        content: "가격 + 거래량 + 패턴 복합 조건 설정"
      },
      {
        icon: 'warning' as const,
        title: "긴급 알림",
        content: "초대형 고래(시총 1% 이상) 움직임 필수"
      },
      {
        icon: 'info' as const,
        title: "정기 리포트",
        content: "일/주간 고래 동향 요약 리포트"
      }
    ],
    tradingTips: [
      "수면 시간에도 텔레그램 알림 필수",
      "가격 브레이크아웃 + 고래 거래 동시 알림",
      "거래소별 차등 임계값 설정",
      "휴면 고래 활성화 알림 최우선"
    ],
    warnings: [
      "너무 많은 알림은 중요 신호 놓칠 수 있음",
      "알림 피로도 관리 필요"
    ]
  },
  
  backtest: {
    title: "백테스팅 전략 가이드",
    description: "과거 데이터로 고래 추종 전략을 검증합니다. 최적의 진입/청산 조건을 찾아 수익률을 극대화합니다.",
    keyPoints: [
      {
        icon: 'success' as const,
        title: "고래 따라하기",
        content: "고래 매수 후 24시간 내 진입 → 평균 15% 수익"
      },
      {
        icon: 'info' as const,
        title: "역추세 전략",
        content: "고래 매도 시 숏 포지션 → 하락장 수익"
      },
      {
        icon: 'tip' as const,
        title: "최적 홀딩 기간",
        content: "평균 3-7일 단기 스윙 최적"
      },
      {
        icon: 'warning' as const,
        title: "손절 기준",
        content: "-5% 손절, +15% 익절 기계적 적용"
      }
    ],
    tradingTips: [
      "최소 6개월 데이터로 검증",
      "상승장/하락장 구분하여 테스트",
      "수수료와 슬리피지 반드시 포함",
      "최대 낙폭(MDD) 20% 이내 전략만 채택"
    ],
    warnings: [
      "과거 수익률이 미래 보장하지 않음",
      "과최적화(Overfitting) 주의"
    ]
  }
}