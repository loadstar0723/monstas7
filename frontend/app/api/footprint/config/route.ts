import { NextResponse } from 'next/server'

// 실제 프로덕션에서는 데이터베이스에서 가져와야 함
export async function GET() {
  try {
    // TODO: PostgreSQL에서 설정값 조회
    // const config = await prisma.footprintConfig.findFirst()
    
    // 현재는 환경변수에서 로드
    const config = {
      valueAreaPercentage: parseFloat(process.env.NEXT_PUBLIC_VALUE_AREA_PERCENTAGE || '70') / 100,
      heatmapThresholdRatio: parseFloat(process.env.NEXT_PUBLIC_HEATMAP_THRESHOLD || '70') / 100,
      heatmapHourlyThreshold: parseFloat(process.env.NEXT_PUBLIC_HEATMAP_HOURLY_THRESHOLD || '60') / 100,
      opacityBase: parseFloat(process.env.NEXT_PUBLIC_OPACITY_BASE || '30') / 100,
      opacityMax: parseFloat(process.env.NEXT_PUBLIC_OPACITY_MAX || '90') / 100,
      opacityIntensityFactor: parseFloat(process.env.NEXT_PUBLIC_OPACITY_FACTOR || '60') / 100,
      stopLossRatio: parseFloat(process.env.NEXT_PUBLIC_STOP_LOSS_RATIO || '98') / 100,
      supportLevel1: parseFloat(process.env.NEXT_PUBLIC_SUPPORT_1 || '99') / 100,
      supportLevel2: parseFloat(process.env.NEXT_PUBLIC_SUPPORT_2 || '98') / 100,
      supportLevel3: parseFloat(process.env.NEXT_PUBLIC_SUPPORT_3 || '97') / 100,
      candleSampleRatio: parseFloat(process.env.NEXT_PUBLIC_CANDLE_SAMPLE || '10') / 100,
      maxReconnectAttempts: parseInt(process.env.NEXT_PUBLIC_MAX_RECONNECT || '5'),
      reconnectBaseDelay: parseInt(process.env.NEXT_PUBLIC_RECONNECT_DELAY || '1000'),
      maxReconnectDelay: parseInt(process.env.NEXT_PUBLIC_MAX_RECONNECT_DELAY || '30000'),
      maxFootprintCells: parseInt(process.env.NEXT_PUBLIC_MAX_FOOTPRINT_CELLS || '100'),
      maxOrderFlowRecords: parseInt(process.env.NEXT_PUBLIC_MAX_ORDER_FLOW || '500'),
      priceGrouping: {
        BTCUSDT: 10,
        ETHUSDT: 5,
        BNBUSDT: 1,
        SOLUSDT: 0.5,
        XRPUSDT: 0.01,
        ADAUSDT: 0.01,
        DOGEUSDT: 0.001,
        AVAXUSDT: 0.1,
        MATICUSDT: 0.01,
        DOTUSDT: 0.1
      },
      whaleThresholds: {
        BTCUSDT: 1,
        ETHUSDT: 10,
        BNBUSDT: 50,
        SOLUSDT: 500,
        XRPUSDT: 50000,
        ADAUSDT: 50000,
        DOGEUSDT: 500000,
        AVAXUSDT: 500,
        MATICUSDT: 50000,
        DOTUSDT: 1000
      }
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Config API error:', error)
    return NextResponse.json(
      { error: 'Failed to load configuration' },
      { status: 500 }
    )
  }
}