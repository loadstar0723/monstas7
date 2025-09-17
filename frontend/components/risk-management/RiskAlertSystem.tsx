'use client';

import React, { useState, useEffect } from 'react';

interface RiskAlert {
  id: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
}

export default function RiskAlertSystem() {
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    // Initialize with some default alerts
    const defaultAlerts: RiskAlert[] = [
      {
        id: '1',
        level: 'medium',
        message: '포트폴리오 변동성 증가 감지',
        timestamp: new Date()
      }
    ];
    setAlerts(defaultAlerts);
  }, []);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getLevelBgColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-900/20 border-red-600/30';
      case 'high': return 'bg-orange-900/20 border-orange-600/30';
      case 'medium': return 'bg-yellow-900/20 border-yellow-600/30';
      case 'low': return 'bg-green-900/20 border-green-600/30';
      default: return 'bg-gray-900/20 border-gray-600/30';
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">리스크 알림 시스템</h2>
        <button
          onClick={() => setIsMonitoring(!isMonitoring)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isMonitoring
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-600 hover:bg-gray-700 text-white'
          }`}
        >
          {isMonitoring ? '모니터링 중' : '일시정지'}
        </button>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            현재 활성 알림이 없습니다
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded-lg p-4 ${getLevelBgColor(alert.level)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`font-bold uppercase ${getLevelColor(alert.level)}`}>
                      {alert.level}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {alert.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-300">{alert.message}</p>
                </div>
                <button
                  onClick={() => setAlerts(alerts.filter(a => a.id !== alert.id))}
                  className="text-gray-500 hover:text-gray-300 ml-4"
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}