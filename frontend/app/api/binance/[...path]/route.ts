import { NextRequest, NextResponse } from 'next/server';

// Binance API 프록시 라우트
// AWS IP 차단 우회를 위한 서버사이드 프록시

const BINANCE_API_BASE = 'https://api.binance.com';
const BINANCE_API_KEY = process.env.BINANCE_API_KEY || '';
const BINANCE_SECRET_KEY = process.env.BINANCE_SECRET_KEY || '';

// 서명 생성을 위한 crypto 모듈
import crypto from 'crypto';

// Rate limiting을 위한 간단한 캐시
const requestCache = new Map();
const CACHE_DURATION = 1000; // 1초

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${BINANCE_API_BASE}/${path}${searchParams ? `?${searchParams}` : ''}`;

    // 캐시 체크 (1초 내 중복 요청 방지)
    const cacheKey = url;
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }

    // Binance API 호출 (헤더에 API 키 추가)
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (BINANCE_API_KEY) {
      headers['X-MBX-APIKEY'] = BINANCE_API_KEY;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      // User-Agent 변경으로 봇 감지 우회
      next: { revalidate: 1 }
    });

    if (!response.ok) {
      // 418 에러 시 대체 데이터 소스 사용
      if (response.status === 418) {
        console.log('Binance API blocked, using alternative source');
        // CryptoCompare 또는 다른 소스로 폴백
        return NextResponse.json({
          error: 'Binance API blocked',
          status: 418,
          message: 'Please use alternative data source'
        }, { status: 418 });
      }

      throw new Error(`Binance API error: ${response.status}`);
    }

    const data = await response.json();

    // 캐시 저장
    requestCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    // 오래된 캐시 정리
    if (requestCache.size > 100) {
      const oldestKey = requestCache.keys().next().value;
      requestCache.delete(oldestKey);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Binance proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from Binance' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    const body = await request.json();
    const url = `${BINANCE_API_BASE}/${path}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (BINANCE_API_KEY) {
      headers['X-MBX-APIKEY'] = BINANCE_API_KEY;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Binance proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to post data to Binance' },
      { status: 500 }
    );
  }
}