'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface DrawdownData {
  date: string;
  value: number;
  drawdown: number;
}

export default function DrawdownAnalysis() {
  const [drawdownData, setDrawdownData] = useState<DrawdownData[]>([]);
  const [maxDrawdown, setMaxDrawdown] = useState(0);
  const [currentDrawdown, setCurrentDrawdown] = useState(0);
  const [avgDrawdown, setAvgDrawdown] = useState(0);

  useEffect(() => {
    // Generate sample drawdown data
    const generateDrawdownData = () => {
      const data: DrawdownData[] = [];
      let peak = 100;
      let currentValue = 100;

      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (30 - i));

        // Simulate price movement
        const change = (Math.random() - 0.48) * 5;
        currentValue = Math.max(50, Math.min(150, currentValue + change));

        if (currentValue > peak) {
          peak = currentValue;
        }

        const drawdown = ((peak - currentValue) / peak) * 100;

        data.push({
          date: date.toISOString().split('T')[0],
          value: currentValue,
          drawdown: -drawdown
        });
      }

      return data;
    };

    const data = generateDrawdownData();
    setDrawdownData(data);

    // Calculate metrics
    const drawdowns = data.map(d => Math.abs(d.drawdown));
    setMaxDrawdown(Math.max(...drawdowns));
    setCurrentDrawdown(drawdowns[drawdowns.length - 1]);
    setAvgDrawdown(drawdowns.reduce((a, b) => a + b, 0) / drawdowns.length);
  }, []);

  return (
    <div className="bg-gray-800/50 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-6">드로다운 분석</h2>

      {/* Metrics Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">최대 드로다운</div>
          <div className="text-2xl font-bold text-red-400">
            -{maxDrawdown.toFixed(2)}%
          </div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">현재 드로다운</div>
          <div className="text-2xl font-bold text-yellow-400">
            -{currentDrawdown.toFixed(2)}%
          </div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">평균 드로다운</div>
          <div className="text-2xl font-bold text-blue-400">
            -{avgDrawdown.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Drawdown Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={drawdownData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              stroke="#9CA3AF"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.split('-').slice(1).join('/')}
            />
            <YAxis
              stroke="#9CA3AF"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
              formatter={(value: number) => [`${value.toFixed(2)}%`, 'Drawdown']}
            />
            <Area
              type="monotone"
              dataKey="drawdown"
              stroke="#EF4444"
              fill="#EF4444"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Risk Levels */}
      <div className="mt-6 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">안전 수준 (0-5%)</span>
          <div className="flex-1 mx-4 h-2 bg-green-900/30 rounded-full overflow-hidden">
            <div className="h-full bg-green-500" style={{ width: '100%' }}></div>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">주의 수준 (5-10%)</span>
          <div className="flex-1 mx-4 h-2 bg-yellow-900/30 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-500" style={{ width: '66%' }}></div>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">위험 수준 (10%+)</span>
          <div className="flex-1 mx-4 h-2 bg-red-900/30 rounded-full overflow-hidden">
            <div className="h-full bg-red-500" style={{ width: '33%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}