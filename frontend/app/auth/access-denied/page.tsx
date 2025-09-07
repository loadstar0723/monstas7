'use client'

import Link from 'next/link'
import { FaExclamationTriangle, FaHome, FaSignInAlt } from 'react-icons/fa'

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-purple-500/20">
          <div className="text-center">
            {/* 경고 아이콘 */}
            <div className="mb-6">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <FaExclamationTriangle className="text-4xl text-red-500" />
              </div>
            </div>

            {/* 제목 */}
            <h1 className="text-3xl font-bold text-white mb-2">접근 거부</h1>
            <p className="text-gray-400 mb-8">
              이 페이지에 접근할 권한이 없습니다.
            </p>

            {/* 안내 메시지 */}
            <div className="bg-gray-800/50 rounded-lg p-4 mb-8">
              <p className="text-sm text-gray-300">
                로그인이 필요하거나 접근 권한이 부족합니다.
                계정이 있으시다면 로그인해 주세요.
              </p>
            </div>

            {/* 버튼 */}
            <div className="space-y-3">
              <Link
                href="/auth/signin"
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg px-6 py-3 font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
              >
                <FaSignInAlt />
                로그인하기
              </Link>
              
              <Link
                href="/"
                className="w-full bg-gray-800 text-gray-300 rounded-lg px-6 py-3 font-medium hover:bg-gray-700 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <FaHome />
                홈으로 돌아가기
              </Link>
            </div>
          </div>
        </div>

        {/* 추가 도움말 */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            문제가 계속되면 관리자에게 문의하세요
          </p>
        </div>
      </div>
    </div>
  )
}