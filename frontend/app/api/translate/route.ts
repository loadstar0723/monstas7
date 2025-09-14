/**
 * 무료 번역 API 라우트
 * Google Translate, Papago, DeepL 순서로 폴백
 * 영문 뉴스를 한국어로 번역
 */

import { NextRequest, NextResponse } from 'next/server'

// API 키 설정 (선택적)
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const PAPAGO_CLIENT_ID = process.env.PAPAGO_CLIENT_ID
const PAPAGO_CLIENT_SECRET = process.env.PAPAGO_CLIENT_SECRET
const DEEPL_API_KEY = process.env.DEEPL_API_KEY

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, targetLang = 'ko', context = '' } = body

    console.log('번역 요청 받음:', { textLength: text?.length, targetLang })

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // Claude API가 없는 경우 간단한 번역 서비스 사용
    if (!CLAUDE_API_KEY) {
      // Google Translate API 무료 대안 사용
      const translatedText = await translateWithFreeService(text, targetLang)
      console.log('번역 완료:', { originalLength: text.length, translatedLength: translatedText.length })
      return NextResponse.json({ translatedText })
    }

    // Claude API 호출
    const prompt = targetLang === 'ko'
      ? `Translate the following cryptocurrency news from English to Korean. Keep technical terms accurate and maintain the professional tone. Translate naturally like a native Korean speaker:

"${text}"

Korean translation:`
      : `Translate the following text from Korean to English professionally:

"${text}"

English translation:`

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    })

    if (!response.ok) {
      console.error('Claude API error:', response.statusText)
      // 폴백: 무료 번역 서비스 사용
      const translatedText = await translateWithFreeService(text, targetLang)
      return NextResponse.json({ translatedText })
    }

    const data = await response.json()
    const translatedText = data.content[0].text

    return NextResponse.json({
      translatedText,
      service: 'claude'
    })

  } catch (error) {
    console.error('Translation API error:', error)

    // 에러 시 무료 번역 서비스로 폴백
    try {
      const { text, targetLang = 'ko' } = await request.json()
      const translatedText = await translateWithFreeService(text, targetLang)
      return NextResponse.json({
        translatedText,
        service: 'fallback'
      })
    } catch (fallbackError) {
      return NextResponse.json(
        { error: 'Translation service unavailable', translatedText: text },
        { status: 500 }
      )
    }
  }
}

/**
 * 무료 번역 서비스 체인 (우선순위: Google → Papago → DeepL → 기본)
 */
async function translateWithFreeService(
  text: string,
  targetLang: string
): Promise<string> {
  // 1. Google Translate 무료 API 시도 (가장 안정적)
  try {
    const googleTranslated = await translateWithGoogle(text, targetLang)
    if (googleTranslated && googleTranslated !== text) {
      return googleTranslated
    }
  } catch (error) {
    console.log('Google Translate 실패, 다음 서비스 시도')
  }

  // 2. Papago API 시도 (네이버, 일 10,000자 무료)
  if (PAPAGO_CLIENT_ID && PAPAGO_CLIENT_SECRET) {
    try {
      const papagoTranslated = await translateWithPapago(text, targetLang)
      if (papagoTranslated) {
        return papagoTranslated
      }
    } catch (error) {
      console.log('Papago 실패, 다음 서비스 시도')
    }
  }

  // 3. DeepL Free API 시도 (월 500,000자 무료)
  if (DEEPL_API_KEY) {
    try {
      const deeplTranslated = await translateWithDeepL(text, targetLang)
      if (deeplTranslated) {
        return deeplTranslated
      }
    } catch (error) {
      console.log('DeepL 실패, 기본 번역 사용')
    }
  }

  // 4. 기본 키워드 번역 (폴백)
  try {
    // 대체 방법: 텍스트를 그대로 반환하되 기본 번역 규칙 적용
    if (targetLang === 'ko') {
      // 간단한 키워드 기반 번역
      let translated = text
      const commonTerms: Record<string, string> = {
        'Bitcoin': '비트코인',
        'Ethereum': '이더리움',
        'price': '가격',
        'market': '시장',
        'trading': '거래',
        'surge': '급등',
        'drop': '하락',
        'rally': '상승',
        'crash': '폭락',
        'bull': '상승',
        'bear': '하락',
        'whale': '고래',
        'volume': '거래량',
        'breakout': '돌파',
        'support': '지지선',
        'resistance': '저항선',
        'buy': '매수',
        'sell': '매도',
        'long': '롱',
        'short': '숏',
        'liquidation': '청산',
        'margin': '마진',
        'leverage': '레버리지',
        'DeFi': '디파이',
        'NFT': 'NFT',
        'cryptocurrency': '암호화폐',
        'blockchain': '블록체인',
        'exchange': '거래소'
      }

      // 기본 용어 치환
      Object.entries(commonTerms).forEach(([eng, kor]) => {
        const regex = new RegExp(`\\b${eng}\\b`, 'gi')
        translated = translated.replace(regex, kor)
      })

      return translated
    }

    return text
  } catch (error) {
    console.error('Free translation service error:', error)
    return text
  }
}

