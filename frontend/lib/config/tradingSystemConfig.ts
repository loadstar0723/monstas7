// AI Trading 시스템 안전 설정
export const tradingSystemConfig = {
  // API Rate Limiting
  rateLimit: {
    binance: {
      maxRequestsPerMinute: 1200,
      maxWebsocketConnections: 5,
      retryDelay: 1000,
      maxRetries: 3
    },
    modelServing: {
      maxConcurrentRequests: 10,
      timeout: 30000,
      batchSize: 32
    }
  },

  // 보안 설정
  security: {
    maxDailyTrades: 100,
    maxPositionSize: 0.1, // 전체 자산의 10%
    stopLossRequired: true,
    defaultStopLoss: 0.05, // 5%
    requireConfirmation: true,
    ipWhitelist: process.env.NODE_ENV === 'production',
    enable2FA: true
  },

  // 에러 핸들링
  errorHandling: {
    enableCircuitBreaker: true,
    errorThreshold: 5,
    resetTimeout: 60000,
    fallbackToMockData: false, // 절대 금지
    alertOnError: true
  },

  // 모니터링
  monitoring: {
    enableMetrics: true,
    logLevel: 'info',
    alertThresholds: {
      cpuUsage: 80,
      memoryUsage: 85,
      apiErrors: 10,
      modelLatency: 5000
    }
  },

  // 모델별 설정
  models: {
    lstm: {
      enabled: true,
      minConfidence: 0.7,
      updateFrequency: '1h',
      maxPredictionHorizon: 24
    },
    xgboost: {
      enabled: true,
      minConfidence: 0.65,
      features: 150,
      retrainPeriod: '1d'
    },
    ensemble: {
      enabled: true,
      minVotes: 3,
      weightedVoting: true,
      models: ['lstm', 'xgboost', 'randomforest']
    }
  },

  // 데이터 관리
  dataManagement: {
    maxHistoryDays: 365,
    cacheExpiry: 300, // 5분
    compressionEnabled: true,
    archiveOldData: true,
    backupFrequency: '6h'
  }
};

// 시스템 헬스체크
export const healthCheck = {
  endpoints: [
    '/api/health',
    '/api/models/status',
    '/api/data/status'
  ],
  interval: 60000,
  timeout: 5000,
  alertChannel: 'telegram'
};

// 위험 관리
export const riskManagement = {
  maxLeverage: 3,
  marginCallLevel: 0.3,
  liquidationLevel: 0.15,
  maxOpenPositions: 5,
  diversificationRequired: true,
  correlationLimit: 0.7
};