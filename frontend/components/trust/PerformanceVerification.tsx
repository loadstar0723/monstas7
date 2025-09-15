'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FaShieldAlt, FaCheckDouble, FaExternalLinkAlt,
  FaChartBar, FaCertificate, FaLock, FaHistory,
  FaUserCheck, FaGlobe, FaCodeBranch
} from 'react-icons/fa'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, PieChart, Pie, Cell
} from 'recharts'

interface VerificationData {
  id: string
  type: 'trade' | 'signal' | 'performance' | 'audit'
  timestamp: Date
  verifier: string
  status: 'verified' | 'pending' | 'failed'
  hash: string
  details: {
    metric: string
    value: any
    proof?: string
  }[]
}

interface AuditReport {
  id: string
  date: Date
  auditor: string
  scope: string[]
  findings: {
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
    status: 'resolved' | 'pending'
  }[]
  score: number
}

export default function PerformanceVerification() {
  const [verificationHistory, setVerificationHistory] = useState<VerificationData[]>([
    {
      id: 'VER001',
      type: 'performance',
      timestamp: new Date('2024-01-20 10:00:00'),
      verifier: 'Chainlink Oracle',
      status: 'verified',
      hash: '0x1234...abcd',
      details: [
        { metric: '월간 수익률', value: '+15.3%', proof: 'ipfs://...' },
        { metric: '예측 정확도', value: '72.5%', proof: 'ipfs://...' }
      ]
    },
    {
      id: 'VER002',
      type: 'trade',
      timestamp: new Date('2024-01-19 15:30:00'),
      verifier: 'Binance API',
      status: 'verified',
      hash: '0x5678...efgh',
      details: [
        { metric: '거래량', value: '$125,340', proof: 'api://...' },
        { metric: '승률', value: '68%', proof: 'api://...' }
      ]
    }
  ])

  const [auditReports, setAuditReports] = useState<AuditReport[]>([
    {
      id: 'AUDIT001',
      date: new Date('2024-01-15'),
      auditor: 'CertiK',
      scope: ['Smart Contracts', 'API Security', 'Data Integrity'],
      findings: [
        { severity: 'low', description: 'Minor optimization in data caching', status: 'resolved' },
        { severity: 'medium', description: 'Rate limiting improvement needed', status: 'pending' }
      ],
      score: 92
    }
  ])

  const [performanceMetrics] = useState([
    { metric: '정확도', value: 85, benchmark: 70 },
    { metric: '일관성', value: 92, benchmark: 80 },
    { metric: '투명성', value: 98, benchmark: 90 },
    { metric: '신뢰성', value: 88, benchmark: 85 },
    { metric: '보안', value: 95, benchmark: 90 }
  ])

  const [trustScore] = useState({
    overall: 91,
    components: [
      { name: '성과 검증', value: 35, max: 40 },
      { name: '제3자 감사', value: 28, max: 30 },
      { name: '사용자 평가', value: 18, max: 20 },
      { name: '실시간 모니터링', value: 10, max: 10 }
    ]
  })

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444']

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-orange-400'
      case 'critical': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Trust Score Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg p-6 border border-green-500/30"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <FaShieldAlt className="text-green-400" />
              신뢰성 점수
            </h2>
            <p className="text-gray-400 mt-1">독립적으로 검증된 성과 지표</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-green-400">{trustScore.overall}</div>
            <p className="text-sm text-gray-400">/ 100</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {trustScore.components.map((component, index) => (
            <div key={index} className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">{component.name}</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-white">{component.value}</span>
                <span className="text-sm text-gray-500 mb-1">/ {component.max}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(component.value / component.max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Performance Metrics Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaChartBar className="text-blue-400" />
            성과 지표
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={performanceMetrics}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="metric" stroke="#9CA3AF" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9CA3AF" />
                <Radar
                  name="실제 성과"
                  dataKey="value"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.3}
                />
                <Radar
                  name="벤치마크"
                  dataKey="benchmark"
                  stroke="#6B7280"
                  fill="#6B7280"
                  fillOpacity={0.1}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                  labelStyle={{ color: '#9CA3AF' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaCertificate className="text-yellow-400" />
            검증 상태
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: '검증됨', value: 85 },
                    { name: '대기중', value: 10 },
                    { name: '실패', value: 5 }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#10B981" />
                  <Cell fill="#F59E0B" />
                  <Cell fill="#EF4444" />
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                  labelStyle={{ color: '#9CA3AF' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm text-gray-400">검증됨</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <span className="text-sm text-gray-400">대기중</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-sm text-gray-400">실패</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Verification History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaHistory className="text-purple-400" />
          검증 기록
        </h3>

        <div className="space-y-3">
          {verificationHistory.map((verification) => (
            <div
              key={verification.id}
              className="bg-gray-900 rounded-lg p-4 border border-gray-700/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FaCheckDouble className={
                      verification.status === 'verified' ? 'text-green-400' :
                      verification.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                    } />
                    <h4 className="text-white font-semibold">
                      {verification.type === 'performance' ? '성과 검증' :
                       verification.type === 'trade' ? '거래 검증' :
                       verification.type === 'signal' ? '시그널 검증' : '감사'}
                    </h4>
                    <span className="text-xs text-gray-400">
                      {verification.timestamp.toLocaleString('ko-KR')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">검증기관</p>
                      <p className="text-white flex items-center gap-1">
                        {verification.verifier}
                        <FaExternalLinkAlt className="text-xs text-gray-500" />
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">블록체인 해시</p>
                      <p className="text-white font-mono text-xs">{verification.hash}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">검증 항목</p>
                      <p className="text-white">{verification.details.length}개</p>
                    </div>
                  </div>

                  {verification.details.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="grid grid-cols-2 gap-2">
                        {verification.details.map((detail, index) => (
                          <div key={index} className="text-sm">
                            <span className="text-gray-400">{detail.metric}: </span>
                            <span className="text-white font-semibold">{detail.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="ml-4">
                  <button className="text-blue-400 hover:text-blue-300 p-2">
                    <FaExternalLinkAlt />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Audit Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaUserCheck className="text-orange-400" />
          제3자 감사 보고서
        </h3>

        <div className="space-y-4">
          {auditReports.map((report) => (
            <div
              key={report.id}
              className="bg-gray-900 rounded-lg p-4 border border-gray-700/50"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-white font-semibold flex items-center gap-2">
                    {report.auditor}
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                      점수: {report.score}/100
                    </span>
                  </h4>
                  <p className="text-sm text-gray-400">
                    {report.date.toLocaleDateString('ko-KR')} • 
                    범위: {report.scope.join(', ')}
                  </p>
                </div>
                <button className="text-blue-400 hover:text-blue-300">
                  <FaExternalLinkAlt />
                </button>
              </div>

              {report.findings.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-400 mb-2">발견사항:</p>
                  {report.findings.map((finding, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <span className={`${getSeverityColor(finding.severity)} font-semibold`}>
                        [{finding.severity.toUpperCase()}]
                      </span>
                      <span className="text-gray-300 flex-1">{finding.description}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        finding.status === 'resolved' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {finding.status === 'resolved' ? '해결됨' : '진행중'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Blockchain Verification */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4"
      >
        <p className="text-blue-400 text-sm flex items-center gap-2">
          <FaLock />
          모든 성과 데이터는 블록체인에 기록되어 변조가 불가능합니다.
          <a href="#" className="underline hover:text-blue-300">검증 방법 보기</a>
        </p>
      </motion.div>
    </div>
  )
}