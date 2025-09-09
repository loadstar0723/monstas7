import { NextResponse } from 'next/server'

const DERIBIT_API_URL = 'https://www.deribit.com/api/v2'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const currency = searchParams.get('currency') || 'BTC'
    const expiry = searchParams.get('expiry') // e.g., "2024-01-26"
    
    // 특정 만기일의 모든 옵션 가져오기
    const response = await fetch(
      `${DERIBIT_API_URL}/public/get_instruments?currency=${currency}&kind=option&expired=false`
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch option chain from Deribit')
    }
    
    const data = await response.json()
    const allOptions = data.result || []
    
    // 만기일로 필터링
    const filteredOptions = allOptions.filter((opt: any) => {
      const optExpiry = new Date(opt.expiration_timestamp).toISOString().split('T')[0]
      return !expiry || optExpiry === expiry
    })
    
    // 스트라이크별로 콜/풋 정리
    const optionChain: any = {}
    
    for (const option of filteredOptions) {
      const strike = option.strike
      
      if (!optionChain[strike]) {
        optionChain[strike] = {
          strike,
          call: null,
          put: null
        }
      }
      
      // 각 옵션의 현재 가격 정보 가져오기
      try {
        const tickerResponse = await fetch(
          `${DERIBIT_API_URL}/public/ticker?instrument_name=${option.instrument_name}`
        )
        if (tickerResponse.ok) {
          const tickerData = await tickerResponse.json()
          const ticker = tickerData.result
          
          const optionData = {
            instrument_name: option.instrument_name,
            bid: ticker.best_bid_price,
            ask: ticker.best_ask_price,
            last: ticker.last_price,
            volume: ticker.stats.volume,
            open_interest: ticker.open_interest,
            iv: ticker.mark_iv,
            delta: ticker.greeks?.delta,
            gamma: ticker.greeks?.gamma,
            theta: ticker.greeks?.theta,
            vega: ticker.greeks?.vega,
            rho: ticker.greeks?.rho
          }
          
          if (option.option_type === 'call') {
            optionChain[strike].call = optionData
          } else {
            optionChain[strike].put = optionData
          }
        }
      } catch (error) {
        console.error(`Error fetching ticker for ${option.instrument_name}:`, error)
      }
    }
    
    // 현물 가격 가져오기
    const indexResponse = await fetch(
      `${DERIBIT_API_URL}/public/get_index_price?index_name=${currency.toLowerCase()}_usd`
    )
    const indexData = await indexResponse.json()
    const spotPrice = indexData.result?.index_price
    
    return NextResponse.json({
      currency,
      expiry,
      spotPrice,
      optionChain: Object.values(optionChain).sort((a: any, b: any) => a.strike - b.strike)
    })
  } catch (error: any) {
    console.error('Deribit option chain error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch option chain data', details: error.message },
      { status: 500 }
    )
  }
}