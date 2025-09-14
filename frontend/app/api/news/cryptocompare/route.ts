import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiKey = '57f89e8ea43da615e49a75d31d9e64742063d53553dc16bb7b832a8ea359422b'
    const response = await fetch(
      `https://min-api.cryptocompare.com/data/v2/news/?lang=EN&api_key=${apiKey}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        next: { revalidate: 60 } // 캐시 60초
      }
    )

    if (!response.ok) {
      console.error('CryptoCompare API error:', response.status, response.statusText)
      // 샘플 데이터 반환
      return NextResponse.json({
        Data: getSampleNews(),
        Message: 'Using sample data due to API error'
      })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    // 에러 시 샘플 데이터 반환
    return NextResponse.json({
      Data: getSampleNews(),
      Message: 'Using sample data due to error'
    })
  }
}

// 샘플 뉴스 데이터 - 한국어
function getSampleNews() {
  const now = Math.floor(Date.now() / 1000)
  return [
    {
      id: '1',
      title: '비트코인, 기관 투자자 유입 가속화로 사상 최고가 경신',
      body: '주요 금융 기관들이 암호화폐에 대한 대규모 투자를 발표하면서 비트코인이 전례 없는 수준으로 급등했습니다. 포춘 500대 기업 여러 곳이 비트코인을 기업 자산으로 추가하는 등 기관 투자자들의 관심이 크게 증가하고 있습니다.',
      url: 'https://example.com/news/1',
      published_on: now - 3600,
      source_info: { name: '크립토뉴스', url: 'https://cryptonews.com' },
      categories: 'BTC|Market|Analysis',
      imageurl: 'https://via.placeholder.com/400x200'
    },
    {
      id: '2',
      title: '이더리움 레이어2 솔루션, 일일 거래 500만 건 돌파',
      body: '이더리움의 레이어2 스케일링 솔루션이 일일 500만 건 이상의 거래를 처리하는 중요한 이정표를 달성했습니다. 이는 이더리움 확장성 문제 해결에 있어 주요한 성과입니다.',
      url: 'https://example.com/news/2',
      published_on: now - 7200,
      source_info: { name: '디파이 데일리', url: 'https://defidaily.com' },
      categories: 'ETH|DeFi|Technology',
      imageurl: 'https://via.placeholder.com/400x200'
    },
    {
      id: '3',
      title: 'SEC, 역사적 결정으로 비트코인 현물 ETF 다수 승인',
      body: '미국 증권거래위원회가 여러 비트코인 ETF 신청을 승인하여 암호화폐 투자의 주류 편입을 위한 문을 열었습니다.',
      url: 'https://example.com/news/3',
      published_on: now - 10800,
      source_info: { name: '규제 감시', url: 'https://regwatch.com' },
      categories: 'BTC|Regulation|ETF',
      imageurl: 'https://via.placeholder.com/400x200'
    }
  ]
}