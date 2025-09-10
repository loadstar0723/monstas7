// 풋프린트 차트 설정 상수
// 이 값들은 실제 API에서 가져와야 하지만, 현재는 환경변수에서 로드

export const FOOTPRINT_CONFIG = {
  // Value Area 계산 비율 (전체 볼륨의 몇 %를 Value Area로 정의할지)
  VALUE_AREA_PERCENTAGE: parseFloat(process.env.NEXT_PUBLIC_VALUE_AREA_PERCENTAGE || '70') / 100,
  
  // 히트맵 임계값 비율
  HEATMAP_THRESHOLD_RATIO: parseFloat(process.env.NEXT_PUBLIC_HEATMAP_THRESHOLD || '70') / 100,
  HEATMAP_HOURLY_THRESHOLD: parseFloat(process.env.NEXT_PUBLIC_HEATMAP_HOURLY_THRESHOLD || '60') / 100,
  
  // 투명도 설정
  OPACITY_BASE: parseFloat(process.env.NEXT_PUBLIC_OPACITY_BASE || '30') / 100,
  OPACITY_MAX: parseFloat(process.env.NEXT_PUBLIC_OPACITY_MAX || '90') / 100,
  OPACITY_INTENSITY_FACTOR: parseFloat(process.env.NEXT_PUBLIC_OPACITY_FACTOR || '60') / 100,
  
  // 트레이딩 시그널 설정
  STOP_LOSS_RATIO: parseFloat(process.env.NEXT_PUBLIC_STOP_LOSS_RATIO || '98') / 100,
  SUPPORT_LEVEL_1: parseFloat(process.env.NEXT_PUBLIC_SUPPORT_1 || '99') / 100,
  SUPPORT_LEVEL_2: parseFloat(process.env.NEXT_PUBLIC_SUPPORT_2 || '98') / 100,
  SUPPORT_LEVEL_3: parseFloat(process.env.NEXT_PUBLIC_SUPPORT_3 || '97') / 100,
  
  // 캔들 데이터 샘플링 비율
  CANDLE_SAMPLE_RATIO: parseFloat(process.env.NEXT_PUBLIC_CANDLE_SAMPLE || '10') / 100,
  
  // WebSocket 설정
  MAX_RECONNECT_ATTEMPTS: parseInt(process.env.NEXT_PUBLIC_MAX_RECONNECT || '5'),
  RECONNECT_BASE_DELAY: parseInt(process.env.NEXT_PUBLIC_RECONNECT_DELAY || '1000'),
  MAX_RECONNECT_DELAY: parseInt(process.env.NEXT_PUBLIC_MAX_RECONNECT_DELAY || '30000'),
  
  // 데이터 보관 설정
  MAX_FOOTPRINT_CELLS: parseInt(process.env.NEXT_PUBLIC_MAX_FOOTPRINT_CELLS || '100'),
  MAX_ORDER_FLOW_RECORDS: parseInt(process.env.NEXT_PUBLIC_MAX_ORDER_FLOW || '500'),
  
  // 가격 그룹핑 설정 (심볼별)
  PRICE_GROUPING: {
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
  
  // 고래 거래 임계값 (심볼별)
  WHALE_THRESHOLDS: {
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

// API에서 설정을 가져오는 함수 (추후 구현)
export async function loadConfigFromAPI(): Promise<typeof FOOTPRINT_CONFIG> {
  try {
    const response = await fetch('/api/footprint/config')
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('설정 로드 실패, 기본값 사용:', error)
  }
  return FOOTPRINT_CONFIG
}