/**
 * Google Translate 무료 API (비공식)
 */
async function translateWithGoogle(text: string, targetLang: string): Promise<string> {
  try {
    // 텍스트가 너무 길면 분할
    const maxLength = 500
    if (text.length > maxLength) {
      const parts = []
      for (let i = 0; i < text.length; i += maxLength) {
        parts.push(text.substring(i, i + maxLength))
      }

      const translatedParts = await Promise.all(
        parts.map(part => translateWithGoogle(part, targetLang))
      )

      return translatedParts.join(' ')
    }

    const url = new URL('https://translate.googleapis.com/translate_a/single')
    url.searchParams.append('client', 'gtx')
    url.searchParams.append('sl', 'en')  // 영어에서
    url.searchParams.append('tl', targetLang)
    url.searchParams.append('dt', 't')
    url.searchParams.append('q', text)

    console.log('Google 번역 API 호출:', url.toString().substring(0, 100) + '...')

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!response.ok) {
      console.error('Google Translate API 실패:', response.status)
      throw new Error('Google Translate API failed')
    }

    const data = await response.json()
    console.log('Google API 응답 구조:', Array.isArray(data), data?.[0]?.length)

    // Google Translate API 응답 구조 처리
    if (data && Array.isArray(data) && data[0]) {
      // 모든 번역된 부분을 합치기
      let translated = ''
      for (let i = 0; i < data[0].length; i++) {
        if (data[0][i] && data[0][i][0]) {
          translated += data[0][i][0]
        }
      }

      if (translated) {
        console.log('번역 성공, 길이:', translated.length)
        return translated
      }
    }

    console.log('번역 실패, 원문 반환')
    return text
  } catch (error) {
    console.error('Google Translate error:', error)
    throw error
  }
}

/**
 * Papago API (네이버, 일 10,000자 무료)
 */
async function translateWithPapago(text: string, targetLang: string): Promise<string> {
  try {
    const sourceLang = 'en' // 영어에서
    const targetLangCode = targetLang === 'ko' ? 'ko' : 'en'

    const response = await fetch('https://openapi.naver.com/v1/papago/n2mt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Naver-Client-Id': PAPAGO_CLIENT_ID!,
        'X-Naver-Client-Secret': PAPAGO_CLIENT_SECRET!
      },
      body: `source=${sourceLang}&target=${targetLangCode}&text=${encodeURIComponent(text)}`
    })

    if (!response.ok) {
      throw new Error('Papago API failed')
    }

    const data = await response.json()
    return data.message?.result?.translatedText || text
  } catch (error) {
    console.error('Papago error:', error)
    throw error
  }
}

/**
 * LibreTranslate 무료 API (완전 무료, API 키 불필요)
 */
async function translateWithLibre(text: string, targetLang: string): Promise<string> {
  try {
    // 여러 LibreTranslate 인스턴스 시도
    const instances = [
      'https://translate.terraprint.co',
      'https://libretranslate.com',
      'https://translate.astian.org'
    ]

    for (const instance of instances) {
      try {
        const response = await fetch(`${instance}/translate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            source: 'en',
            target: targetLang,
            format: 'text'
          })
        })

        if (response.ok) {
          const data = await response.json()
          if (data.translatedText) {
            console.log(`LibreTranslate 성공 (${instance})`)
            return data.translatedText
          }
        }
      } catch (err) {
        console.log(`LibreTranslate 인스턴스 실패: ${instance}`)
        continue
      }
    }

    throw new Error('모든 LibreTranslate 인스턴스 실패')
  } catch (error) {
    console.error('LibreTranslate error:', error)
    throw error
  }
}

/**
 * DeepL Free API (월 500,000자 무료)
 */
async function translateWithDeepL(text: string, targetLang: string): Promise<string> {
  try {
    const targetLangCode = targetLang === 'ko' ? 'KO' : 'EN'

    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `text=${encodeURIComponent(text)}&target_lang=${targetLangCode}`
    })

    if (!response.ok) {
      throw new Error('DeepL API failed')
    }

    const data = await response.json()
    return data.translations?.[0]?.text || text
  } catch (error) {
    console.error('DeepL error:', error)
    throw error
  }
}