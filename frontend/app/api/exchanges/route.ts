import { NextRequest, NextResponse } from 'next/server'

// 거래소별 API 엔드포인트
const EXCHANGE_APIS = {
  binance: 'https://api.binance.com/api/v3',
  kraken: 'https://api.kraken.com/0/public',
  coinbase: 'https://api.coinbase.com/v2',
  bitfinex: 'https://api-pub.bitfinex.com/v2',
  kucoin: 'https://api.kucoin.com/api/v1',
  gate: 'https://api.gateio.ws/api/v4',
  huobi: 'https://api.huobi.pro',
  bybit: 'https://api.bybit.com/v5',
  okx: 'https://www.okx.com/api/v5',
  blockchain: 'https://api.blockchain.info'
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const exchange = searchParams.get('exchange') || 'binance'
    const endpoint = searchParams.get('endpoint') || ''
    const symbol = searchParams.get('symbol') || 'BTC'

    // 거래소별 엔드포인트 구성
    let url = ''

    switch (exchange) {
      case 'binance':
        if (endpoint === 'ticker24hr') {
          url = `${EXCHANGE_APIS.binance}/ticker/24hr?symbol=${symbol}USDT`
        } else if (endpoint === 'depth') {
          url = `${EXCHANGE_APIS.binance}/depth?symbol=${symbol}USDT&limit=10`
        } else if (endpoint === 'trades') {
          url = `${EXCHANGE_APIS.binance}/trades?symbol=${symbol}USDT&limit=20`
        } else if (endpoint === 'klines') {
          url = `${EXCHANGE_APIS.binance}/klines?symbol=${symbol}USDT&interval=1h&limit=24`
        } else if (endpoint === 'ticker') {
          url = `${EXCHANGE_APIS.binance}/ticker/price?symbol=${symbol}USDT`
        } else {
          url = `${EXCHANGE_APIS.binance}/ticker/24hr`
        }
        break

      case 'kraken':
        const pair = symbol === 'BTC' ? 'XBTUSD' : `${symbol}USD`
        if (endpoint === 'ticker') {
          url = `${EXCHANGE_APIS.kraken}/Ticker?pair=${pair}`
        } else if (endpoint === 'ohlc') {
          url = `${EXCHANGE_APIS.kraken}/OHLC?pair=${pair}&interval=60`
        } else if (endpoint === 'depth') {
          url = `${EXCHANGE_APIS.kraken}/Depth?pair=${pair}&count=10`
        } else {
          url = `${EXCHANGE_APIS.kraken}/Ticker?pair=${pair}`
        }
        break

      case 'coinbase':
        if (endpoint === 'rates') {
          url = `${EXCHANGE_APIS.coinbase}/exchange-rates?currency=${symbol}`
        } else if (endpoint === 'spot') {
          url = `${EXCHANGE_APIS.coinbase}/prices/${symbol}-USD/spot`
        } else if (endpoint === 'time') {
          url = `${EXCHANGE_APIS.coinbase}/time`
        } else {
          url = `${EXCHANGE_APIS.coinbase}/exchange-rates?currency=BTC`
        }
        break

      case 'bitfinex':
        const ticker = symbol === 'BTC' ? 'tBTCUSD' : `t${symbol}USD`
        if (endpoint === 'ticker') {
          url = `${EXCHANGE_APIS.bitfinex}/ticker/${ticker}`
        } else if (endpoint === 'trades') {
          url = `${EXCHANGE_APIS.bitfinex}/trades/${ticker}/hist?limit=20`
        } else if (endpoint === 'book') {
          url = `${EXCHANGE_APIS.bitfinex}/book/${ticker}/P0?len=10`
        } else {
          url = `${EXCHANGE_APIS.bitfinex}/ticker/${ticker}`
        }
        break

      case 'kucoin':
        if (endpoint === 'ticker') {
          url = `${EXCHANGE_APIS.kucoin}/market/orderbook/level1?symbol=${symbol}-USDT`
        } else if (endpoint === 'stats') {
          url = `${EXCHANGE_APIS.kucoin}/market/stats?symbol=${symbol}-USDT`
        } else {
          url = `${EXCHANGE_APIS.kucoin}/market/orderbook/level1?symbol=${symbol}-USDT`
        }
        break

      case 'gate':
        if (endpoint === 'ticker') {
          url = `${EXCHANGE_APIS.gate}/spot/tickers?currency_pair=${symbol}_USDT`
        } else if (endpoint === 'orderbook') {
          url = `${EXCHANGE_APIS.gate}/spot/order_book?currency_pair=${symbol}_USDT&limit=10`
        } else {
          url = `${EXCHANGE_APIS.gate}/spot/tickers?currency_pair=${symbol}_USDT`
        }
        break

      case 'huobi':
        if (endpoint === 'ticker') {
          url = `${EXCHANGE_APIS.huobi}/market/detail/merged?symbol=${symbol.toLowerCase()}usdt`
        } else if (endpoint === 'depth') {
          url = `${EXCHANGE_APIS.huobi}/market/depth?symbol=${symbol.toLowerCase()}usdt&type=step0`
        } else {
          url = `${EXCHANGE_APIS.huobi}/market/detail/merged?symbol=${symbol.toLowerCase()}usdt`
        }
        break

      case 'bybit':
        if (endpoint === 'ticker') {
          url = `${EXCHANGE_APIS.bybit}/market/tickers?category=spot&symbol=${symbol}USDT`
        } else if (endpoint === 'orderbook') {
          url = `${EXCHANGE_APIS.bybit}/market/orderbook?category=spot&symbol=${symbol}USDT&limit=10`
        } else {
          url = `${EXCHANGE_APIS.bybit}/market/tickers?category=spot&symbol=${symbol}USDT`
        }
        break

      case 'okx':
        if (endpoint === 'ticker') {
          url = `${EXCHANGE_APIS.okx}/market/ticker?instId=${symbol}-USDT`
        } else if (endpoint === 'books') {
          url = `${EXCHANGE_APIS.okx}/market/books?instId=${symbol}-USDT&sz=10`
        } else {
          url = `${EXCHANGE_APIS.okx}/market/ticker?instId=${symbol}-USDT`
        }
        break

      case 'blockchain':
        if (endpoint === 'stats') {
          url = `${EXCHANGE_APIS.blockchain}/stats`
        } else if (endpoint === 'ticker') {
          url = `${EXCHANGE_APIS.blockchain}/../blockchain.info/ticker`
        } else {
          url = `${EXCHANGE_APIS.blockchain}/stats`
        }
        break

      default:
        return NextResponse.json({ error: 'Invalid exchange' }, { status: 400 })
    }

    // API 호출
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      next: { revalidate: 10 } // 10초 캐시
    })

    if (!response.ok) {
      throw new Error(`${exchange} API error: ${response.status}`)
    }

    const data = await response.json()

    // 응답에 거래소 정보 추가
    return NextResponse.json({
      exchange,
      endpoint,
      symbol,
      data,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Exchange proxy error:', error)
    return NextResponse.json(
      { error: `Failed to fetch data: ${error}` },
      { status: 500 }
    )
  }
}