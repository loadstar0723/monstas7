'use client'

import React, { useState, useEffect } from 'react'
import { FaStream, FaExchangeAlt, FaClock, FaChartLine } from 'react-icons/fa'
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function GoStreamGRU() {
  const [streamData, setStreamData] = useState<any[]>([])
  const [pipelineStatus, setPipelineStatus] = useState<any>({})
  const [latencyData, setLatencyData] = useState<any[]>([])

  useEffect(() => {
    // 스트림 처리 데이터
    const sData = Array.from({ length: 30 }, (_, i) => ({
      time: `${i}s`,
      input: 900 + Math.sin(i * 0.35) * 250 + Math.cos(i * 0.45) * 180,
      reset: 880 + Math.sin(i * 0.4) * 240 + Math.cos(i * 0.5) * 170,
      update: 860 + Math.sin(i * 0.45) * 230 + Math.cos(i * 0.55) * 160,
      output: 840 + Math.sin(i * 0.5) * 220 + Math.cos(i * 0.6) * 150
    }))
    setStreamData(sData)

    // 파이프라인 상태
    setPipelineStatus({
      inputBuffer: 38,
      resetGate: 45,
      updateGate: 52,
      candidateState: 41,
      outputBuffer: 28
    })

    // 레이턴시 비교
    const lData = [
      { batch: '100', go: 0.6, python: 2.8, pytorch: 1.2 },
      { batch: '500', go: 1.8, python: 10.5, pytorch: 4.5 },
      { batch: '1000', go: 3.2, python: 22.8, pytorch: 9.2 },
      { batch: '5000', go: 12.5, python: 118.5, pytorch: 42.3 },
      { batch: '10000', go: 23.8, python: 258.2, pytorch: 89.5 }
    ]
    setLatencyData(lData)
  }, [])

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaStream className="text-blue-400" />
          Go GRU 실시간 스트리밍
        </h3>

        {/* 스트림 메트릭 */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">입력 속도</div>
            <div className="text-2xl font-bold text-green-400">1.1K/s</div>
            <div className="text-xs text-gray-500">시퀀스/초</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">리셋 게이트</div>
            <div className="text-2xl font-bold text-blue-400">1.08K/s</div>
            <div className="text-xs text-gray-500">처리/초</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">업데이트 게이트</div>
            <div className="text-2xl font-bold text-purple-400">1.06K/s</div>
            <div className="text-xs text-gray-500">처리/초</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">출력 속도</div>
            <div className="text-2xl font-bold text-yellow-400">1.04K/s</div>
            <div className="text-xs text-gray-500">예측/초</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">백프레셔</div>
            <div className="text-2xl font-bold text-red-400">1.5%</div>
            <div className="text-xs text-gray-500">버퍼 압력</div>
          </div>
        </div>

        {/* GRU 스트림 플로우 */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
          <h4 className="text-white font-semibold mb-3">GRU 게이트 스트림 플로우</h4>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={streamData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #3b82f6' }} />
              <Legend />
              <Area type="monotone" dataKey="input" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="입력" />
              <Area type="monotone" dataKey="reset" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="리셋" />
              <Area type="monotone" dataKey="update" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="업데이트" />
              <Area type="monotone" dataKey="output" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="출력" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* GRU 파이프라인 상태 */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3">GRU 파이프라인 버퍼 상태</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">입력 버퍼</span>
                  <span className="text-green-400">{pipelineStatus.inputBuffer}%</span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-green-400" style={{ width: `${pipelineStatus.inputBuffer}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">리셋 게이트</span>
                  <span className="text-blue-400">{pipelineStatus.resetGate}%</span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400" style={{ width: `${pipelineStatus.resetGate}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">업데이트 게이트</span>
                  <span className="text-purple-400">{pipelineStatus.updateGate}%</span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400" style={{ width: `${pipelineStatus.updateGate}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">후보 상태</span>
                  <span className="text-yellow-400">{pipelineStatus.candidateState}%</span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400" style={{ width: `${pipelineStatus.candidateState}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">출력 버퍼</span>
                  <span className="text-red-400">{pipelineStatus.outputBuffer}%</span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-500 to-red-400" style={{ width: `${pipelineStatus.outputBuffer}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* 배치 레이턴시 비교 */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3">배치 처리 레이턴시 (ms)</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={latencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="batch" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" scale="log" domain={[0.1, 1000]} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #3b82f6' }} />
                <Legend />
                <Line type="monotone" dataKey="go" stroke="#10b981" strokeWidth={2} name="Go GRU" />
                <Line type="monotone" dataKey="python" stroke="#f59e0b" strokeWidth={2} name="Python" />
                <Line type="monotone" dataKey="pytorch" stroke="#ef4444" strokeWidth={2} name="PyTorch" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 스트림 처리 특징 */}
        <div className="mt-6 grid grid-cols-4 gap-4">
          <div className="bg-gray-900/50 rounded p-3">
            <FaClock className="text-xl text-blue-400 mb-2" />
            <div className="text-sm font-semibold text-white">Zero-Copy</div>
            <div className="text-xs text-gray-400">게이트 간 직접 전달</div>
          </div>
          <div className="bg-gray-900/50 rounded p-3">
            <FaExchangeAlt className="text-xl text-green-400 mb-2" />
            <div className="text-sm font-semibold text-white">백프레셔 제어</div>
            <div className="text-xs text-gray-400">자동 속도 조절</div>
          </div>
          <div className="bg-gray-900/50 rounded p-3">
            <FaChartLine className="text-xl text-purple-400 mb-2" />
            <div className="text-sm font-semibold text-white">실시간 추론</div>
            <div className="text-xs text-gray-400">마이크로초 레이턴시</div>
          </div>
          <div className="bg-gray-900/50 rounded p-3">
            <FaStream className="text-xl text-yellow-400 mb-2" />
            <div className="text-sm font-semibold text-white">무한 스트림</div>
            <div className="text-xs text-gray-400">메모리 제한 없음</div>
          </div>
        </div>
      </div>
    </div>
  )
}