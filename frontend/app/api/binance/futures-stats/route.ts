import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'BTCUSDT'
    
    // Binance Futures API
    const [openInterestRes, fundingRes, tickerRes] = await Promise.all([
      fetch(`https://fapi.binance.com/fapi/v1/openInterest?symbol=${symbol}`),
      fetch(`https://fapi.binance.com/fapi/v1/fundingRate?symbol=${symbol}&limit=1`),
      fetch(`https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=${symbol}`)
    ])
    
    const openInterest = await openInterestRes.json()
    const funding = await fundingRes.json()
    const ticker = await tickerRes.json()
    
    const currentPrice = parseFloat(ticker.lastPrice)
    const volume24h = parseFloat(ticker.volume) * currentPrice
    const volatility = ((parseFloat(ticker.highPrice) - parseFloat(ticker.lowPrice)) / currentPrice) * 100
    
    // Open Interest
    const oiContracts = parseFloat(openInterest.openInterest)
    const oiValue = oiContracts * currentPrice
    const oiRatio = (oiValue / volume24h) * 100
    
    // Funding Rate (8h, annualized)
    const currentFunding = funding[0] ? parseFloat(funding[0].fundingRate) : 0
    const annualizedFunding = currentFunding * 3 * 365 * 100
    
    // Risk Level
    let liquidationRisk = 'low'
    if (volatility > 5) {
      liquidationRisk = 'extreme'
    } else if (volatility > 3) {
      liquidationRisk = 'high'
    } else if (volatility > 2) {
      liquidationRisk = 'medium'
    }
    
    return NextResponse.json({
      success: true,
      data: {
        openInterest: {
          contracts: oiContracts,
          value: oiValue,
          ratio: oiRatio
        },
        funding: {
          rate: currentFunding * 100,
          annualized: annualizedFunding,
          nextTime: Date.now() + (8 - (new Date().getHours() % 8)) * 3600000,
          lastRate: currentFunding * 100
        },
        ratios: {
          longShort: 1,
          topTraders: 1,
          sentiment: 'neutral'
        },
        liquidation: {
          risk: liquidationRisk,
          volatility: volatility,
          estimatedCascade: volatility > 3 ? currentPrice * 0.05 : currentPrice * 0.03,
          warningLevel: volatility > 5 ? 'critical' : volatility > 3 ? 'warning' : 'normal'
        },
        market: {
          price: currentPrice,
          volume24h: volume24h,
          volatility: volatility,
          highPrice: parseFloat(ticker.highPrice),
          lowPrice: parseFloat(ticker.lowPrice)
        },
        timestamp: Date.now()
      }
    })
    
  } catch (error) {
    console.error('Futures stats error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch futures statistics',
      data: {
        openInterest: {
          contracts: 0,
          value: 0,
          ratio: 0
        },
        funding: {
          rate: 0,
          annualized: 0,
          nextTime: Date.now() + 3600000,
          lastRate: 0
        },
        ratios: {
          longShort: 1,
          topTraders: 1,
          sentiment: 'neutral'
        },
        liquidation: {
          risk: 'medium',
          volatility: 2,
          estimatedCascade: 0,
          warningLevel: 'normal'
        }
      }
    })
  }
}