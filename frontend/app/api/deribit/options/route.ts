import { NextResponse } from 'next/server'

const DERIBIT_API_URL = 'https://www.deribit.com/api/v2'

interface OptionInstrument {
  instrument_name: string
  underlying_currency: string
  settlement_period: string
  strike: number
  option_type: 'call' | 'put'
  expiration_timestamp: number
  is_active: boolean
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const currency = searchParams.get('currency') || 'BTC'
    const kind = searchParams.get('kind') || 'option'
    
    // 활성화된 옵션 상품 목록 가져오기
    const instrumentsResponse = await fetch(
      `${DERIBIT_API_URL}/public/get_instruments?currency=${currency}&kind=${kind}&expired=false`
    )
    
    if (!instrumentsResponse.ok) {
      throw new Error('Failed to fetch instruments from Deribit')
    }
    
    const instrumentsData = await instrumentsResponse.json()
    
    // 각 옵션에 대한 상세 정보 가져오기
    const instruments: OptionInstrument[] = instrumentsData.result || []
    
    // 현재 가격 정보 가져오기
    const tickerPromises = instruments.slice(0, 50).map(async (instrument: OptionInstrument) => {
      try {
        const tickerResponse = await fetch(
          `${DERIBIT_API_URL}/public/ticker?instrument_name=${instrument.instrument_name}`
        )
        if (tickerResponse.ok) {
          const tickerData = await tickerResponse.json()
          return {
            ...instrument,
            ticker: tickerData.result
          }
        }
        return instrument
      } catch (error) {
        console.error(`Error fetching ticker for ${instrument.instrument_name}:`, error)
        return instrument
      }
    })
    
    const instrumentsWithTickers = await Promise.all(tickerPromises)
    
    // 만기일별로 그룹화
    const optionsByExpiry = instrumentsWithTickers.reduce((acc: any, instrument: any) => {
      const expiryDate = new Date(instrument.expiration_timestamp).toISOString().split('T')[0]
      if (!acc[expiryDate]) {
        acc[expiryDate] = []
      }
      acc[expiryDate].push(instrument)
      return acc
    }, {})
    
    return NextResponse.json({
      currency,
      instruments: instrumentsWithTickers,
      optionsByExpiry,
      totalInstruments: instruments.length
    })
  } catch (error: any) {
    console.error('Deribit API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch options data', details: error.message },
      { status: 500 }
    )
  }
}