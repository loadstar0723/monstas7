'use client'

import { useState, useEffect } from 'react'
import { translateToKorean, translateNewsBody } from '@/lib/translateService'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  LineChart, BarChart, PieChart, AreaChart,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, Line, Bar, Area, Pie, Cell
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, TrendingUp, TrendingDown, Eye, Heart, Share2,
  Building, Award, Calendar, Filter, Search, Download,
  ChevronRight, Star, BookOpen, BarChart3, Target,
  AlertCircle, CheckCircle, XCircle, Clock, Users
} from 'lucide-react'
import { researchService, type ResearchReport, type InstitutionProfile } from '@/lib/services/researchReport'
import { cn } from '@/lib/utils'
import NewsModuleWrapper from '../components/NewsModuleWrapper'

const REPORT_CATEGORIES = [
  { value: 'all', label: '?�체', icon: BookOpen },
  { value: 'technical', label: '기술??분석', icon: BarChart3 },
  { value: 'fundamental', label: '?�?�멘??, icon: FileText },
  { value: 'macro', label: '매크�?, icon: TrendingUp },
  { value: 'defi', label: 'DeFi', icon: Building },
  { value: 'nft', label: 'NFT', icon: Award },
  { value: 'regulation', label: '규제', icon: AlertCircle }
]

const RATING_COLORS = {
  buy: '#10B981',
  hold: '#F59E0B',
  sell: '#EF4444',
  neutral: '#6B7280'
}

const RATING_ICONS = {
  buy: TrendingUp,
  hold: AlertCircle,
  sell: TrendingDown,
  neutral: Clock
}

export default function ResearchNewsModule() {
  const [reports, setReports] = useState<ResearchReport[]>([])
  const [trendingReports, setTrendingReports] = useState<ResearchReport[]>([])
  const [institutions, setInstitutions] = useState<InstitutionProfile[]>([])
  const [metrics, setMetrics] = useState<any>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null)
  const [selectedInstitution, setSelectedInstitution] = useState<string | null>(null)
  const [selectedReport, setSelectedReport] = useState<ResearchReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('reports')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadData()
  }, [])

  useEffect(() => {
    loadReports()
  }, [selectedCategory, selectedCoin, selectedInstitution])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [reportsData, trendingData, institutionsData, metricsData] = await Promise.all([
        researchService.getLatestReports(),
        researchService.getTrendingReports(),
        Promise.resolve(researchService.getInstitutions()),
        researchService.getReportMetrics()
      ])

      setReports(reportsData)
      setTrendingReports(trendingData)
      setInstitutions(institutionsData)
      setMetrics(metricsData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadReports = async () => {
    const filter: any = {}
    if (selectedCategory !== 'all') filter.category = selectedCategory
    if (selectedCoin) filter.coin = selectedCoin
    if (selectedInstitution) filter.institution = selectedInstitution

    const data = await researchService.getLatestReports(filter)
    setReports(data)
  }

  const getRatingBadge = (rating: string) => {
    const Icon = RATING_ICONS[rating as keyof typeof RATING_ICONS]
    return (
      <Badge
        className="flex items-center gap-1"
        style={{
          backgroundColor: `${RATING_COLORS[rating as keyof typeof RATING_COLORS]}20`,
          color: RATING_COLORS[rating as keyof typeof RATING_COLORS],
          borderColor: RATING_COLORS[rating as keyof typeof RATING_COLORS]
        }}
      >
        <Icon className="w-3 h-3" />
        {rating.toUpperCase()}
      </Badge>
    )
  }

  const formatTimeAgo = (date: Date) => {
    if (!mounted) return '로딩�?..'
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const hours = Math.floor(diff / 3600000)

    if (hours < 1) return '방금 ??
    if (hours < 24) return `${hours}?�간 ??
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}????
    return new Date(date).toLocaleDateString('ko-KR')
  }

  // 차트 ?�이??  const categoryDistribution = metrics ? [
    { name: '기술??분석', value: 35, color: '#8B5CF6' },
    { name: '?�?�멘??, value: 25, color: '#10B981' },
    { name: '매크�?, value: 15, color: '#F59E0B' },
    { name: 'DeFi', value: 12, color: '#3B82F6' },
    { name: 'NFT', value: 8, color: '#EC4899' },
    { name: '규제', value: 5, color: '#EF4444' }
  ] : []

  const ratingDistribution = metrics ? [
    { name: 'Buy', value: metrics.buyRecommendations, color: RATING_COLORS.buy },
    { name: 'Hold', value: metrics.totalReports - metrics.buyRecommendations - metrics.sellRecommendations, color: RATING_COLORS.hold },
    { name: 'Sell', value: metrics.sellRecommendations, color: RATING_COLORS.sell }
  ] : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ?�더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{translateToKorean("?�� 리서�?보고??")}</h1>
          <p className="text-gray-400 text-lg">{translateNewsBody("?�문 기�? 분석 · ?�자 ?�략 · ?�층 리포??")}</p>
        </motion.div>

        {/* ?�계 카드 */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-4 bg-gray-800/50 backdrop-blur-sm border-purple-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">�?보고??/p>
                    <p className="text-2xl font-bold text-white">{metrics.totalReports}</p>
                  </div>
                  <FileText className="w-8 h-8 text-purple-400" />
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="p-4 bg-gray-800/50 backdrop-blur-sm border-green-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">{translateNewsBody("매수 추천")}</p>
                    <p className="text-2xl font-bold text-green-400">{metrics.buyRecommendations}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-4 bg-gray-800/50 backdrop-blur-sm border-red-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">{translateNewsBody("매도 추천")}</p>
                    <p className="text-2xl font-bold text-red-400">{metrics.sellRecommendations}</p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-red-400" />
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="p-4 bg-gray-800/50 backdrop-blur-sm border-blue-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">?�균 ?�확??/p>
                    <p className="text-2xl font-bold text-blue-400">{metrics.avgAccuracy}%</p>
                  </div>
                  <Target className="w-8 h-8 text-blue-400" />
                </div>
              </Card>
            </motion.div>
          </div>
        )}

        {/* 카테고리 ?�터 */}
        <div className="flex gap-2 flex-wrap justify-center">
          {REPORT_CATEGORIES.map(category => {
            const Icon = category.icon
            return (
              <motion.button
                key={category.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.value)}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-all",
                  "border backdrop-blur-sm flex items-center gap-2",
                  selectedCategory === category.value
                    ? "bg-purple-600 border-purple-400 text-white"
                    : "bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{category.label}</span>
              </motion.button>
            )
          })}
        </div>

        {/* 메인 ??*/}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full bg-gray-800/50">
            <TabsTrigger value="reports">보고??/TabsTrigger>
            <TabsTrigger value="trending">?�기</TabsTrigger>
            <TabsTrigger value="institutions">기�?</TabsTrigger>
            <TabsTrigger value="analytics">분석</TabsTrigger>
          </TabsList>

          {/* 보고????*/}
          <TabsContent value="reports" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reports.map((report) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card
                      className="p-6 bg-gray-800/50 backdrop-blur-sm border-purple-500/20 cursor-pointer hover:bg-gray-800/70 transition-all"
                      onClick={() => setSelectedReport(report)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                            {report.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Building className="w-4 h-4" />
                            <span>{report.institution}</span>
                            <span>·</span>
                            <span>{report.author}</span>
                          </div>
                        </div>
                        {getRatingBadge(report.rating)}
                      </div>

                      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                        {report.summary}
                      </p>

                      {/* ?�심 ?�인??*/}
                      <div className="space-y-1 mb-4">
                        {report.keyPoints.slice(0, 2).map((point, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-gray-400">
                            <CheckCircle className="w-3 h-3 text-green-400 mt-0.5" />
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>

                      {/* 메�? ?�보 */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{report.metrics.views.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span>{report.metrics.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Share2 className="w-4 h-4" />
                            <span>{report.metrics.shares}</span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(report.publishedAt)}
                        </span>
                      </div>

                      {/* ?�그 */}
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {report.tags.slice(0, 3).map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* 목표가 (?�는 경우) */}
                      {report.targetPrice && (
                        <div className="mt-3 p-3 bg-purple-900/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">목표가</span>
                            <span className="text-lg font-bold text-purple-400">
                              ${report.targetPrice.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">?�뢰??/span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-gray-700 rounded-full">
                                <div
                                  className="h-2 bg-purple-400 rounded-full"
                                  style={{ width: `${report.confidence}%` }}
                                />
                              </div>
                              <span className="text-xs text-purple-400">{report.confidence}%</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ?�기 보고????*/}
          <TabsContent value="trending" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {trendingReports.map((report, idx) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border-purple-500/20">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl font-bold text-purple-400">
                        #{idx + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">
                          {report.title}
                        </h3>
                        <p className="text-gray-300 mb-3">{report.summary}</p>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-400">{report.institution}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-bold text-white">
                              {report.metrics.views.toLocaleString()} 조회
                            </span>
                          </div>
                          {getRatingBadge(report.rating)}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedReport(report)}
                      >
                        ?�세??보기
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* 기�? ??*/}
          <TabsContent value="institutions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {institutions.map((institution) => (
                <motion.div
                  key={institution.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border-purple-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white">{institution.name}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-bold text-yellow-400">
                          {institution.reputation}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">�?보고??/span>
                        <span className="font-bold text-white">
                          {institution.totalReports.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">?�확??/span>
                        <span className="font-bold text-green-400">{institution.accuracy}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">?�문 분야</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {institution.specialization.map((spec, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4"
                      onClick={() => setSelectedInstitution(institution.name)}
                    >
                      보고??보기
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* 분석 ??*/}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 카테고리 분포 */}
              <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border-purple-500/20">
                <h3 className="text-xl font-bold mb-4">{translateToKorean("카테고리�?분포")}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              {/* 추천 분포 */}
              <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border-purple-500/20">
                <h3 className="text-xl font-bold mb-4">{translateToKorean("?�자 추천 분포")}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ratingDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #6B7280' }}
                    />
                    <Bar dataKey="value">
                      {ratingDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* 최고 ?�??*/}
              {metrics && (
                <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border-purple-500/20 md:col-span-2">
                  <h3 className="text-xl font-bold mb-4">최고 ?�널리스??/h3>
                  <div className="space-y-3">
                    {metrics.topAuthors.map((author: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center font-bold">
                            {author.name.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-bold text-white">{author.name}</p>
                            <p className="text-sm text-gray-400">{author.reports} 보고??/p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">?�확??/p>
                          <p className="text-lg font-bold text-green-400">{author.accuracy}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* 보고???�세 모달 */}
        <AnimatePresence>
          {selectedReport && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedReport(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedReport.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{selectedReport.institution}</span>
                      <span>·</span>
                      <span>{selectedReport.author}</span>
                      <span>·</span>
                      <span>{formatTimeAgo(selectedReport.publishedAt)}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedReport(null)}
                  >
                    ??                  </Button>
                </div>

                <div className="prose prose-invert max-w-none">
                  <div className="mb-6 p-4 bg-purple-900/20 rounded-lg">
                    <h3 className="text-lg font-bold mb-2">{translateToKorean("?�약")}</h3>
                    <p className="text-gray-300">{selectedReport.summary}</p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-3">?�심 ?�인??/h3>
                    <ul className="space-y-2">
                      {selectedReport.keyPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                          <span className="text-gray-300">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="whitespace-pre-line text-gray-300">
                    {selectedReport.content}
                  </div>

                  {selectedReport.charts && selectedReport.charts.length > 0 && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedReport.charts.map((chart, idx) => (
                        <div key={idx} className="bg-gray-800/50 p-4 rounded-lg">
                          <h4 className="text-sm font-bold mb-2">{chart.title}</h4>
                          <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={chart.data}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                              <XAxis dataKey="time" stroke="#9CA3AF" />
                              <YAxis stroke="#9CA3AF" />
                              <Tooltip
                                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #6B7280' }}
                              />
                              <Line type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex gap-2">
                    {selectedReport.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      PDF ?�운로드
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      공유
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ?�터 */}
        <div className="text-center text-sm text-gray-500 pb-4">
          <p>{translateNewsBody("리서�??�공: Messari, Delphi Digital, Glassnode, The Block")}</p>
          <p>{translateNewsBody("분석 ?�진: MONSTA Research v2.0")}</p>
        </div>
      </div>
    </div>
      </NewsModuleWrapper>
  )