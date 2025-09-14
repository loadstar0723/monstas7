'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function TranslationTestPage() {
  const [inputText, setInputText] = useState('Bitcoin price surges above $100,000 as institutional investors increase their holdings amid growing market optimism.')
  const [translatedText, setTranslatedText] = useState('')
  const [loading, setLoading] = useState(false)
  const [service, setService] = useState('')

  const testTranslation = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          targetLang: 'ko'
        })
      })

      const data = await response.json()
      setTranslatedText(data.translatedText || '번역 실패')
      setService(data.service || 'unknown')
    } catch (error) {
      console.error('Translation error:', error)
      setTranslatedText('번역 중 오류 발생')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-8"
        >
          🌐 무료 번역 API 테스트
        </motion.h1>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
          <h2 className="text-xl font-semibold text-purple-400 mb-4">번역 서비스 우선순위</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300 mb-6">
            <li>
              <span className="font-semibold text-blue-400">Google Translate</span>
              - 무료, API 키 불필요, 무제한
            </li>
            <li>
              <span className="font-semibold text-green-400">Papago (네이버)</span>
              - 일 10,000자 무료 (API 키 필요)
            </li>
            <li>
              <span className="font-semibold text-yellow-400">DeepL Free</span>
              - 월 500,000자 무료 (API 키 필요)
            </li>
            <li>
              <span className="font-semibold text-orange-400">Claude API</span>
              - 유료 (기존 설정 시)
            </li>
            <li>
              <span className="font-semibold text-gray-400">기본 키워드 번역</span>
              - 폴백 옵션
            </li>
          </ol>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                영문 텍스트 입력:
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full h-32 px-4 py-2 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                placeholder="번역할 영문을 입력하세요..."
              />
            </div>

            <button
              onClick={testTranslation}
              disabled={loading || !inputText}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '번역 중...' : '한국어로 번역하기'}
            </button>

            {translatedText && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-green-900/30 border border-green-500/30 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-green-400">번역 결과</h3>
                  {service && (
                    <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                      사용된 서비스: {service}
                    </span>
                  )}
                </div>
                <p className="text-white whitespace-pre-wrap">{translatedText}</p>
              </motion.div>
            )}
          </div>

          <div className="mt-8 p-4 bg-gray-900/50 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-400 mb-3">🔧 환경변수 설정 (선택적)</h3>
            <pre className="text-xs text-gray-400 overflow-x-auto">
{`# .env.local 파일에 추가 (선택사항)

# Papago API (네이버 개발자센터에서 발급)
PAPAGO_CLIENT_ID=your_papago_client_id
PAPAGO_CLIENT_SECRET=your_papago_client_secret

# DeepL Free API (DeepL 사이트에서 발급)
DEEPL_API_KEY=your_deepl_free_api_key

# Claude API (기존 유료 사용자)
CLAUDE_API_KEY=your_claude_api_key`}
            </pre>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            💡 API 키가 없어도 Google Translate로 자동 번역됩니다
          </div>
        </div>
      </div>
    </div>
  )
}