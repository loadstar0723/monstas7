import { NextRequest, NextResponse } from 'next/server'

// 실제 프로덕션에서는 DB나 환경변수에서 가져옴
export async function GET(request: NextRequest) {
  try {
    // 실제 트레이딩 설정값 (DB에서 가져올 수 있음)
    const config = {
      imbalance: {
        // OFI 임계값
        ofiThresholds: {
          neutral: 0.1,
          buy: 0.1,
          strongBuy: 0.3,
          sell: -0.1,
          strongSell: -0.3
        },
        // 신뢰도 설정
        confidence: {
          strongBuy: 85,
          buy: 65,
          neutral: 50,
          sell: 65,
          strongSell: 85
        },
        // 오더북 임밸런스 임계값
        orderBookThresholds: {
          strongBuy: 0.6,
          strongSell: 0.4,
          critical: 0.8
        },
        // 트레이딩 전략 비율
        tradingRatios: {
          stopLossLong: 0.98,
          stopLossShort: 1.02,
          takeProfitLong: 1.03,
          takeProfitShort: 0.97,
          entryThreshold: 0.6  // 60%
        },
        // 업데이트 간격 (ms)
        intervals: {
          orderBook: 5000,
          priceCheck: 1000,
          reconnectDelay: 3000,
          initialLoadDelay: 1000
        },
        // 데이터 설정
        dataLimits: {
          tradeHistory: 100,
          orderbookDepth: 20,
          klineHistory: 60,
          displayTrades: 20
        },
        // 차트 설정
        chartConfig: {
          height: 300,
          margins: { top: 20, right: 30, left: 20, bottom: 5 }
        },
        // UI 임계값
        uiThresholds: {
          highConfidence: 70,
          mediumConfidence: 50,
          highOfi: 0.3,
          mediumOfi: 0.1
        }
      },
      // 거래소별 수수료
      fees: {
        binance: {
          maker: 0.001,  // 0.1%
          taker: 0.001   // 0.1%
        }
      },
      // 리스크 관리
      risk: {
        maxLeverage: 10,
        defaultLeverage: 3,
        maxPositionSize: 0.1,  // 전체 자본의 10%
        minPositionSize: 0.01  // 전체 자본의 1%
      }
    }
    
    return NextResponse.json(config)
  } catch (error) {
    console.error('Trading config error:', error)
    // 에러 시에도 기본 설정 반환
    return NextResponse.json({
      imbalance: {
        ofiThresholds: {
          neutral: 0.1,
          buy: 0.1,
          strongBuy: 0.3,
          sell: -0.1,
          strongSell: -0.3
        }
      }
    })
  }
}