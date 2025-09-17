'use client';

import React, { useState } from 'react';

interface HedgeStrategy {
  id: string;
  name: string;
  type: 'futures' | 'options' | 'stablecoin' | 'inverse';
  riskReduction: number;
  cost: number;
  status: 'active' | 'inactive' | 'recommended';
  description: string;
}

export default function HedgingStrategies() {
  const [strategies] = useState<HedgeStrategy[]>([
    {
      id: '1',
      name: '선물 숏 포지션',
      type: 'futures',
      riskReduction: 45,
      cost: 0.5,
      status: 'recommended',
      description: '현물 포지션의 반대 방향 선물 계약으로 가격 하락 리스크 헤지'
    },
    {
      id: '2',
      name: '풋 옵션 매수',
      type: 'options',
      riskReduction: 35,
      cost: 2.5,
      status: 'inactive',
      description: '특정 가격 이하로 하락 시 손실을 제한하는 보험 역할'
    },
    {
      id: '3',
      name: '스테이블코인 할당',
      type: 'stablecoin',
      riskReduction: 25,
      cost: 0.1,
      status: 'active',
      description: '포트폴리오의 일부를 스테이블코인으로 보유하여 변동성 감소'
    },
    {
      id: '4',
      name: '인버스 ETF',
      type: 'inverse',
      riskReduction: 40,
      cost: 1.5,
      status: 'inactive',
      description: '시장 하락 시 수익을 내는 인버스 상품으로 포트폴리오 보호'
    }
  ]);

  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600 text-white';
      case 'recommended': return 'bg-blue-600 text-white';
      case 'inactive': return 'bg-gray-600 text-gray-300';
      default: return 'bg-gray-600 text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '활성';
      case 'recommended': return '추천';
      case 'inactive': return '비활성';
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'futures': return '📊';
      case 'options': return '🎯';
      case 'stablecoin': return '💵';
      case 'inverse': return '📉';
      default: return '📈';
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">헤징 전략</h2>
        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors">
          새 전략 추가
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {strategies.map((strategy) => (
          <div
            key={strategy.id}
            onClick={() => setSelectedStrategy(strategy.id)}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedStrategy === strategy.id
                ? 'border-purple-500 bg-purple-900/20'
                : 'border-gray-700 bg-gray-900/30 hover:bg-gray-900/50'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getTypeIcon(strategy.type)}</span>
                <div>
                  <h3 className="text-white font-bold">{strategy.name}</h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(strategy.status)}`}>
                    {getStatusText(strategy.status)}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-gray-400 text-sm mb-3">{strategy.description}</p>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">리스크 감소</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${strategy.riskReduction}%` }}
                    ></div>
                  </div>
                  <span className="text-green-400">{strategy.riskReduction}%</span>
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">비용 (연간)</span>
                <span className="text-yellow-400">{strategy.cost}%</span>
              </div>
            </div>

            {selectedStrategy === strategy.id && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors">
                    {strategy.status === 'active' ? '설정 변경' : '활성화'}
                  </button>
                  <button className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors">
                    상세 정보
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-gray-400 text-sm">활성 전략</div>
            <div className="text-2xl font-bold text-green-400">
              {strategies.filter(s => s.status === 'active').length}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">총 리스크 감소</div>
            <div className="text-2xl font-bold text-blue-400">
              {strategies
                .filter(s => s.status === 'active')
                .reduce((acc, s) => acc + s.riskReduction, 0)}%
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">총 비용</div>
            <div className="text-2xl font-bold text-yellow-400">
              {strategies
                .filter(s => s.status === 'active')
                .reduce((acc, s) => acc + s.cost, 0).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}