'use client'

import { useState, useEffect } from 'react'
import { translateToKorean, translateNewsBody } from '@/lib/translateService'
import { regulatoryNewsService, type Regulation, type PolicyUpdate, type ComplianceRequirement, type RegulatoryTrend, type GlobalRegulatoryIndex } from '@/lib/services/regulatoryNews'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'
import NewsModuleWrapper from '../components/NewsModuleWrapper'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, ScatterChart, Scatter, ComposedChart,
  Treemap, Sankey, Funnel, FunnelChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  Shield, AlertTriangle, TrendingUp, TrendingDown, Globe,
  FileText, Gavel, Calendar, Building, MapPin, Users,
  AlertCircle, CheckCircle, XCircle, Clock, Info
} from 'lucide-react'

const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#6366F1', '#14B8A6']
const REGIONS = ['전체', '북미', '유럽', '아시아', '중동', '남미']
const IMPACT_LEVELS = ['전체', 'critical', 'high', 'medium', 'low']

export default function RegulationNewsModule() {
  const [selectedRegion, setSelectedRegion] = useState('전체')
  const [selectedImpact, setSelectedImpact] = useState('전체')
  const [regulations, setRegulations] = useState<Regulation[]>([])
  const [policyUpdates, setPolicyUpdates] = useState<PolicyUpdate[]>([])
  const [requirements, setRequirements] = useState<ComplianceRequirement[]>([])
  const [trends, setTrends] = useState<RegulatoryTrend[]>([])
  const [globalIndex, setGlobalIndex] = useState<GlobalRegulatoryIndex | null>(null)
  const [selectedRegulation, setSelectedRegulation] = useState<Regulation | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const loadData = async () => {
      setLoading(true)
      try {
        const filter = {
          countries: selectedRegion !== '전체' ? [selectedRegion] : undefined,
          impactLevels: selectedImpact !== '전체' ? [selectedImpact] : undefined
        }

        const [regs, updates, reqs, trnds, idx] = await Promise.all([
          regulatoryNewsService.getLatestRegulations(filter),
          regulatoryNewsService.getPolicyUpdates(7),
          regulatoryNewsService.getComplianceRequirements(),
          regulatoryNewsService.getRegulatoryTrends(),
          regulatoryNewsService.getGlobalRegulatoryIndex()
        ])

        setRegulations(regs)
        setPolicyUpdates(updates)
        setRequirements(reqs)
        setTrends(trnds)
        setGlobalIndex(idx)
      } catch (error) {
        console.error('Failed to load regulatory data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()

    // 실시간 업데이트
    const cleanupPromise = regulatoryNewsService.streamRegulatoryUpdates((update) => {
      if (update.regulations) setRegulations(update.regulations)
      if (update.trends) setTrends(update.trends)
      if (update.globalIndex) setGlobalIndex(update.globalIndex)
    })

    return () => {
      cleanupPromise.then(cleanup => {
        if (typeof cleanup === 'function') {
          cleanup()
        }
      })
    }
  }, [mounted, selectedRegion, selectedImpact])

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-500'
      case 'high': return 'text-orange-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'proposed': 'bg-blue-100 text-blue-700',
      'draft': 'bg-gray-100 text-gray-700',
      'enacted': 'bg-purple-100 text-purple-700',
      'effective': 'bg-green-100 text-green-700',
      'suspended': 'bg-yellow-100 text-yellow-700',
      'repealed': 'bg-red-100 text-red-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getMarketImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'negative': return <TrendingDown className="w-4 h-4 text-red-500" />
      case 'mixed': return <AlertCircle className="w-4 h-4 text-yellow-500" />
      default: return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  // 차트 데이터 준비
  const regionDistribution = trends.map(t => ({
    region: t.region,
    score: 50 + t.momentum,
    trend: t.trend
  }))

  const complianceByCategory = requirements.reduce((acc, req) => {
    const existing = acc.find(a => a.category === req.category)
    if (existing) {
      existing.count++
    } else {
      acc.push({ category: req.category, count: 1 })
    }
    return acc
  }, [] as { category: string; count: number }[])

  const impactDistribution = regulations.reduce((acc, reg) => {
    const existing = acc.find(a => a.level === reg.impact.level)
    if (existing) {
      existing.count++
    } else {
      acc.push({ level: reg.impact.level, count: 1 })
    }
    return acc
  }, [] as { level: string; count: number }[])

  const typeDistribution = regulations.reduce((acc, reg) => {
    const existing = acc.find(a => a.type === reg.type)
    if (existing) {
      existing.count++
    } else {
      acc.push({ type: reg.type, count: 1 })
    }
    return acc
  }, [] as { type: string; count: number }[])

  if (!mounted) return null

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-4 text-white">{translateToKorean("🏛️ 암호화폐 규제 뉴스")}</h1>
        <p className="text-muted-foreground">{translateNewsBody("전 세계 암호화폐 규제 동향, 정책 변화, 컴플라이언스 요구사항을 실시간으로 추적합니다")}</p>
      </motion.div>

      {/* 필터 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger>
            <SelectValue placeholder="지역 선택" />
          </SelectTrigger>
          <SelectContent>
            {REGIONS.map(region => (
              <SelectItem key={region} value={region}>{region}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedImpact} onValueChange={setSelectedImpact}>
          <SelectTrigger>
            <SelectValue placeholder="영향도 선택" />
          </SelectTrigger>
          <SelectContent>
            {IMPACT_LEVELS.map(level => (
              <SelectItem key={level} value={level}>{level}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 글로벌 규제 지수 */}
        {globalIndex && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{translateNewsBody("글로벌 규제 지수")}</p>
                  <p className="text-2xl font-bold">{globalIndex.score}/100</p>
                </div>
                <div className={`flex items-center ${
                  globalIndex.trend === 'improving' ? 'text-green-500' :
                  globalIndex.trend === 'declining' ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {globalIndex.trend === 'improving' ? <TrendingUp /> :
                   globalIndex.trend === 'declining' ? <TrendingDown /> : <Info />}
                  <span className="ml-1">{globalIndex.trend}</span>
                </div>
              </div>
              <Progress value={globalIndex.score} className="mt-2" />
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="latest" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="latest">최신 규제</TabsTrigger>
          <TabsTrigger value="updates">정책 업데이트</TabsTrigger>
          <TabsTrigger value="compliance">컴플라이언스</TabsTrigger>
          <TabsTrigger value="trends">규제 트렌드</TabsTrigger>
          <TabsTrigger value="analysis">종합 분석</TabsTrigger>
        </TabsList>

        {/* 최신 규제 탭 */}
        <TabsContent value="latest" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 규제 목록 */}
            <Card>
              <CardHeader>
                <CardTitle>최신 규제 동향</CardTitle>
                <CardDescription>각국의 최신 암호화폐 규제 정책</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                {regulations.map((reg, index) => (
                  <motion.div
                    key={reg.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedRegulation?.id === reg.id ? 'border-purple-500 bg-purple-50 dark:bg-purple-950' : ''
                    }`}
                    onClick={() => setSelectedRegulation(reg)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="font-semibold">{reg.country}</span>
                        <Badge className={getStatusBadge(reg.status)}>
                          {reg.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {getMarketImpactIcon(reg.impact.marketImpact)}
                        <span className={getImpactColor(reg.impact.level)}>
                          {reg.impact.level}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-medium mb-1">{reg.titleKr}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {reg.summaryKr}
                    </p>
                    {reg.timeline.announced && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(reg.timeline.announced).toLocaleDateString('ko-KR')}
                      </div>
                    )}
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* 선택된 규제 상세 */}
            {selectedRegulation && (
              <Card>
                <CardHeader>
                  <CardTitle>규제 상세 정보</CardTitle>
                  <CardDescription>{selectedRegulation.country} - {selectedRegulation.titleKr}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 영향도 분석 */}
                  <div>
                    <h4 className="font-semibold mb-2">{translateToKorean("영향도 분석")}</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <RadarChart data={selectedRegulation.impact.affectedAreas.map(area => ({
                        area,
                        value: selectedRegulation.impact.score
                      }))}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="area" tick={{ fontSize: 12 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar name="영향도" dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* 타임라인 */}
                  <div>
                    <h4 className="font-semibold mb-2">{translateToKorean("타임라인")}</h4>
                    <div className="space-y-2">
                      {selectedRegulation.timeline.announced && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">발표일: {new Date(selectedRegulation.timeline.announced).toLocaleDateString('ko-KR')}</span>
                        </div>
                      )}
                      {selectedRegulation.timeline.effective && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">시행일: {new Date(selectedRegulation.timeline.effective).toLocaleDateString('ko-KR')}</span>
                        </div>
                      )}
                      {selectedRegulation.timeline.deadline && (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm">마감일: {new Date(selectedRegulation.timeline.deadline).toLocaleDateString('ko-KR')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 영향 받는 주체 */}
                  <div>
                    <h4 className="font-semibold mb-2">{translateToKorean("영향 받는 주체")}</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRegulation.entities.affectedExchanges?.map(exchange => (
                        <Badge key={exchange} variant="outline">{exchange}</Badge>
                      ))}
                      {selectedRegulation.entities.affectedCoins?.map(coin => (
                        <Badge key={coin} className="bg-purple-100 text-purple-700">{coin}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* 시장 반응 */}
                  {selectedRegulation.marketReaction && (
                    <div>
                      <h4 className="font-semibold mb-2">{translateToKorean("시장 반응")}</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">{translateNewsBody("가격 변동")}</p>
                          <p className={`text-lg font-bold ${
                            selectedRegulation.marketReaction.priceChange > 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {selectedRegulation.marketReaction.priceChange > 0 ? '+' : ''}{selectedRegulation.marketReaction.priceChange}%
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">{translateNewsBody("거래량 변동")}</p>
                          <p className={`text-lg font-bold ${
                            selectedRegulation.marketReaction.volumeChange > 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {selectedRegulation.marketReaction.volumeChange > 0 ? '+' : ''}{selectedRegulation.marketReaction.volumeChange}%
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">{translateNewsBody("감성 지수")}</p>
                          <p className={`text-lg font-bold ${
                            selectedRegulation.marketReaction.sentiment > 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {selectedRegulation.marketReaction.sentiment}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* 규제 유형 분포 */}
          <Card>
            <CardHeader>
              <CardTitle>규제 유형별 분포</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={typeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, count }) => `${type}: ${count}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {typeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 정책 업데이트 탭 */}
        <TabsContent value="updates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>최근 정책 업데이트</CardTitle>
              <CardDescription>기존 규제에 대한 변경사항 및 업데이트</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {policyUpdates.map((update, index) => (
                  <motion.div
                    key={update.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span className="font-semibold">{update.policyId}</span>
                        <Badge variant={
                          update.type === 'amendment' ? 'default' :
                          update.type === 'clarification' ? 'secondary' :
                          update.type === 'extension' ? 'outline' : 'destructive'
                        }>
                          {update.type}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(update.date).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{translateNewsBody("변경사항:")}</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {update.changes.map((change, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span>•</span>
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm">사유: {update.reason}</span>
                      <Badge className={
                        update.impact === 'major' ? 'bg-red-100 text-red-700' :
                        update.impact === 'minor' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }>
                        {update.impact}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 컴플라이언스 탭 */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>컴플라이언스 요구사항</CardTitle>
                <CardDescription>관할권별 규제 준수 요구사항</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {requirements.map((req, index) => (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          <span className="font-semibold">{req.jurisdiction}</span>
                          <Badge>{req.category}</Badge>
                        </div>
                        <Badge className={
                          req.status === 'mandatory' ? 'bg-red-100 text-red-700' :
                          req.status === 'recommended' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }>
                          {req.status}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{req.requirement}</p>
                      {req.deadline && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          마감: {new Date(req.deadline).toLocaleDateString('ko-KR')}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {req.applicableTo.map(entity => (
                          <Badge key={entity} variant="outline" className="text-xs">
                            {entity}
                          </Badge>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>카테고리별 요구사항 분포</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={complianceByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 규제 트렌드 탭 */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>지역별 규제 트렌드</CardTitle>
                <CardDescription>각 지역의 규제 방향성과 모멘텀</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={regionDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="score" fill="#8B5CF6" name="규제 점수" />
                    <Line type="monotone" dataKey="score" stroke="#EC4899" name="트렌드" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>규제 모멘텀 분석</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {trends.map((trend, index) => (
                  <motion.div
                    key={trend.region}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{trend.region}</span>
                      <div className="flex items-center gap-2">
                        <Badge className={
                          trend.trend === 'loosening' ? 'bg-green-100 text-green-700' :
                          trend.trend === 'tightening' ? 'bg-red-100 text-red-700' :
                          trend.trend === 'developing' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }>
                          {trend.trend}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          신뢰도: {trend.confidence}%
                        </span>
                      </div>
                    </div>
                    <Progress value={50 + trend.momentum} className="h-2" />
                    <p className="text-sm text-muted-foreground">{trend.outlook}</p>
                    <div className="flex flex-wrap gap-1">
                      {trend.keyDrivers.map(driver => (
                        <Badge key={driver} variant="outline" className="text-xs">
                          {driver}
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 종합 분석 탭 */}
        <TabsContent value="analysis" className="space-y-6">
          {globalIndex && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>암호화폐 친화적 국가 TOP 5</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {globalIndex.topFriendly.map((country, index) => (
                        <div key={country.country} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                            <span className="font-medium">{country.country}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={country.score} className="w-24" />
                            <span className="text-sm font-semibold">{country.score}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>규제 제한적 국가 TOP 5</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {globalIndex.topRestrictive.map((country, index) => (
                        <div key={country.country} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                            <span className="font-medium">{country.country}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={country.score} className="w-24" />
                            <span className="text-sm font-semibold">{country.score}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>최근 규제 변화</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={globalIndex.recentChanges}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="country" />
                      <YAxis />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload[0]) {
                            return (
    <NewsModuleWrapper moduleName="RegulationNewsModule">
      <div className="bg-background border rounded p-2">
                                <p className="font-semibold">{payload[0].payload.country}</p>
                                <p className="text-sm">변화: {payload[0].value}점</p>
                                <p className="text-sm text-muted-foreground">{payload[0].payload.reason}</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Bar dataKey="change" fill="#8B5CF6">
                        {globalIndex.recentChanges.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.change > 0 ? '#10B981' : '#EF4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>영향도별 규제 분포</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <Treemap
                      data={impactDistribution.map(item => ({
                        name: item.level,
                        size: item.count,
                        fill: item.level === 'critical' ? '#EF4444' :
                              item.level === 'high' ? '#F59E0B' :
                              item.level === 'medium' ? '#EAB308' :
                              '#10B981'
                      }))}
                      dataKey="size"
                      ratio={4/3}
                      stroke="#fff"
                      fill="#8B5CF6"
                    >
                      <Tooltip />
                    </Treemap>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
      </NewsModuleWrapper>
  )