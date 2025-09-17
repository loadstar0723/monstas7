'use client';

import React, { useEffect, useState } from 'react';
import { goTradingEngine, PerformanceMetrics } from '@/lib/api/goTradingEngine';

export default function GoEngineStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkEngineStatus();
    const interval = setInterval(checkEngineStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkEngineStatus = async () => {
    try {
      const healthy = await goTradingEngine.healthCheck();
      setIsConnected(healthy);

      if (healthy) {
        const performance = await goTradingEngine.getPerformance();
        setMetrics(performance);
      }
    } catch (error) {
      console.error('Go Engine 상태 확인 실패:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
        <div className="animate-pulse flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
          <div className="h-4 bg-gray-700 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full animate-pulse ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="text-sm font-semibold text-gray-300">
            Go Trading Engine
          </span>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${
          isConnected ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
        }`}>
          {isConnected ? 'ONLINE' : 'OFFLINE'}
        </span>
      </div>

      {isConnected && metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="space-y-1">
            <p className="text-xs text-gray-400">처리량</p>
            <p className="text-sm font-bold text-green-400">
              {metrics.processedPerSecond.toLocaleString()}/s
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-gray-400">활성 연결</p>
            <p className="text-sm font-bold text-blue-400">
              {metrics.activeConnections}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-gray-400">메모리</p>
            <p className="text-sm font-bold text-yellow-400">
              {metrics.memoryUsageMB} MB
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-gray-400">CPU</p>
            <p className="text-sm font-bold text-purple-400">
              {metrics.cpuUsagePercent}%
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-gray-400">레이턴시</p>
            <p className="text-sm font-bold text-cyan-400">
              {metrics.latencyMs} ms
            </p>
          </div>
        </div>
      )}

      {!isConnected && (
        <div className="text-center py-4">
          <p className="text-sm text-red-400 mb-2">엔진이 오프라인 상태입니다</p>
          <button
            onClick={checkEngineStatus}
            className="text-xs px-3 py-1 bg-red-900/30 hover:bg-red-900/50 text-red-300 rounded transition-colors"
          >
            재연결 시도
          </button>
        </div>
      )}
    </div>
  );
}