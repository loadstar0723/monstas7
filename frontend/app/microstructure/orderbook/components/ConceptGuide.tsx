'use client'

import { motion } from 'framer-motion'
import { FaBookOpen, FaChartBar, FaBalanceScale, FaLightbulb, FaRocket, FaShieldAlt } from 'react-icons/fa'

export default function ConceptGuide() {
  const concepts = [
    {
      title: '오더북(호가창)이란?',
      icon: <FaBookOpen />,
      content: '오더북은 특정 자산에 대한 모든 매수 및 매도 주문을 가격별로 정리한 실시간 데이터입니다. 시장의 수요와 공급을 한눈에 볼 수 있어 트레이더들이 시장 상황을 파악하는 데 필수적인 도구입니다.',
      keyPoints: [
        'Bid(매수): 구매하고자 하는 주문',
        'Ask(매도): 판매하고자 하는 주문',
        'Spread(스프레드): 최고 매수가와 최저 매도가의 차이',
        'Depth(깊이): 각 가격대의 주문량'
      ]
    },
    {
      title: '히트맵 읽는 방법',
      icon: <FaChartBar />,
      content: '히트맵은 오더북 데이터를 색상으로 시각화한 것입니다. 색상이 진할수록 해당 가격대에 많은 주문이 쌓여있음을 의미합니다.',
      keyPoints: [
        '초록색: 매수 주문 (지지선 역할)',
        '빨간색: 매도 주문 (저항선 역할)',
        '색상 강도: 주문량의 크기',
        '큰 블록: 벽(Wall) - 대량 주문'
      ]
    },
    {
      title: '주문 불균형 분석',
      icon: <FaBalanceScale />,
      content: '매수와 매도 주문의 불균형은 단기적인 가격 움직임을 예측하는 데 도움이 됩니다.',
      keyPoints: [
        '매수 우세: 가격 상승 압력',
        '매도 우세: 가격 하락 압력',
        '균형 상태: 안정적인 시장',
        '급격한 변화: 추세 전환 신호'
      ]
    },
    {
      title: '큰 주문(고래) 감지',
      icon: <FaRocket />,
      content: '대량 주문(고래)은 시장에 큰 영향을 미칠 수 있습니다. 이러한 주문을 추적하면 시장 움직임을 예측할 수 있습니다.',
      keyPoints: [
        '벽(Wall): 특정 가격대의 대량 주문',
        '아이스버그 주문: 숨겨진 대량 주문',
        '스푸핑: 가짜 대량 주문 (조작)',
        '실제 실행 여부 모니터링 중요'
      ]
    },
    {
      title: '트레이딩 전략',
      icon: <FaLightbulb />,
      content: '오더북 분석을 통한 실전 트레이딩 전략을 활용하세요.',
      keyPoints: [
        '지지/저항 레벨에서 진입',
        '벽 근처에서 주의 (반전 가능)',
        '스프레드가 넓을 때는 회피',
        '유동성이 높을 때 거래'
      ]
    },
    {
      title: '리스크 관리',
      icon: <FaShieldAlt />,
      content: '오더북 데이터를 활용한 리스크 관리 방법입니다.',
      keyPoints: [
        '슬리피지 계산하여 손실 예방',
        '유동성 부족 시장 회피',
        '대량 주문 근처 손절 설정',
        '포지션 크기 조절'
      ]
    }
  ]

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-6 border border-purple-500/30">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
          <FaBookOpen className="text-purple-400" />
          오더북 히트맵 완벽 가이드
        </h2>
        <p className="text-gray-300">
          오더북 히트맵을 제대로 이해하고 활용하면 시장의 숨겨진 패턴을 발견하고 
          더 나은 트레이딩 결정을 내릴 수 있습니다.
        </p>
      </div>

      {/* 개념 카드들 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {concepts.map((concept, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 text-xl">
                {concept.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-3">{concept.title}</h3>
                <p className="text-gray-300 text-sm mb-4">{concept.content}</p>
                <div className="space-y-2">
                  {concept.keyPoints.map((point, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-purple-400 mt-1">•</span>
                      <span className="text-gray-400">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 실전 팁 */}
      <div className="bg-blue-500/10 rounded-xl p-6 border border-blue-500/30">
        <h3 className="text-lg font-bold text-white mb-4">💡 프로 트레이더의 실전 팁</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="text-purple-400 font-semibold">관찰 포인트</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• 큰 주문이 실제로 체결되는지 관찰</li>
              <li>• 벽이 갑자기 사라지는 패턴 주의</li>
              <li>• 스프레드 변화 추이 모니터링</li>
              <li>• 주문 속도와 크기 변화 추적</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-purple-400 font-semibold">실행 전략</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• 유동성이 높은 시간대 선택</li>
              <li>• 대량 주문은 분할 실행</li>
              <li>• 슬리피지 허용 범위 설정</li>
              <li>• 시장가보다 지정가 활용</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 경고 메시지 */}
      <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
        <p className="text-sm text-red-400">
          ⚠️ <span className="font-semibold">주의:</span> 오더북 데이터는 빠르게 변할 수 있으며, 
          스푸핑 등의 조작 가능성이 있습니다. 오더북 분석은 다른 지표와 함께 종합적으로 활용하시기 바랍니다.
        </p>
      </div>
    </div>
  )
}