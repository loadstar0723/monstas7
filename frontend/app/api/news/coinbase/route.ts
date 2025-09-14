/**
 * Coinbase 블로그/뉴스 API 라우트
 * 코인베이스 공식 블로그 제공
 */

import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Coinbase 블로그 RSS를 JSON으로 변환하는 서비스 사용
    const response = await fetch(
      'https://api.rss2json.com/v1/api.json?rss_url=https://blog.coinbase.com/feed'
    )

    if (!response.ok) {
      throw new Error(`RSS API error: ${response.status}`)
    }

    const data = await response.json()

    // 데이터 형식 변환
    const posts = data.items?.map((item: any) => ({
      id: item.guid || item.link,
      title: item.title,
      excerpt: item.description?.replace(/<[^>]*>/g, '').substring(0, 200),
      content: item.content || item.description,
      url: item.link,
      published_at: item.pubDate,
      tags: item.categories || ['Coinbase'],
      author: {
        name: item.author || 'Coinbase Team'
      },
      feature_image: item.thumbnail || item.enclosure?.link
    })) || []

    return NextResponse.json({
      posts: posts.slice(0, 20), // 최대 20개
      total: posts.length
    })

  } catch (error) {
    console.error('Coinbase RSS 에러:', error)

    // 에러 시 빈 배열 반환
    return NextResponse.json({
      posts: [],
      total: 0,
      error: 'Coinbase blog temporarily unavailable'
    })
  }
}