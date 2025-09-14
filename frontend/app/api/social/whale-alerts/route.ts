/**
 * 고래 활동 실시간 모니터링 API
 * Whale Alert API 및 블록체인 익스플로러 연동
 */

import { NextRequest, NextResponse } from 'next/server'

// Whale Alert API (실제 API 키 필요)
const WHALE_ALERT_API_KEY = process.env.WHALE_ALERT_API_KEY || ''

export async function GET(request: NextRequest) {
  try {
    const alerts = []

    // 1. Whale Alert API 시도
    if (WHALE_ALERT_API_KEY) {
      const whaleResponse = await fetch(
        `https://api.whale-alert.io/v1/transactions?api_key=${WHALE_ALERT_API_KEY}&min_value=1000000&limit=10`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      )

      if (whaleResponse.ok) {
        const data = await whaleResponse.json()
        const formattedAlerts = data.transactions?.map((tx: any) => ({
          type: tx.transaction_type === 'transfer' ? 'transfer' :
                tx.amount_usd > 0 ? 'buy' : 'sell',
          amount: formatAmount(tx.amount),
          coin: tx.symbol?.toUpperCase() || 'UNKNOWN',
          from: tx.from?.owner || tx.from?.address?.substring(0, 10) || '알 수 없음',
          to: tx.to?.owner || tx.to?.address?.substring(0, 10) || '알 수 없음',
          time: getRelativeTime(tx.timestamp * 1000),
          usdValue: `$${formatUSD(tx.amount_usd)}`,
          hash: tx.hash
        })) || []

        return NextResponse.json({ alerts: formattedAlerts, source: 'whale_alert' })
      }
    }

    // 2. Etherscan API로 대체 (이더리움 대형 거래)
    const etherscanApiKey = process.env.ETHERSCAN_API_KEY || 'YourEtherscanAPIKey'
    const ethResponse = await fetch(
      `https://api.etherscan.io/api?module=account&action=txlist&address=0x00000000219ab540356cBB839Cbe05303d7705Fa&startblock=0&endblock=99999999&page=1&offset=5&sort=desc&apikey=${etherscanApiKey}`
    )

    if (ethResponse.ok) {
      const ethData = await ethResponse.json()
      if (ethData.status === '1' && ethData.result) {
        ethData.result.forEach((tx: any) => {
          const value = parseInt(tx.value) / 1e18 // Wei to ETH
          if (value > 100) { // 100 ETH 이상만
            alerts.push({
              type: 'transfer',
              amount: value.toFixed(2),
              coin: 'ETH',
              from: tx.from.substring(0, 10),
              to: tx.to.substring(0, 10),
              time: getRelativeTime(parseInt(tx.timeStamp) * 1000),
              usdValue: `$${formatUSD(value * 2250)}`, // ETH 가격 예상치
              hash: tx.hash
            })
          }
        })
      }
    }

    // 3. Binance 대형 거래 모니터링 (WebSocket 데이터 기반)
    const binanceResponse = await fetch('https://api.binance.com/api/v3/aggTrades?symbol=BTCUSDT&limit=10')
    if (binanceResponse.ok) {
      const trades = await binanceResponse.json()
      trades.forEach((trade: any) => {
        const btcAmount = parseFloat(trade.q)
        const usdValue = btcAmount * parseFloat(trade.p)

        if (usdValue > 1000000) { // 100만 달러 이상
          alerts.push({
            type: trade.m ? 'sell' : 'buy',
            amount: btcAmount.toFixed(4),
            coin: 'BTC',
            from: trade.m ? 'Binance Trader' : 'Binance',
            to: trade.m ? 'Binance' : 'Binance Trader',
            time: getRelativeTime(trade.T),
            usdValue: `$${formatUSD(usdValue)}`,
            hash: `binance_${trade.a}`
          })
        }
      })
    }

    // 4. CryptoQuant 온체인 데이터
    const cryptoQuantResponse = await fetch(
      'https://api.cryptoquant.com/v1/btc/exchange-flows/inflow',
      {
        headers: {
          'Authorization': `Bearer ${process.env.CRYPTOQUANT_API_KEY || ''}`
        }
      }
    )

    if (cryptoQuantResponse.ok) {
      const cqData = await cryptoQuantResponse.json()
      cqData.result?.data?.forEach((flow: any) => {
        if (flow.value > 100) { // 100 BTC 이상
          alerts.push({
            type: 'transfer',
            amount: flow.value.toFixed(2),
            coin: 'BTC',
            from: '개인 지갑',
            to: flow.exchange_name || '거래소',
            time: getRelativeTime(flow.datetime),
            usdValue: `$${formatUSD(flow.value * 43000)}`,
            hash: `cq_${flow.datetime}`
          })
        }
      })
    }

    // 정렬 (최신순)
    alerts.sort((a, b) => {
      const timeA = parseRelativeTime(a.time)
      const timeB = parseRelativeTime(b.time)
      return timeB - timeA
    })

    return NextResponse.json({
      alerts: alerts.slice(0, 20), // 최대 20개
      source: alerts.length > 0 ? 'mixed' : 'none'
    })

  } catch (error) {
    console.error('Whale Alert API 에러:', error)
    return NextResponse.json({ alerts: [], source: 'error' })
  }
}

function formatAmount(amount: number): string {
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(2) + 'M'
  }
  if (amount >= 1000) {
    return (amount / 1000).toFixed(0) + 'K'
  }
  return amount.toFixed(2)
}

function formatUSD(value: number): string {
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(2) + 'B'
  }
  if (value >= 1000000) {
    return (value / 1000000).toFixed(2) + 'M'
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(0) + 'K'
  }
  return value.toFixed(0)
}

function getRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  if (minutes < 1440) return `${Math.floor(minutes / 60)}시간 전`
  return `${Math.floor(minutes / 1440)}일 전`
}

function parseRelativeTime(timeStr: string): number {
  const now = Date.now()
  if (timeStr === '방금 전') return now

  const match = timeStr.match(/(\d+)(분|시간|일)/)
  if (!match) return now

  const [, value, unit] = match
  const num = parseInt(value)

  switch (unit) {
    case '분': return now - num * 60000
    case '시간': return now - num * 3600000
    case '일': return now - num * 86400000
    default: return now
  }
}