'use client';

import React, { useEffect, useState } from 'react';
import { getAPIStats, getAPIReport } from '@/lib/services/apiUsageTracker';

interface APIUsageStat {
  name: string;
  used: number;
  limit: number;
  percentage: number;
  status: 'success' | 'warning' | 'danger';
  resetDate: Date;
  daysUntilReset: number;
}

export default function APIUsageDashboard() {
  const [stats, setStats] = useState<APIUsageStat[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState('');

  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 60000); // 1분마다 업데이트
    return () => clearInterval(interval);
  }, []);

  const updateStats = () => {
    const data = getAPIStats();
    setStats(data);
  };

  const viewReport = () => {
    const reportText = getAPIReport();
    setReport(reportText);
    setShowReport(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'danger': return 'text-red-500 bg-red-900/20';
      case 'warning': return 'text-yellow-500 bg-yellow-900/20';
      default: return 'text-green-500 bg-green-900/20';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'danger': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-100">API 사용량 모니터링</h2>
        <div className="flex gap-2">
          <button
            onClick={updateStats}
            className="px-3 py-1 bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 rounded text-sm transition-colors"
          >
            새로고침
          </button>
          <button
            onClick={viewReport}
            className="px-3 py-1 bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 rounded text-sm transition-colors"
          >
            리포트
          </button>
        </div>
      </div>

      {stats.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">아직 API 사용 기록이 없습니다</p>
          <p className="text-xs text-gray-500 mt-2">API 호출 시 자동으로 추적됩니다</p>
        </div>
      ) : (
        <div className="space-y-4">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-200 uppercase">{stat.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    리셋: {stat.daysUntilReset}일 후
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(stat.status)}`}>
                  {stat.percentage.toFixed(1)}%
                </span>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-sm text-gray-300 mb-1">
                  <span>{stat.used.toLocaleString()} 호출</span>
                  <span>{stat.limit.toLocaleString()} 한도</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getProgressColor(stat.status)}`}
                    style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                  />
                </div>
              </div>

              {stat.percentage >= 75 && (
                <div className={`mt-2 text-xs ${
                  stat.status === 'danger' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  ⚠️ {stat.status === 'danger' ? '한도 초과 임박!' : '사용량 주의'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 무료 플랜 정보 */}
      <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-800/50">
        <h3 className="text-sm font-semibold text-blue-300 mb-2">📌 현재 무료 플랜 한도</h3>
        <ul className="text-xs text-gray-300 space-y-1">
          <li>• CryptoCompare: 100,000/월</li>
          <li>• CoinGecko: 10,000/월</li>
          <li>• Binance: 1,200/분</li>
          <li>• Alternative.me: 10,000/일</li>
        </ul>
      </div>

      {/* 리포트 모달 */}
      {showReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-100">API 사용량 리포트</h3>
              <button
                onClick={() => setShowReport(false)}
                className="text-gray-400 hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
            <pre className="text-xs text-gray-300 bg-gray-800 rounded p-4 overflow-auto">
              {report}
            </pre>
            <div className="mt-4 text-xs text-gray-400">
              <p>💡 팁: 75% 이상 사용 시 유료 플랜 고려</p>
              <p>📅 매월 1일 자동 리셋</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}