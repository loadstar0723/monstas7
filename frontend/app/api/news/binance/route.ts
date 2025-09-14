/**
 * Binance 공지사항 API 라우트
 * 바이낸스 공식 공지사항 제공
 */

import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Binance 공지사항 API - next 옵션 제거
    const response = await fetch(
      'https://www.binance.com/bapi/composite/v1/public/cms/article/list/query',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 1,
          pageNo: 1,
          pageSize: 20,
          tags: []
        })
      }
    )

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`)
    }

    const data = await response.json()

    // 데이터 형식 변환
    const articles = data.data?.catalogs?.[0]?.articles || []

    const formattedArticles = articles.map((article: any) => ({
      id: article.id,
      code: article.code,
      title: article.title,
      brief: article.brief,
      content: article.content,
      releaseDate: article.releaseDate,
      tags: article.tags || []
    }))

    return NextResponse.json({
      articles: formattedArticles,
      total: formattedArticles.length
    })

  } catch (error) {
    console.error('Binance API 에러:', error)

    // 에러 시 빈 배열 반환 (앱 중단 방지)
    return NextResponse.json({
      articles: [],
      total: 0,
      error: 'Binance API temporarily unavailable'
    })
  }
}