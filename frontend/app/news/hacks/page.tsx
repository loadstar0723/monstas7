'use client'

import { useState, useEffect } from 'react'
import { translateToKorean, translateNewsBody } from '@/lib/translateService'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AlertTriangle, Shield, TrendingDown, DollarSign, Users,
  Activity, AlertCircle, CheckCircle, XCircle, Clock,
  Lock, Unlock, Eye, EyeOff, Zap, Database, Globe,
  Server, Wifi, WifiOff, ShieldOff, ShieldCheck
} from 'lucide-react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
  ScatterChart, Scatter, ComposedChart, Treemap, FunnelChart, Funnel, LabelList
} from 'recharts'
import { hacksAlertService, HackIncident, SecurityAlert, VulnerabilityReport } from '@/lib/services/hacksAlert'
import NewsModuleWrapper from '../components/NewsModuleWrapper'

// 차트 색상 팔레트
const COLORS = ['#ff4444', '#ff8844', '#ffaa44', '#ffdd44', '#44ff44', '#4444ff', '#ff44ff', '#44ffff']
const SEVERITY_COLORS = {
  critical: '#ff0000',
  high: '#ff6600',
  medium: '#ffaa00',
  low: '#00aa00'
}

export default function HacksNewsModule() {
  const [selectedCoin, setSelectedCoin] = useState('ALL')
  const [recentHacks, setRecentHacks] = useState<HackIncident[]>([])
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([])
  const [vulnerabilities, setVulnerabilities] = useState<VulnerabilityReport[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [securityScores, setSecurityScores] = useState<any[]>([])
  const [selectedIncident, setSelectedIncident] = useState<HackIncident | null>(null)
  const [loading, setLoading] = useState(true)

  // 코인 목록
  const coins = ['ALL', 'BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'DOT', 'MATIC']

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [hacks, alerts, vulns, stats, scores] = await Promise.all([
          hacksAlertService.getRecentHacks(24),
          hacksAlertService.getSecurityAlerts(),
          hacksAlertService.getVulnerabilityReports(),
          hacksAlertService.getHackStatistics(),
          hacksAlertService.getSecurityScores(['Ethereum', 'BSC', 'Polygon', 'Arbitrum', 'Avalanche'])
        ])

        setRecentHacks(hacks)
        setSecurityAlerts(alerts)
        setVulnerabilities(vulns)
        setStatistics(stats)
        setSecurityScores(scores)
      } catch (error) {
        console.error('Failed to load hacks data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
    const interval = setInterval(loadData, 60000) // 1분마다 업데이트

    return () => clearInterval(interval)
  }, [selectedCoin])

  // 실시간 알림 구독
  useEffect(() => {
    let cleanup: (() => void) | null = null

    const subscribeToAlerts = async () => {
      cleanup = await hacksAlertService.streamHackAlerts((alert) => {
        if ('platform' in alert) {
          setRecentHacks(prev => [alert as HackIncident, ...prev].slice(0, 10))
        } else {
          setSecurityAlerts(prev => [alert as SecurityAlert, ...prev].slice(0, 10))
        }
      })
    }

    subscribeToAlerts()

    return () => {
      if (cleanup) cleanup()
    }
  }, [])

  // 심각도별 사건 수 계산
  const severityDistribution = recentHacks.reduce((acc, hack) => {
    acc[hack.severity] = (acc[hack.severity] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const severityData = Object.entries(severityDistribution).map(([severity, count]) => ({
    name: severity,
    value: count,
    fill: SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS]
  }))

  // 시간대별 해킹 추세
  const hourlyTrend = Array.from({ length: 24 }, (_, i) => {
    const hour = new Date().getHours()
    return {
      hour: `${(hour - 23 + i + 24) % 24}시`,
      incidents: Math.floor(5 + Math.sin(i * 0.5) * 3),
      loss: Math.floor(1000000 + Math.sin(i * 0.3) * 500000)
    }
  })

  // 공격 벡터별 분포
  const attackVectorData = statistics?.topAttackVectors?.map((vector: any) => ({
    vector: vector.vector,
    count: vector.count,
    loss: vector.totalLoss / 1000000
  })) || []

  // 플랫폼별 피해 규모
  const platformLossData = statistics?.affectedPlatforms?.map((platform: any) => ({
    name: platform.platform,
    incidents: platform.incidents,
    loss: platform.totalLoss / 1000000
  })) || []

  return (
    <NewsModuleWrapper moduleName="HacksNewsModule">
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-white">{translateToKorean("🚨 해킹 & 보안 알림")}</h1>
          <p className="text-gray-400">{translateNewsBody("실시간 해킹 사건, 보안 위협, 취약점 모니터링")}</p>
        </div>

        {/* 코인 선택 */}
        <div className="mb-6">
          <Select value={selectedCoin} onValueChange={setSelectedCoin}>
            <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {coins.map(coin => (
                <SelectItem key={coin} value={coin}>{coin}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-red-500/30"
          >
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <Badge variant="destructive">실시간</Badge>
            </div>
            <div className="text-2xl font-bold">{statistics?.total24h || 0}</div>
            <div className="text-sm text-gray-400">24시간 내 사건</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-orange-500/30"
          >
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-8 w-8 text-orange-500" />
              <Badge className="bg-orange-500">손실</Badge>
            </div>
            <div className="text-2xl font-bold">
              ${((statistics?.totalLossUSD || 0) / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm text-gray-400">총 피해 규모</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-green-500/30"
          >
            <div className="flex items-center justify-between mb-2">
              <Shield className="h-8 w-8 text-green-500" />
              <Badge className="bg-green-500">회수</Badge>
            </div>
            <div className="text-2xl font-bold">
              ${((statistics?.recoveredUSD || 0) / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm text-gray-400">회수된 자금</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30"
          >
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-purple-500" />
              <Badge className="bg-purple-500">영향</Badge>
            </div>
            <div className="text-2xl font-bold">
              {recentHacks.reduce((sum, h) => sum + h.affectedUsers, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">영향받은 사용자</div>
          </motion.div>
        </div>

        {/* 메인 탭 */}
        <Tabs defaultValue="incidents" className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full bg-gray-800">
            <TabsTrigger value="incidents">최근 사건</TabsTrigger>
            <TabsTrigger value="alerts">보안 알림</TabsTrigger>
            <TabsTrigger value="vulnerabilities">취약점</TabsTrigger>
            <TabsTrigger value="statistics">통계 분석</TabsTrigger>
            <TabsTrigger value="prevention">예방 가이드</TabsTrigger>
          </TabsList>

          {/* 최근 사건 탭 */}
          <TabsContent value="incidents" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 사건 목록 */}
              <div className="bg-gray-800/30 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  실시간 해킹 사건
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentHacks.map((hack) => (
                    <motion.div
                      key={hack.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedIncident?.id === hack.id
                          ? 'bg-red-900/30 border-red-500'
                          : 'bg-gray-800/50 border-gray-700 hover:border-red-500/50'
                      }`}
                      onClick={() => setSelectedIncident(hack)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            hack.severity === 'critical' ? 'destructive' :
                            hack.severity === 'high' ? 'default' :
                            'secondary'
                          }>
                            {hack.severity}
                          </Badge>
                          <Badge variant="outline">{hack.type}</Badge>
                          {hack.status === 'ongoing' && (
                            <Badge className="bg-red-500 animate-pulse">진행중</Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(hack.timestamp).toLocaleString('ko-KR')}
                        </span>
                      </div>
                      <div className="font-semibold mb-1">{hack.platform}</div>
                      <div className="text-sm text-gray-400 mb-2">{hack.description}</div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-red-400">
                          ${(hack.amountUSD / 1000000).toFixed(2)}M 손실
                        </span>
                        <span className="text-gray-500">
                          {hack.affectedUsers.toLocaleString()}명 피해
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* 선택된 사건 상세 */}
              <div className="bg-gray-800/30 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-500" />
                  사건 상세 정보
                </h3>
                {selectedIncident ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-900/50 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-400">플랫폼</div>
                          <div className="font-semibold">{selectedIncident.platform}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">공격 유형</div>
                          <div className="font-semibold">{selectedIncident.type}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">공격 벡터</div>
                          <div className="font-semibold">{selectedIncident.attackVector}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">상태</div>
                          <Badge variant={
                            selectedIncident.status === 'resolved' ? 'default' :
                            selectedIncident.status === 'ongoing' ? 'destructive' :
                            'secondary'
                          }>
                            {selectedIncident.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-900/50 rounded-lg">
                      <div className="text-sm text-gray-400 mb-2">피해 규모</div>
                      <div className="text-2xl font-bold text-red-400 mb-2">
                        ${selectedIncident.amountUSD.toLocaleString()}
                      </div>
                      {selectedIncident.recovered && (
                        <div className="text-sm text-green-400">
                          회수: ${selectedIncident.recoveredAmount?.toLocaleString()}
                        </div>
                      )}
                    </div>

                    {selectedIncident.txHash && (
                      <div className="p-4 bg-gray-900/50 rounded-lg">
                        <div className="text-sm text-gray-400 mb-2">트랜잭션</div>
                        <div className="font-mono text-xs break-all">{selectedIncident.txHash}</div>
                      </div>
                    )}

                    <div className="p-4 bg-gray-900/50 rounded-lg">
                      <div className="text-sm text-gray-400 mb-2">설명</div>
                      <div className="text-sm">{selectedIncident.description}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-20">
                    사건을 선택하면 상세 정보를 확인할 수 있습니다
                  </div>
                )}
              </div>
            </div>

            {/* 심각도 분포 차트 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800/30 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">{translateToKorean("심각도별 분포")}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-800/30 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">{translateToKorean("24시간 추세")}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={hourlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="hour" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: 'none' }} />
                    <Area type="monotone" dataKey="incidents" stroke="#ff6b6b" fill="#ff6b6b" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          {/* 보안 알림 탭 */}
          <TabsContent value="alerts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {securityAlerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-800/30 rounded-lg p-6 border border-gray-700"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {alert.type === 'critical' ? (
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                      ) : alert.type === 'warning' ? (
                        <AlertCircle className="h-6 w-6 text-yellow-500" />
                      ) : (
                        <Shield className="h-6 w-6 text-blue-500" />
                      )}
                      <div>
                        <h4 className="font-semibold">{alert.title}</h4>
                        <Badge variant="outline" className="mt-1">{alert.category}</Badge>
                      </div>
                    </div>
                    <Badge variant={
                      alert.mitigationStatus === 'completed' ? 'default' :
                      alert.mitigationStatus === 'in_progress' ? 'secondary' :
                      'destructive'
                    }>
                      {alert.mitigationStatus}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-400 mb-4">{alert.description}</p>

                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-2">위험도 점수</div>
                    <div className="flex items-center gap-2">
                      <Progress value={alert.riskScore} className="flex-1" />
                      <span className="text-sm font-semibold">{alert.riskScore}%</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-2">영향받는 플랫폼</div>
                    <div className="flex flex-wrap gap-2">
                      {alert.affectedPlatforms.map((platform) => (
                        <Badge key={platform} variant="secondary">{platform}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 mb-2">권장 조치</div>
                    <ul className="text-sm space-y-1">
                      {alert.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* 취약점 탭 */}
          <TabsContent value="vulnerabilities" className="space-y-6">
            <div className="bg-gray-800/30 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      플랫폼
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      취약점 유형
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      CVSS 점수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      심각도
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      패치 상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      버그 바운티
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {vulnerabilities.map((vuln) => (
                    <tr key={vuln.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">{vuln.platform}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{vuln.vulnerabilityType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold">{vuln.cvssScore.toFixed(1)}</div>
                          <Progress value={vuln.cvssScore * 10} className="w-20" />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={
                          vuln.severity === 'critical' ? 'destructive' :
                          vuln.severity === 'high' ? 'default' :
                          vuln.severity === 'medium' ? 'secondary' :
                          'outline'
                        }>
                          {vuln.severity}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {vuln.patched ? (
                          <div className="flex items-center gap-2 text-green-500">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm">패치 완료</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-yellow-500">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">패치 대기</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {vuln.bountyAmount && (
                          <div className="text-sm font-semibold text-green-400">
                            ${vuln.bountyAmount.toLocaleString()}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* 통계 분석 탭 */}
          <TabsContent value="statistics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 공격 벡터별 분석 */}
              <div className="bg-gray-800/30 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">{translateToKorean("공격 벡터별 분석")}</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={attackVectorData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" stroke="#888" />
                    <YAxis dataKey="vector" type="category" stroke="#888" width={120} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: 'none' }} />
                    <Bar dataKey="count" fill="#8884d8" />
                    <Bar dataKey="loss" fill="#ff8844" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* 플랫폼별 피해 규모 */}
              <div className="bg-gray-800/30 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">{translateToKorean("플랫폼별 피해 규모")}</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <Treemap
                    data={platformLossData}
                    dataKey="loss"
                    aspectRatio={4 / 3}
                    stroke="#fff"
                    fill="#8884d8"
                  >
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: 'none' }} />
                  </Treemap>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 보안 점수 */}
            <div className="bg-gray-800/30 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">{translateToKorean("플랫폼 보안 점수")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {securityScores.map((score) => (
                  <div key={score.platform} className="bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{score.platform}</h4>
                      <div className="flex items-center gap-2">
                        {score.score >= 80 ? (
                          <ShieldCheck className="h-5 w-5 text-green-500" />
                        ) : score.score >= 60 ? (
                          <Shield className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <ShieldOff className="h-5 w-5 text-red-500" />
                        )}
                        <span className="text-2xl font-bold">{score.score}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">마지막 감사</span>
                        <span>{new Date(score.lastAudit).toLocaleDateString('ko-KR')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">감사 기관</span>
                        <span>{score.auditor}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">보험 가입</span>
                        <span>{score.hasInsurance ? '✅' : '❌'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">과거 사건</span>
                        <span>{score.historicalIncidents}건</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="text-xs text-gray-400 mb-2">보안 기능</div>
                      <div className="flex flex-wrap gap-1">
                        {score.securityFeatures.map((feature: string) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* 예방 가이드 탭 */}
          <TabsContent value="prevention" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 보안 체크리스트 */}
              <div className="bg-gray-800/30 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  보안 체크리스트
                </h3>
                <div className="space-y-3">
                  {[
                    '하드웨어 지갑 사용',
                    '2단계 인증(2FA) 활성화',
                    '의심스러운 링크 클릭 금지',
                    '개인키 오프라인 보관',
                    '정기적인 보안 업데이트',
                    '신뢰할 수 있는 거래소만 사용',
                    '스마트 컨트랙트 감사 확인',
                    '소액으로 먼저 테스트'
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 위험 신호 */}
              <div className="bg-gray-800/30 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  위험 신호
                </h3>
                <div className="space-y-3">
                  {[
                    '비정상적으로 높은 수익률 약속',
                    '긴급한 행동 요구',
                    '개인키 요청',
                    '검증되지 않은 스마트 컨트랙트',
                    '익명의 팀',
                    '감사 보고서 부재',
                    '커뮤니티 피드백 부족',
                    '갑작스런 TVL 증가'
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 비상 대응 가이드 */}
            <div className="bg-gray-800/30 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                해킹 발생 시 비상 대응 절차
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { step: 1, title: '즉시 차단', desc: '모든 거래 중단, 계정 동결' },
                  { step: 2, title: '증거 수집', desc: '트랜잭션 해시, 스크린샷 저장' },
                  { step: 3, title: '신고', desc: '거래소, 경찰, 커뮤니티에 신고' },
                  { step: 4, title: '추적', desc: '블록체인 익스플로러로 자금 추적' }
                ].map((item) => (
                  <div key={item.step} className="bg-gray-900/50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-purple-500 mb-2">{item.step}</div>
                    <div className="font-semibold mb-1">{translateToKorean(item.title)}</div>
                    <div className="text-sm text-gray-400">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
      </NewsModuleWrapper>
  )