'use client';

import React from 'react';
import APIUsageDashboard from '@/components/APIUsageDashboard';
import GoEngineStatus from '@/components/GoEngineStatus';

export default function APIMonitorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">
            API 모니터링 센터
          </h1>
          <p className="text-gray-400">
            실시간 API 사용량 추적 및 비용 관리
          </p>
        </div>

        {/* Go 엔진 상태 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-200 mb-3">
            🚀 엔진 상태
          </h2>
          <GoEngineStatus />
        </div>

        {/* API 사용량 대시보드 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-200 mb-3">
            📊 API 사용량
          </h2>
          <APIUsageDashboard />
        </div>

        {/* 비용 절감 가이드 */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-green-400 mb-4">
              💰 비용 절감 팁
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Go 엔진 캐싱으로 API 호출 50% 절감</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>WebSocket 우선 사용 (무제한)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>불필요한 실시간 업데이트 제거</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>배치 요청으로 호출 횟수 감소</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-blue-400 mb-4">
              📈 업그레이드 시기
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                <span>월 사용량 75% 초과 시</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                <span>Rate Limit 자주 도달 시</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                <span>월 수익 $1,000 이상 시</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                <span>사용자 100명 이상 시</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 현재 플랜 요약 */}
        <div className="mt-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-6 border border-purple-800/50">
          <h3 className="text-lg font-semibold text-purple-300 mb-4">
            📋 현재 플랜 상태
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">$0</p>
              <p className="text-xs text-gray-400 mt-1">월 비용</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">5</p>
              <p className="text-xs text-gray-400 mt-1">API 제공자</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">120K</p>
              <p className="text-xs text-gray-400 mt-1">월 총 한도</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">무제한</p>
              <p className="text-xs text-gray-400 mt-1">WebSocket</p>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={() => window.open('https://www.cryptocompare.com/api/', '_blank')}
            className="px-6 py-2 bg-green-900/30 hover:bg-green-900/50 text-green-300 rounded-lg transition-colors"
          >
            API 키 관리
          </button>
          <button
            onClick={() => console.log('사용량 리포트 다운로드')}
            className="px-6 py-2 bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 rounded-lg transition-colors"
          >
            리포트 다운로드
          </button>
        </div>
      </div>
    </div>
  );
}