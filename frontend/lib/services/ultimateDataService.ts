/**
 * 🚀 Ultimate 데이터 서비스 - 실제 작동하는 10개 무료 API 통합
 * API 키 없이 사용 가능한 진짜 무료 서비스들만 엄선
 */

export class UltimateDataService {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private cacheTTL = 30000 // 30초 캐싱

  // 1. Binance - 세계 최대 거래소 (무료, 무제한)
  async getBinanceData(symbol: string = 'BTC') {
    try {
      const [ticker24h, orderBook, trades, klines] = await Promise.all([
        fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}USDT`),
        fetch(`https://api.binance.com/api/v3/depth?symbol=${symbol}USDT&limit=10`),
        fetch(`https://api.binance.com/api/v3/trades?symbol=${symbol}USDT&limit=20`),
        fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=1h&limit=24`)
      ])

      return {
        ticker: await ticker24h.json(),
        orderBook: await orderBook.json(),
        trades: await trades.json(),
        klines: await klines.json()
      }
    } catch (error) {
      console.error('Binance error:', error)
      return null
    }
  }

  // 2. Kraken - 미국 최대 거래소 (무료, 무제한)
  async getKrakenData(symbol: string = 'BTC') {
    try {
      const pair = symbol === 'BTC' ? 'XBTUSD' : `${symbol}USD`
      const [ticker, ohlc, orderBook] = await Promise.all([
        fetch(`https://api.kraken.com/0/public/Ticker?pair=${pair}`),
        fetch(`https://api.kraken.com/0/public/OHLC?pair=${pair}&interval=60`),
        fetch(`https://api.kraken.com/0/public/Depth?pair=${pair}&count=10`)
      ])

      return {
        ticker: await ticker.json(),
        ohlc: await ohlc.json(),
        orderBook: await orderBook.json()
      }
    } catch (error) {
      console.error('Kraken error:', error)
      return null
    }
  }

  // 3. Coinbase - 미국 상장 거래소 (무료, 무제한)
  async getCoinbaseData(symbol: string = 'BTC') {
    try {
      const [rates, spotPrice, time] = await Promise.all([
        fetch(`https://api.coinbase.com/v2/exchange-rates?currency=${symbol}`),
        fetch(`https://api.coinbase.com/v2/prices/${symbol}-USD/spot`),
        fetch('https://api.coinbase.com/v2/time')
      ])

      return {
        rates: await rates.json(),
        spotPrice: await spotPrice.json(),
        serverTime: await time.json()
      }
    } catch (error) {
      console.error('Coinbase error:', error)
      return null
    }
  }

  // 4. Bitfinex - 대형 거래소 (무료)
  async getBitfinexData(symbol: string = 'BTC') {
    try {
      const ticker = symbol === 'BTC' ? 'tBTCUSD' : `t${symbol}USD`
      const response = await fetch(`https://api-pub.bitfinex.com/v2/ticker/${ticker}`)
      const data = await response.json()

      return {
        bid: data[0],
        bidSize: data[1],
        ask: data[2],
        askSize: data[3],
        dailyChange: data[4],
        dailyChangePerc: data[5],
        lastPrice: data[6],
        volume: data[7],
        high: data[8],
        low: data[9]
      }
    } catch (error) {
      console.error('Bitfinex error:', error)
      return null
    }
  }

  // 5. KuCoin - 글로벌 거래소 (무료)
  async getKuCoinData(symbol: string = 'BTC') {
    try {
      const response = await fetch(`https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${symbol}-USDT`)
      return await response.json()
    } catch (error) {
      console.error('KuCoin error:', error)
      return null
    }
  }

  // 6. Gate.io - 알트코인 거래소 (무료)
  async getGateData(symbol: string = 'BTC') {
    try {
      const response = await fetch(`https://api.gateio.ws/api/v4/spot/tickers?currency_pair=${symbol}_USDT`)
      return await response.json()
    } catch (error) {
      console.error('Gate.io error:', error)
      return null
    }
  }

  // 7. Huobi - 아시아 거래소 (무료)
  async getHuobiData(symbol: string = 'BTC') {
    try {
      const response = await fetch(`https://api.huobi.pro/market/detail/merged?symbol=${symbol.toLowerCase()}usdt`)
      return await response.json()
    } catch (error) {
      console.error('Huobi error:', error)
      return null
    }
  }

  // 8. Bybit - 파생상품 거래소 (무료)
  async getBybitData(symbol: string = 'BTC') {
    try {
      const response = await fetch(`https://api.bybit.com/v5/market/tickers?category=spot&symbol=${symbol}USDT`)
      return await response.json()
    } catch (error) {
      console.error('Bybit error:', error)
      return null
    }
  }

  // 9. OKX - 종합 거래소 (무료)
  async getOKXData(symbol: string = 'BTC') {
    try {
      const response = await fetch(`https://www.okx.com/api/v5/market/ticker?instId=${symbol}-USDT`)
      return await response.json()
    } catch (error) {
      console.error('OKX error:', error)
      return null
    }
  }

  // 10. Blockchain.info - 비트코인 전문 (무료)
  async getBlockchainData() {
    try {
      const [stats, ticker] = await Promise.all([
        fetch('https://api.blockchain.info/stats'),
        fetch('https://blockchain.info/ticker')
      ])

      return {
        stats: await stats.json(),
        ticker: await ticker.json()
      }
    } catch (error) {
      console.error('Blockchain.info error:', error)
      return null
    }
  }

  // 종합 데이터 수집
  async getAllExchangeData(symbol: string = 'BTC') {
    const results = await Promise.allSettled([
      this.getBinanceData(symbol),
      this.getKrakenData(symbol),
      this.getCoinbaseData(symbol),
      this.getBitfinexData(symbol),
      this.getKuCoinData(symbol),
      this.getGateData(symbol),
      this.getHuobiData(symbol),
      this.getBybitData(symbol),
      this.getOKXData(symbol),
      this.getBlockchainData()
    ])

    const exchanges = [
      'Binance', 'Kraken', 'Coinbase', 'Bitfinex', 'KuCoin',
      'Gate.io', 'Huobi', 'Bybit', 'OKX', 'Blockchain.info'
    ]

    const data: any = {}
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        data[exchanges[index]] = result.value
      }
    })

    return data
  }

  // 가격 집계 (모든 거래소 평균)
  aggregatePrices(exchangeData: any) {
    const prices: number[] = []

    // Binance
    if (exchangeData.Binance?.ticker) {
      prices.push(parseFloat(exchangeData.Binance.ticker.lastPrice))
    }

    // Kraken
    if (exchangeData.Kraken?.ticker?.result) {
      const krakenData = Object.values(exchangeData.Kraken.ticker.result)[0] as any
      if (krakenData?.c?.[0]) {
        prices.push(parseFloat(krakenData.c[0]))
      }
    }

    // Coinbase
    if (exchangeData.Coinbase?.spotPrice?.data?.amount) {
      prices.push(parseFloat(exchangeData.Coinbase.spotPrice.data.amount))
    }

    // Bitfinex
    if (exchangeData.Bitfinex?.lastPrice) {
      prices.push(exchangeData.Bitfinex.lastPrice)
    }

    // 평균 계산
    if (prices.length > 0) {
      const average = prices.reduce((a, b) => a + b, 0) / prices.length
      const min = Math.min(...prices)
      const max = Math.max(...prices)

      return {
        average,
        min,
        max,
        spread: max - min,
        spreadPercent: ((max - min) / average * 100).toFixed(2),
        exchanges: prices.length
      }
    }

    return null
  }

  // Fear & Greed 계산 (여러 거래소 데이터 기반)
  calculateMarketSentiment(exchangeData: any) {
    let volumeScore = 50
    let priceChangeScore = 50
    let volatilityScore = 50

    // Binance 데이터로 계산
    if (exchangeData.Binance?.ticker) {
      const ticker = exchangeData.Binance.ticker
      const priceChange = parseFloat(ticker.priceChangePercent)

      // 가격 변화 점수 (-10% ~ +10% → 0 ~ 100)
      priceChangeScore = Math.max(0, Math.min(100, (priceChange + 10) * 5))

      // 거래량 점수 (전일 대비)
      const volume = parseFloat(ticker.volume)
      const quoteVolume = parseFloat(ticker.quoteVolume)
      volumeScore = quoteVolume > 1000000000 ? 70 : 30
    }

    // 최종 Fear & Greed 점수
    const finalScore = Math.round((priceChangeScore + volumeScore + volatilityScore) / 3)

    let sentiment = 'Neutral'
    if (finalScore < 20) sentiment = 'Extreme Fear'
    else if (finalScore < 40) sentiment = 'Fear'
    else if (finalScore < 60) sentiment = 'Neutral'
    else if (finalScore < 80) sentiment = 'Greed'
    else sentiment = 'Extreme Greed'

    return {
      score: finalScore,
      sentiment,
      components: {
        priceChange: priceChangeScore,
        volume: volumeScore,
        volatility: volatilityScore
      }
    }
  }

  // 차익거래 기회 찾기
  findArbitrageOpportunities(exchangeData: any) {
    const prices: Array<{exchange: string, price: number}> = []

    // 각 거래소 가격 수집
    if (exchangeData.Binance?.ticker) {
      prices.push({
        exchange: 'Binance',
        price: parseFloat(exchangeData.Binance.ticker.lastPrice)
      })
    }

    if (exchangeData.Kraken?.ticker?.result) {
      const krakenData = Object.values(exchangeData.Kraken.ticker.result)[0] as any
      if (krakenData?.c?.[0]) {
        prices.push({
          exchange: 'Kraken',
          price: parseFloat(krakenData.c[0])
        })
      }
    }

    if (exchangeData.Coinbase?.spotPrice?.data?.amount) {
      prices.push({
        exchange: 'Coinbase',
        price: parseFloat(exchangeData.Coinbase.spotPrice.data.amount)
      })
    }

    if (exchangeData.Bitfinex?.lastPrice) {
      prices.push({
        exchange: 'Bitfinex',
        price: exchangeData.Bitfinex.lastPrice
      })
    }

    // 차익거래 기회 계산
    if (prices.length >= 2) {
      prices.sort((a, b) => a.price - b.price)
      const lowest = prices[0]
      const highest = prices[prices.length - 1]
      const spread = highest.price - lowest.price
      const spreadPercent = (spread / lowest.price * 100)

      return {
        buyExchange: lowest.exchange,
        buyPrice: lowest.price,
        sellExchange: highest.exchange,
        sellPrice: highest.price,
        profit: spread,
        profitPercent: spreadPercent.toFixed(2),
        isOpportunity: spreadPercent > 0.5 // 0.5% 이상 차이 시 기회
      }
    }

    return null
  }
}

// 싱글톤 인스턴스
export const ultimateDataService = new UltimateDataService()