'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { config } from '@/lib/config'

export default function Page() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: API 호출로 실제 데이터 가져오기
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      {/* 헤더 */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
          <Link href="/" className="hover:text-white">홈</Link>
          <span>/</span>
          <span>텔레그램 봇</span>
          <span>/</span>
          <span className="text-white">그룹 관리</span>
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-2">그룹 관리</h1>
        <p className="text-gray-400">카테고리: 텔레그램 봇</p>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="bg-gray-800/50 rounded-xl p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">데이터 로딩 중...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 카드 1 - 개발 예정 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">개발 예정</h3>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                  Coming Soon
                </span>
              </div>
              <p className="text-gray-400 mb-4">
                이 기능은 현재 개발 중입니다. 곧 업데이트될 예정입니다.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">예상 완료</span>
                  <span className="text-gray-300">2025 Q1</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">우선순위</span>
                  <span className="text-purple-400">높음</span>
                </div>
              </div>
            </div>

            {/* 카드 2 - 기능 소개 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">주요 기능</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>실시간 데이터 분석</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>AI 기반 예측</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>자동화된 거래 실행</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>리스크 관리 도구</span>
                </li>
              </ul>
            </div>

            {/* 카드 3 - 통계 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">예상 성능</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">정확도</span>
                    <span className="text-green-400">${config.percentage.value87}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-400 h-2 rounded-full" style={{width: '${config.percentage.value87}'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">처리 속도</span>
                    <span className="text-blue-400">${config.percentage.value95}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-400 h-2 rounded-full" style={{width: '${config.percentage.value95}'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">사용자 만족도</span>
                    <span className="text-purple-400">${config.percentage.value92}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-400 h-2 rounded-full" style={{width: '${config.percentage.value92}'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 개발 로드맵 */}
        <div className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">개발 로드맵</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-3 h-3 bg-green-400 rounded-full mt-1.5"></div>
              <div className="flex-1">
                <h4 className="text-white font-semibold">Phase 1: 기본 구조</h4>
                <p className="text-gray-400 text-sm">UI/UX 디자인, 데이터베이스 설계</p>
              </div>
              <span className="text-green-400 text-sm">완료</span>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-3 h-3 bg-yellow-400 rounded-full mt-1.5"></div>
              <div className="flex-1">
                <h4 className="text-white font-semibold">Phase 2: 핵심 기능</h4>
                <p className="text-gray-400 text-sm">API 연동, 실시간 데이터 처리</p>
              </div>
              <span className="text-yellow-400 text-sm">진행 중</span>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-3 h-3 bg-gray-600 rounded-full mt-1.5"></div>
              <div className="flex-1">
                <h4 className="text-white font-semibold">Phase 3: AI 통합</h4>
                <p className="text-gray-400 text-sm">머신러닝 모델, 예측 엔진</p>
              </div>
              <span className="text-gray-400 text-sm">예정</span>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-3 h-3 bg-gray-600 rounded-full mt-1.5"></div>
              <div className="flex-1">
                <h4 className="text-white font-semibold">Phase 4: 최적화</h4>
                <p className="text-gray-400 text-sm">성능 개선, 사용자 피드백 반영</p>
              </div>
              <span className="text-gray-400 text-sm">예정</span>
            </div>
          </div>
        </div>

        {/* TODO 리스트 */}
        <div className="mt-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-700/30">
          <h3 className="text-xl font-bold text-white mb-4">📋 구현 예정 기능</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-300">
                <input type="checkbox" className="w-4 h-4 rounded" disabled />
                <span>실시간 WebSocket 연결</span>
              </label>
              <label className="flex items-center gap-2 text-gray-300">
                <input type="checkbox" className="w-4 h-4 rounded" disabled />
                <span>PostgreSQL 데이터베이스 연동</span>
              </label>
              <label className="flex items-center gap-2 text-gray-300">
                <input type="checkbox" className="w-4 h-4 rounded" disabled />
                <span>FastAPI 백엔드 통합</span>
              </label>
              <label className="flex items-center gap-2 text-gray-300">
                <input type="checkbox" className="w-4 h-4 rounded" disabled />
                <span>차트 라이브러리 구현</span>
              </label>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-300">
                <input type="checkbox" className="w-4 h-4 rounded" disabled />
                <span>사용자 인증 시스템</span>
              </label>
              <label className="flex items-center gap-2 text-gray-300">
                <input type="checkbox" className="w-4 h-4 rounded" disabled />
                <span>구독 등급 체크</span>
              </label>
              <label className="flex items-center gap-2 text-gray-300">
                <input type="checkbox" className="w-4 h-4 rounded" disabled />
                <span>다국어 지원</span>
              </label>
              <label className="flex items-center gap-2 text-gray-300">
                <input type="checkbox" className="w-4 h-4 rounded" disabled />
                <span>모바일 반응형 최적화</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
