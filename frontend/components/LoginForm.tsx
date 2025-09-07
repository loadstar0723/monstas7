'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa'
import LoadingSpinner from './LoadingSpinner'
import { config } from '@/lib/config'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto p-6"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
            <span className="text-3xl font-bold text-white">M</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">MONSTA 로그인</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">AI 트레이딩 플랫폼에 오신 것을 환영합니다</p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg"
          >
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </motion.div>
        )}

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 이메일 입력 */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              이메일
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="your@email.com"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* 비밀번호 입력 */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              비밀번호
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <FaEyeSlash className="text-gray-400 hover:text-gray-600" />
                ) : (
                  <FaEye className="text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* 기억하기 & 비밀번호 찾기 */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">로그인 상태 유지</span>
            </label>
            <a href="/auth/forgot-password" className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400">
              비밀번호를 잊으셨나요?
            </a>
          </div>

          {/* 로그인 버튼 */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: config.decimals.value98 }}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-2" />
                로그인 중...
              </div>
            ) : (
              '로그인'
            )}
          </motion.button>
        </form>

        {/* 회원가입 링크 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            아직 계정이 없으신가요?{' '}
            <a href="/auth/register" className="font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400">
              회원가입
            </a>
          </p>
        </div>

        {/* 소셜 로그인 구분선 */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">또는</span>
            </div>
          </div>

          {/* 소셜 로그인 버튼들 */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 transition-colors"
            >
              Google
            </button>
            <button
              type="button"
              className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 transition-colors"
            >
              GitHub
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}