'use client'

import React, { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { motion } from 'framer-motion'
import { FiBook, FiPlay, FiCheckCircle, FiCircle, FiStar, FiTrendingUp, FiShield, FiTarget, FiInfo, FiArrowRight, FiAward } from 'react-icons/fi'

interface TradingStep {
  id: string
  title: string
  description: string
  content: string
  type: 'theory' | 'practice' | 'quiz' | 'simulation'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number // 분 단위
  completed: boolean
  score?: number // 퀴즈나 시뮬레이션 점수
}

interface TradingCourse {
  id: string
  title: string
  description: string
  category: 'basics' | 'technical' | 'fundamental' | 'risk' | 'strategy' | 'psychology'
  level: 'beginner' | 'intermediate' | 'advanced'
  steps: TradingStep[]
  progress: number // 0-100%
  rating: number
  enrollments: number
  certificate: boolean
}

interface UserProgress {
  completedCourses: string[]
  currentCourse?: string
  currentStep?: string
  totalXP: number
  level: number
  achievements: string[]
}

interface TradingGuideProps {
  userLevel?: 'beginner' | 'intermediate' | 'advanced'
  onCourseComplete?: (courseId: string, score: number) => void
}

const TradingGuide: React.FC<TradingGuideProps> = ({
  userLevel = 'beginner',
  onCourseComplete
}) => {
  const [courses, setCourses] = useState<TradingCourse[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<TradingCourse | null>(null)
  const [currentStep, setCurrentStep] = useState<TradingStep | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')

  // 데이터 로드
  useEffect(() => {
    loadTradingGuideData()
  }, [])

  const loadTradingGuideData = async () => {
    try {
      setLoading(true)
      
      // 실제 API로 코스 데이터 로드
      const [coursesData, progressData] = await Promise.all([
        fetchCourses(),
        fetchUserProgress()
      ])

      setCourses(coursesData)
      setUserProgress(progressData)
    } catch (error) {
      console.error('트레이딩 가이드 데이터 로드 실패:', error)
      // 에러 시 기본값 사용
      await loadDefaultGuideData()
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async (): Promise<TradingCourse[]> => {
    try {
      const response = await fetch('/api/trading-courses')
      
      if (response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          return await response.json()
        }
      }
      return getDefaultCourses()
    } catch (error) {
      // 에러 로깅 없이 기본값 반환
      return getDefaultCourses()
    }
  }

  const fetchUserProgress = async (): Promise<UserProgress> => {
    try {
      const response = await fetch('/api/user-progress')
      
      if (response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          return await response.json()
        }
      }
      return getDefaultProgress()
    } catch (error) {
      // 에러 로깅 없이 기본값 반환
      return getDefaultProgress()
    }
  }

  const getDefaultCourses = (): TradingCourse[] => {
    return [
      {
        id: 'crypto-basics',
        title: '암호화폐 기초',
        description: '비트코인부터 알트코인까지, 암호화폐의 기본 개념과 특징을 이해합니다.',
        category: 'basics',
        level: 'beginner',
        rating: 4.8,
        enrollments: 12450,
        certificate: true,
        progress: 0,
        steps: [
          {
            id: 'step_1',
            title: '블록체인이란?',
            description: '블록체인 기술의 기본 원리를 이해합니다.',
            content: '블록체인은 탈중앙화된 디지털 장부로...',
            type: 'theory',
            difficulty: 'beginner',
            duration: 15,
            completed: false
          },
          {
            id: 'step_2',
            title: '비트코인의 탄생',
            description: '비트코인이 만들어진 배경과 막다른 학습에서 배우는 예시입니다.',
            content: '2008년 설명한 상태의 백서에서...',
            type: 'theory',
            difficulty: 'beginner',
            duration: 20,
            completed: false
          },
          {
            id: 'step_3',
            title: '지갑 만들기 실습',
            description: '실제로 암호화폐 지갑을 만들고 관리하는 방법을 배웁니다.',
            content: '지갑 만들기 단계별 안내...',
            type: 'practice',
            difficulty: 'beginner',
            duration: 30,
            completed: false
          },
          {
            id: 'step_4',
            title: '기초 지식 퀴즈',
            description: '지금까지 배운 내용을 퀴즈로 확인해보세요.',
            content: '암호화폐 기초 개념 퀴즈...',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            completed: false
          }
        ]
      },
      {
        id: 'technical-analysis',
        title: '기술적 분석 마스터',
        description: '차트 분석, 지지/저항선, 기술적 지표를 활용한 효과적인 분석 방법을 마스터합니다.',
        category: 'technical',
        level: 'intermediate',
        rating: 4.9,
        enrollments: 8920,
        certificate: true,
        progress: 25,
        steps: [
          {
            id: 'tech_1',
            title: '차트 패턴 이해',
            description: '주요 차트 패턴과 의미를 배웁니다.',
            content: '헤드 앤 숄더, 더블 톱/보텀...',
            type: 'theory',
            difficulty: 'intermediate',
            duration: 25,
            completed: true
          },
          {
            id: 'tech_2',
            title: 'RSI 지표 활용',
            description: 'RSI 지표를 활용한 매매 타이밍 파악법을 실습합니다.',
            content: 'RSI 계산법과 활용 전략...',
            type: 'practice',
            difficulty: 'intermediate',
            duration: 35,
            completed: false
          },
          {
            id: 'tech_3',
            title: '실제 차트 분석',
            description: '실제 비트코인 차트를 분석해보세요.',
            content: '라이브 차트 분석 실습...',
            type: 'simulation',
            difficulty: 'intermediate',
            duration: 45,
            completed: false
          }
        ]
      },
      {
        id: 'risk-management',
        title: '리스크 관리 전략',
        description: '자산을 보호하고 장기적인 수익성을 확보하는 리스크 관리 방법을 배웁니다.',
        category: 'risk',
        level: 'intermediate',
        rating: 4.7,
        enrollments: 6780,
        certificate: true,
        progress: 0,
        steps: [
          {
            id: 'risk_1',
            title: '포지션 사이징',
            description: '적절한 포지션 크기를 결정하는 방법을 배웁니다.',
            content: '1-2% 룰과 포지션 크기 계산...',
            type: 'theory',
            difficulty: 'intermediate',
            duration: 20,
            completed: false
          },
          {
            id: 'risk_2',
            title: '손절매 설정',
            description: '효과적인 손절매 전략을 배웁니다.',
            content: '손절매 설정 방법과 주의사항...',
            type: 'practice',
            difficulty: 'intermediate',
            duration: 30,
            completed: false
          }
        ]
      },
      {
        id: 'advanced-strategies',
        title: '고급 트레이딩 전략',
        description: '알고리듬 트레이딩, 오프션 전략, DeFi 수익 농사 등 고급 전략을 마스터합니다.',
        category: 'strategy',
        level: 'advanced',
        rating: 4.9,
        enrollments: 3450,
        certificate: true,
        progress: 0,
        steps: [
          {
            id: 'adv_1',
            title: '그리드 트레이딩',
            description: '자동화된 그리드 트레이딩 전략을 배웁니다.',
            content: '그리드 설정과 최적화 방법...',
            type: 'theory',
            difficulty: 'advanced',
            duration: 40,
            completed: false
          }
        ]
      }
    ]
  }

  const getDefaultProgress = (): UserProgress => {
    return {
      completedCourses: [],
      totalXP: 0,
      level: 1,
      achievements: []
    }
  }

  const loadDefaultGuideData = async () => {
    const defaultCourses = getDefaultCourses()
    const defaultProgress = getDefaultProgress()
    
    setCourses(defaultCourses)
    setUserProgress(defaultProgress)
  }

  const startCourse = (course: TradingCourse) => {
    setSelectedCourse(course)
    const firstIncompleteStep = course.steps.find(step => !step.completed)
    setCurrentStep(firstIncompleteStep || course.steps[0])
  }

  const completeStep = async (stepId: string) => {
    if (!selectedCourse || !currentStep) return
    
    try {
      // 실제 API로 진도 업데이트
      const response = await fetch('/api/course-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          stepId,
          completed: true
        })
      })
      
      if (response.ok) {
        // 진도 업데이트
        const updatedCourses = courses.map(course => {
          if (course.id === selectedCourse.id) {
            const updatedSteps = course.steps.map(step => 
              step.id === stepId ? { ...step, completed: true } : step
            )
            const completedCount = updatedSteps.filter(step => step.completed).length
            const progress = (completedCount / updatedSteps.length) * 100
            
            return { ...course, steps: updatedSteps, progress }
          }
          return course
        })
        
        setCourses(updatedCourses)
        setSelectedCourse(prev => prev ? {
          ...prev,
          steps: prev.steps.map(step => 
            step.id === stepId ? { ...step, completed: true } : step
          )
        } : null)
        
        // 다음 단계로 이동
        const currentIndex = selectedCourse.steps.findIndex(step => step.id === stepId)
        const nextStep = selectedCourse.steps[currentIndex + 1]
        
        if (nextStep) {
          setCurrentStep(nextStep)
        } else {
          // 코스 완료
          if (onCourseComplete) {
            onCourseComplete(selectedCourse.id, 100)
          }
          
          // XP 지급
          if (userProgress) {
            setUserProgress(prev => prev ? {
              ...prev,
              completedCourses: [...prev.completedCourses, selectedCourse.id],
              totalXP: prev.totalXP + 500, // 코스 완료 시 500 XP
              level: Math.floor((prev.totalXP + 500) / 1000) + 1
            } : null)
          }
          
          setSelectedCourse(null)
          setCurrentStep(null)
        }
      } else {
        // API 실패 시 로컬 업데이트로 폴백
        console.log('진도 업데이트 API 실패, 로컬 업데이트로 폴백')
      }
    } catch (error) {
      console.error('단계 완료 실패:', error)
      // 에러 시 로얻 업데이트
      const updatedCourses = courses.map(course => {
        if (course.id === selectedCourse.id) {
          const updatedSteps = course.steps.map(step => 
            step.id === stepId ? { ...step, completed: true } : step
          )
          const completedCount = updatedSteps.filter(step => step.completed).length
          const progress = (completedCount / updatedSteps.length) * 100
          
          return { ...course, steps: updatedSteps, progress }
        }
        return course
      })
      
      setCourses(updatedCourses)
    }
  }

  const filteredCourses = courses.filter(course => {
    if (selectedCategory !== 'all' && course.category !== selectedCategory) return false
    if (selectedLevel !== 'all' && course.level !== selectedLevel) return false
    return true
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'basics': return FiBook
      case 'technical': return FiTrendingUp
      case 'fundamental': return FiInfo
      case 'risk': return FiShield
      case 'strategy': return FiTarget
      case 'psychology': return FiStar
      default: return FiBook
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-400'
      case 'intermediate': return 'text-yellow-400'
      case 'advanced': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getLevelBg = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500/20'
      case 'intermediate': return 'bg-yellow-500/20'
      case 'advanced': return 'bg-red-500/20'
      default: return 'bg-gray-500/20'
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (selectedCourse && currentStep) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6">
        {/* 코스 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedCourse(null)
                setCurrentStep(null)
              }}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <FiArrowRight className="w-4 h-4 text-gray-300 rotate-180" />
            </button>
            
            <div>
              <h2 className="text-xl font-bold text-white">{selectedCourse.title}</h2>
              <div className="text-sm text-gray-400">
                {selectedCourse.steps.findIndex(s => s.id === currentStep.id) + 1} / {selectedCourse.steps.length}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-semibold text-purple-400">
              {Math.round((selectedCourse.steps.filter(s => s.completed).length / selectedCourse.steps.length) * 100)}%
            </div>
            <div className="text-sm text-gray-400">진도</div>
          </div>
        </div>

        {/* 진도 바 */}
        <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(selectedCourse.steps.filter(s => s.completed).length / selectedCourse.steps.length) * 100}%`
            }}
          ></div>
        </div>

        {/* 현재 단계 콘텐츠 */}
        <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-xl ${getLevelBg(currentStep.difficulty)}`}>
              {currentStep.type === 'theory' ? <FiBook className="w-6 h-6 text-blue-400" /> :
               currentStep.type === 'practice' ? <FiPlay className="w-6 h-6 text-green-400" /> :
               currentStep.type === 'quiz' ? <FiTarget className="w-6 h-6 text-yellow-400" /> :
               <FiTrendingUp className="w-6 h-6 text-purple-400" />}
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-1">{currentStep.title}</h3>
              <p className="text-gray-400 text-sm mb-2">{currentStep.description}</p>
              
              <div className="flex items-center gap-4 text-sm">
                <span className={`px-2 py-1 rounded ${getLevelBg(currentStep.difficulty)} ${getLevelColor(currentStep.difficulty)}`}>
                  {currentStep.difficulty === 'beginner' ? '초급' :
                   currentStep.difficulty === 'intermediate' ? '중급' : '고급'}
                </span>
                <span className="text-gray-400">{currentStep.duration}분</span>
                <span className="text-gray-400">
                  {currentStep.type === 'theory' ? '이론' :
                   currentStep.type === 'practice' ? '실습' :
                   currentStep.type === 'quiz' ? '퀴즈' : '시뮬레이션'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
              {currentStep.content}
            </div>
          </div>
          
          {currentStep.type === 'quiz' && (
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="text-yellow-400 font-medium mb-2">퀴즈 예시:</div>
              <div className="text-gray-300">
                Q. 비트코인의 최대 발행량은 얼마인가요?<br/>
                1) 2,100만 개<br/>
                2) 5,000만 개<br/>
                3) 1억 개<br/>
                4) 무제한
              </div>
            </div>
          )}
          
          {currentStep.type === 'simulation' && (
            <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <div className="text-purple-400 font-medium mb-2">실습 도구:</div>
              <div className="text-gray-300">
                실제 차트를 사용하여 배운 내용을 실습해보세요.
              </div>
              
              <button className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                실습 도구 열기
              </button>
            </div>
          )}
        </div>

        {/* 단계 완료 버튼 */}
        <div className="flex justify-between">
          <button
            onClick={() => {
              const currentIndex = selectedCourse.steps.findIndex(s => s.id === currentStep.id)
              const prevStep = selectedCourse.steps[currentIndex - 1]
              if (prevStep) {
                setCurrentStep(prevStep)
              }
            }}
            disabled={selectedCourse.steps.findIndex(s => s.id === currentStep.id) === 0}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white rounded-lg transition-colors"
          >
            이전 단계
          </button>
          
          <button
            onClick={() => completeStep(currentStep.id)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            {selectedCourse.steps.findIndex(s => s.id === currentStep.id) === selectedCourse.steps.length - 1
              ? '코스 완료'
              : '다음 단계'
            }
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6">
      {/* 헤더 */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="flex items-center gap-3 mb-4 lg:mb-0">
          <div className="p-3 bg-blue-500/20 rounded-xl">
            <FiBook className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">트레이딩 가이드</h2>
            <p className="text-gray-400 text-sm">단계별 학습으로 전문가 되기</p>
          </div>
        </div>
        
        {/* 사용자 진도 */}
        {userProgress && (
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-purple-400">레벨 {userProgress.level}</div>
              <div className="text-sm text-gray-400">{userProgress.totalXP} XP</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">{userProgress.completedCourses.length}</div>
              <div className="text-sm text-gray-400">완료 코스</div>
            </div>
            
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <FiAward className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        )}
      </div>

      {/* 필터 */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
        >
          <option value="all">모든 카테고리</option>
          <option value="basics">기초</option>
          <option value="technical">기술적 분석</option>
          <option value="fundamental">기본적 분석</option>
          <option value="risk">리스크 관리</option>
          <option value="strategy">트레이딩 전략</option>
          <option value="psychology">심리학</option>
        </select>
        
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
        >
          <option value="all">모든 난이도</option>
          <option value="beginner">초급</option>
          <option value="intermediate">중급</option>
          <option value="advanced">고급</option>
        </select>
      </div>

      {/* 코스 목록 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCourses.map((course, index) => {
          const CategoryIcon = getCategoryIcon(course.category)
          const isCompleted = userProgress?.completedCourses.includes(course.id) || false
          
          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300 cursor-pointer group"
              onClick={() => startCourse(course)}
            >
              {/* 코스 헤더 */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${getLevelBg(course.level)}`}>
                    <CategoryIcon className="w-6 h-6 text-purple-400" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelBg(course.level)} ${getLevelColor(course.level)}`}>
                        {course.level === 'beginner' ? '초급' :
                         course.level === 'intermediate' ? '중급' : '고급'}
                      </span>
                      
                      {isCompleted && (
                        <FiCheckCircle className="w-4 h-4 text-green-400" />
                      )}
                      
                      {course.certificate && (
                        <FiAward className="w-4 h-4 text-yellow-400" />
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-300">{course.rating}</span>
                  </div>
                  <div className="text-xs text-gray-500">{course.enrollments.toLocaleString()}명</div>
                </div>
              </div>

              {/* 코스 설명 */}
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {course.description}
              </p>

              {/* 진도 */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">진도</span>
                  <span className="text-sm font-medium text-purple-400">{safeFixed(course.progress, 0)}%</span>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* 단계 정보 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>{course.steps.length}개 단계</span>
                  <span>
                    {course.steps.reduce((sum, step) => sum + step.duration, 0)}분
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {course.steps.slice(0, 5).map(step => (
                    <div
                      key={step.id}
                      className={`w-2 h-2 rounded-full ${
                        step.completed ? 'bg-green-400' : 'bg-gray-600'
                      }`}
                    ></div>
                  ))}
                  {course.steps.length > 5 && (
                    <span className="text-xs text-gray-500">+{course.steps.length - 5}</span>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <FiBook className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <div className="text-gray-400 text-lg mb-2">해당 조건의 코스가 없습니다</div>
          <div className="text-gray-500 text-sm">다른 카테고리나 난이도를 선택해보세요</div>
        </div>
      )}
    </div>
  )
}

export default TradingGuide