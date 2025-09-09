'use client'

import { motion } from 'framer-motion'
import { FaGraduationCap, FaLightbulb, FaQuoteLeft } from 'react-icons/fa'

interface PsychologyEducationProps {
  currentIndex: number
}

export default function PsychologyEducation({ currentIndex }: PsychologyEducationProps) {
  const lessons = [
    {
      title: 'Warren Buffett의 역발상 투자',
      quote: "Be fearful when others are greedy, and greedy when others are fearful",
      translation: "다른 사람들이 탐욕스러울 때 두려워하고, 두려워할 때 탐욕스러워하라",
      lesson: '시장 심리의 극단에서 반대로 행동하는 것이 장기적 수익의 핵심입니다.',
      example: '2020년 3월 코로나 패닉 시 매수한 투자자들은 1년 내 200% 이상 수익'
    },
    {
      title: '군중 심리의 함정',
      quote: "The market is a device for transferring money from the impatient to the patient",
      translation: "시장은 조급한 사람에게서 인내심 있는 사람에게로 돈을 이동시키는 장치다",
      lesson: 'FOMO(Fear of Missing Out)와 패닉 셀링은 가장 큰 손실의 원인입니다.',
      example: '2021년 11월 ATH에서 매수한 투자자 vs 2022년 6월 바닥에서 매수한 투자자'
    },
    {
      title: '감정 제어의 중요성',
      quote: "The investor's chief problem - and even his worst enemy - is likely to be himself",
      translation: "투자자의 가장 큰 문제이자 최악의 적은 바로 자기 자신이다",
      lesson: '객관적 지표를 따르고 감정적 결정을 피하는 것이 성공의 열쇠입니다.',
      example: '공포탐욕 지수 20 이하에서 매수, 80 이상에서 매도 = 평균 73% 성공률'
    }
  ]

  // 현재 지수에 따라 적절한 교육 콘텐츠 선택
  const getCurrentLesson = () => {
    if (currentIndex <= 30) return lessons[0] // 공포 시 역발상 투자
    if (currentIndex >= 70) return lessons[1] // 탐욕 시 군중 심리
    return lessons[2] // 중립 시 감정 제어
  }

  const lesson = getCurrentLesson()

  return (
    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <FaGraduationCap className="text-purple-400 text-2xl" />
        <h2 className="text-2xl font-bold text-white">투자 심리학</h2>
      </div>

      <motion.div
        className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-500/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-4">
          <h3 className="text-xl font-bold text-purple-400 mb-2 flex items-center gap-2">
            <FaLightbulb />
            {lesson.title}
          </h3>
        </div>

        <div className="mb-6">
          <div className="flex items-start gap-3">
            <FaQuoteLeft className="text-gray-500 mt-1" />
            <div>
              <p className="text-lg text-white italic mb-2">"{lesson.quote}"</p>
              <p className="text-sm text-gray-400">- {lesson.translation}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gray-900/50 rounded-lg">
            <p className="text-sm font-semibold text-yellow-400 mb-2">핵심 교훈</p>
            <p className="text-sm text-gray-300">{lesson.lesson}</p>
          </div>

          <div className="p-4 bg-gray-900/50 rounded-lg">
            <p className="text-sm font-semibold text-blue-400 mb-2">실제 사례</p>
            <p className="text-sm text-gray-300">{lesson.example}</p>
          </div>
        </div>
      </motion.div>

      {/* 심리 사이클 */}
      <motion.div
        className="mt-6 p-4 bg-gray-900/50 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h4 className="text-lg font-semibold text-white mb-4">시장 심리 사이클</h4>
        
        <div className="grid grid-cols-5 gap-2 text-center">
          <div className={`p-3 rounded-lg ${currentIndex <= 20 ? 'bg-red-900/30 border border-red-500/50' : 'bg-gray-800/30'}`}>
            <p className="text-xs font-bold text-red-400">절망</p>
            <p className="text-xs text-gray-500">0-20</p>
          </div>
          <div className={`p-3 rounded-lg ${currentIndex > 20 && currentIndex <= 40 ? 'bg-orange-900/30 border border-orange-500/50' : 'bg-gray-800/30'}`}>
            <p className="text-xs font-bold text-orange-400">공포</p>
            <p className="text-xs text-gray-500">20-40</p>
          </div>
          <div className={`p-3 rounded-lg ${currentIndex > 40 && currentIndex <= 60 ? 'bg-yellow-900/30 border border-yellow-500/50' : 'bg-gray-800/30'}`}>
            <p className="text-xs font-bold text-yellow-400">희망</p>
            <p className="text-xs text-gray-500">40-60</p>
          </div>
          <div className={`p-3 rounded-lg ${currentIndex > 60 && currentIndex <= 80 ? 'bg-lime-900/30 border border-lime-500/50' : 'bg-gray-800/30'}`}>
            <p className="text-xs font-bold text-lime-400">낙관</p>
            <p className="text-xs text-gray-500">60-80</p>
          </div>
          <div className={`p-3 rounded-lg ${currentIndex > 80 ? 'bg-green-900/30 border border-green-500/50' : 'bg-gray-800/30'}`}>
            <p className="text-xs font-bold text-green-400">도취</p>
            <p className="text-xs text-gray-500">80-100</p>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
          <p className="text-xs text-gray-400">
            현재 시장: <span className={`font-bold ${
              currentIndex <= 20 ? 'text-red-400' :
              currentIndex <= 40 ? 'text-orange-400' :
              currentIndex <= 60 ? 'text-yellow-400' :
              currentIndex <= 80 ? 'text-lime-400' :
              'text-green-400'
            }`}>
              {currentIndex <= 20 ? '절망 (최고의 매수 기회)' :
               currentIndex <= 40 ? '공포 (매수 고려)' :
               currentIndex <= 60 ? '희망 (중립 관망)' :
               currentIndex <= 80 ? '낙관 (차익 실현)' :
               '도취 (매도 신호)'}
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  )
}