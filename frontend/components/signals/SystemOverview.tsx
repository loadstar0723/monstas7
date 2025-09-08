'use client'

import { FaLightbulb } from 'react-icons/fa'

interface SystemOverviewProps {
  title: string
  icon?: React.ReactNode
  sections: {
    title: string
    icon: string
    color: string
    description: string
  }[]
  signals: {
    color: string
    title: string
    description: string
  }[]
  tips: string
}

export default function SystemOverview({ 
  title, 
  icon, 
  sections, 
  signals, 
  tips 
}: SystemOverviewProps) {
  return (
    <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur rounded-xl p-6 border border-purple-500/30">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      
      {/* 주요 개념 설명 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {sections.map((section, index) => (
          <div key={index} className="bg-gray-900/50 rounded-lg p-4">
            <h4 className={`text-sm font-semibold ${section.color} mb-2 flex items-center gap-2`}>
              <span className="text-xl">{section.icon}</span> {section.title}
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              {section.description}
            </p>
          </div>
        ))}
      </div>
      
      {/* 핵심 트레이딩 신호 */}
      <div className="bg-gray-900/50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-yellow-400 mb-3">📈 핵심 트레이딩 신호</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {signals.map((signal, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className={`${signal.color} mt-1`}>●</span>
              <div>
                <span className="font-semibold text-white">{signal.title}:</span>
                <span className="text-gray-300 ml-1">
                  {signal.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 실전 팁 */}
      <div className="mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-500/30">
        <p className="text-xs text-blue-300 flex items-start gap-2">
          <FaLightbulb className="text-yellow-400 mt-0.5 flex-shrink-0" />
          <span>
            <span className="font-semibold">실전 팁:</span> {tips}
          </span>
        </p>
      </div>
    </div>
  )
}

// 고래 추적 시스템 프리셋
export const whaleTrackingOverview = {
  title: "고래 추적 시스템이란?",
  sections: [
    {
      title: "고래란?",
      icon: "🐋",
      color: "text-purple-400",
      description: "막대한 자금을 보유한 큰손 투자자로, 시장에 큰 영향력을 행사합니다. BTC 1,000개 이상, ETH 10,000개 이상 보유자를 의미합니다."
    },
    {
      title: "추적 방법",
      icon: "📊",
      color: "text-blue-400",
      description: "실시간 거래소 데이터와 온체인 분석을 통해 대규모 거래를 감지하고, 고래들의 매수/매도 패턴을 추적합니다."
    },
    {
      title: "활용 방법",
      icon: "💡",
      color: "text-green-400",
      description: "고래 매수 → 상승 신호, 고래 매도 → 하락 신호로 해석. 고래 움직임을 따라가거나 역추세 전략 수립에 활용합니다."
    }
  ],
  signals: [
    {
      color: "text-green-400",
      title: "고래 매집 신호",
      description: "여러 고래가 동시에 매수, 거래소 출금 증가 → 강한 상승 신호"
    },
    {
      color: "text-red-400",
      title: "고래 매도 신호",
      description: "대량 거래소 입금, 분산 매도 → 하락 경고"
    },
    {
      color: "text-yellow-400",
      title: "축적 구간",
      description: "고래 지갑 잔고 증가, 거래량 감소 → 상승 준비"
    },
    {
      color: "text-purple-400",
      title: "분배 구간",
      description: "고래 지갑 잔고 감소, 소액 거래 증가 → 천장 신호"
    }
  ],
  tips: "고래 거래 단독으로 판단하지 말고, 기술적 분석과 시장 심리 지표를 함께 확인하세요. 특히 여러 고래가 같은 방향으로 움직일 때가 가장 신뢰도가 높습니다."
}

// 스마트 머니 시스템 프리셋
export const smartMoneyOverview = {
  title: "스마트 머니 추적 시스템이란?",
  sections: [
    {
      title: "스마트 머니란?",
      icon: "💰",
      color: "text-purple-400",
      description: "기관투자자, 헤지펀드, 벤처캐피탈 등 전문 투자자들의 자금. 시장 정보와 분석력이 뛰어나 수익률이 높습니다."
    },
    {
      title: "추적 방법",
      icon: "🔍",
      color: "text-blue-400",
      description: "온체인 데이터, 거래소 프리미엄, 파생상품 포지션 분석을 통해 기관의 매집/분산 패턴을 파악합니다."
    },
    {
      title: "활용 방법",
      icon: "📊",
      color: "text-green-400",
      description: "스마트 머니 유입 → 매수 시그널, 스마트 머니 이탈 → 매도 시그널. 기관과 같은 방향으로 포지션 구축."
    }
  ],
  signals: [
    {
      color: "text-green-400",
      title: "기관 매집",
      description: "코인베이스 프리미엄 상승, OTC 거래 증가 → 강한 매수 신호"
    },
    {
      color: "text-red-400",
      title: "기관 매도",
      description: "대규모 출금, 선물 숏 포지션 증가 → 하락 경고"
    },
    {
      color: "text-yellow-400",
      title: "누적 단계",
      description: "변동성 감소, 거래량 축소 중 기관 매집 → 돌파 준비"
    },
    {
      color: "text-purple-400",
      title: "분배 단계",
      description: "고점에서 기관 물량 분산, 개인 FOMO → 조정 임박"
    }
  ],
  tips: "스마트 머니는 장기적 관점에서 움직입니다. 단기 변동에 흔들리지 말고 큰 흐름을 파악하세요. 기관의 평균 매수가를 참고하면 좋습니다."
}

// 청산 맵 시스템 프리셋
export const liquidationOverview = {
  title: "청산 맵 시스템이란?",
  sections: [
    {
      title: "청산이란?",
      icon: "💥",
      color: "text-purple-400",
      description: "레버리지 포지션의 증거금이 부족해져 강제로 포지션이 종료되는 것. 대규모 청산은 가격 급변동을 유발합니다."
    },
    {
      title: "분석 방법",
      icon: "📊",
      color: "text-blue-400",
      description: "거래소별 오픈 인터레스트, 청산 가격대 분포, 레버리지 비율을 실시간으로 모니터링합니다."
    },
    {
      title: "활용 방법",
      icon: "🎯",
      color: "text-green-400",
      description: "청산 밀집 구간 = 지지/저항선. 대규모 청산 후 반대 포지션 진입이 유리합니다."
    }
  ],
  signals: [
    {
      color: "text-green-400",
      title: "롱 청산 완료",
      description: "하락 후 대규모 롱 청산 → 바닥 신호, 반등 가능성"
    },
    {
      color: "text-red-400",
      title: "숏 청산 임박",
      description: "상승 중 숏 청산 밀집대 접근 → 급등 가능성"
    },
    {
      color: "text-yellow-400",
      title: "청산 연쇄",
      description: "연속 청산 발생 → 극단적 변동성, 관망 필요"
    },
    {
      color: "text-purple-400",
      title: "청산 공백",
      description: "청산 없는 구간 → 추세 지속 가능성 높음"
    }
  ],
  tips: "청산은 시장의 과열/과냉을 보여주는 지표입니다. 극단적 청산 후에는 반대 방향 움직임이 자주 나타납니다. 레버리지는 항상 신중하게!"
}

// 내부자 거래 추적 시스템 프리셋
export const insiderFlowOverview = {
  title: "내부자 거래 추적 시스템이란?",
  sections: [
    {
      title: "내부자란?",
      icon: "👤",
      color: "text-yellow-400",
      description: "프로젝트 팀, 초기 투자자, 어드바이저 등 프로젝트 내부 정보를 가진 관계자들. 토큰 분배를 받은 특권층입니다."
    },
    {
      title: "추적 방법",
      icon: "🔍",
      color: "text-blue-400",
      description: "팀 지갑 주소 모니터링, 거래소 입출금 추적, 대규모 이동 감지를 통해 내부자 거래를 파악합니다."
    },
    {
      title: "활용 방법",
      icon: "📊",
      color: "text-green-400",
      description: "내부자 매도 → 프로젝트 위험 신호, 내부자 보유 → 긍정적 신호. 특히 락업 해제 일정이 중요합니다."
    }
  ],
  signals: [
    {
      color: "text-green-400",
      title: "내부자 홀딩",
      description: "팀/투자자 지갑 보유 지속 → 프로젝트 신뢰도 상승"
    },
    {
      color: "text-red-400",
      title: "대규모 매도",
      description: "팀 지갑에서 거래소 이동 → 매도 압력 증가"
    },
    {
      color: "text-yellow-400",
      title: "락업 해제",
      description: "베스팅 일정 도래 → 일시적 매도 압력 가능"
    },
    {
      color: "text-purple-400",
      title: "스테이킹 증가",
      description: "내부자 스테이킹/락업 연장 → 장기 신뢰 신호"
    }
  ],
  tips: "내부자 거래는 프로젝트의 건전성을 판단하는 핵심 지표입니다. 특히 여러 내부자가 동시에 매도하면 위험 신호입니다. 락업 일정과 토큰 분배 계획을 반드시 확인하세요."
}