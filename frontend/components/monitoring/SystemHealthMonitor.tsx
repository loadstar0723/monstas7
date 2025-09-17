'use client';

import React, { useState, useEffect } from 'react';
import { tradingSystemConfig } from '@/lib/config/tradingSystemConfig';

interface SystemHealth {
  api: { status: string; latency: number; errors: number };
  models: { [key: string]: { status: string; accuracy: number; lastUpdate: string } };
  database: { status: string; connections: number; queryTime: number };
  websocket: { connected: number; total: number; reconnects: number };
}

export default function SystemHealthMonitor() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/system/health');
        const data = await response.json();
        setHealth(data);

        // 알림 체크
        const newAlerts = [];
        if (data.api.errors > 10) newAlerts.push('API 에러 임계값 초과');
        if (data.websocket.reconnects > 5) newAlerts.push('WebSocket 불안정');
        if (data.database.queryTime > 1000) newAlerts.push('DB 응답 지연');

        setAlerts(newAlerts);
      } catch (error) {
        console.error('Health check failed:', error);
        setAlerts(['시스템 헬스체크 실패']);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!health) return <div>Loading system status...</div>;

  return (
    <div className="p-4 bg-gray-900 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-white">시스템 상태 모니터</h2>

      {/* 긴급 알림 */}
      {alerts.length > 0 && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded">
          <h3 className="text-red-400 font-bold mb-2">⚠️ 긴급 알림</h3>
          {alerts.map((alert, i) => (
            <div key={i} className="text-red-300 text-sm">• {alert}</div>
          ))}
        </div>
      )}

      {/* 시스템 상태 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* API 상태 */}
        <div className="bg-gray-800 p-3 rounded">
          <div className="text-gray-400 text-xs mb-1">API</div>
          <div className={`font-bold ${health.api.status === 'healthy' ? 'text-green-400' : 'text-red-400'}`}>
            {health.api.status.toUpperCase()}
          </div>
          <div className="text-xs text-gray-500">
            {health.api.latency}ms | {health.api.errors} errors
          </div>
        </div>

        {/* WebSocket 상태 */}
        <div className="bg-gray-800 p-3 rounded">
          <div className="text-gray-400 text-xs mb-1">WebSocket</div>
          <div className="font-bold text-blue-400">
            {health.websocket.connected}/{health.websocket.total}
          </div>
          <div className="text-xs text-gray-500">
            재연결: {health.websocket.reconnects}회
          </div>
        </div>

        {/* Database 상태 */}
        <div className="bg-gray-800 p-3 rounded">
          <div className="text-gray-400 text-xs mb-1">Database</div>
          <div className={`font-bold ${health.database.queryTime < 500 ? 'text-green-400' : 'text-yellow-400'}`}>
            {health.database.status}
          </div>
          <div className="text-xs text-gray-500">
            쿼리: {health.database.queryTime}ms
          </div>
        </div>

        {/* 모델 상태 요약 */}
        <div className="bg-gray-800 p-3 rounded">
          <div className="text-gray-400 text-xs mb-1">AI Models</div>
          <div className="font-bold text-purple-400">
            {Object.values(health.models).filter(m => m.status === 'active').length} Active
          </div>
          <div className="text-xs text-gray-500">
            평균 정확도: {Math.round(
              Object.values(health.models).reduce((acc, m) => acc + m.accuracy, 0) /
              Object.keys(health.models).length
            )}%
          </div>
        </div>
      </div>

      {/* 모델별 상세 상태 */}
      <div className="mt-4">
        <h3 className="text-sm font-bold text-gray-300 mb-2">AI 모델 상태</h3>
        <div className="space-y-2">
          {Object.entries(health.models).map(([name, model]) => (
            <div key={name} className="flex items-center justify-between bg-gray-800 p-2 rounded">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  model.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                }`} />
                <span className="text-sm text-gray-300">{name.toUpperCase()}</span>
              </div>
              <div className="flex gap-4 text-xs">
                <span className="text-gray-400">정확도: {model.accuracy}%</span>
                <span className="text-gray-500">업데이트: {model.lastUpdate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 시스템 리소스 */}
      <div className="mt-4 flex gap-4 text-xs text-gray-400">
        <div>CPU: <span className="text-white">45%</span></div>
        <div>Memory: <span className="text-white">2.3GB/4GB</span></div>
        <div>Disk: <span className="text-white">38GB/50GB</span></div>
        <div>Network: <span className="text-white">1.2MB/s</span></div>
      </div>
    </div>
  );
}