package lstm

import (
    "bytes"
    "encoding/json"
    "fmt"
    "log"
    "math"
    "net/http"
    "sync"
    "time"
)

// LSTMPredictor LSTM 예측 엔진
type LSTMPredictor struct {
    pythonAPI    string
    cache        map[string]*Prediction
    cacheMutex   sync.RWMutex
    dataBuffer   []MarketData
    bufferMutex  sync.Mutex
    predictions  chan Prediction
}

// MarketData 시장 데이터
type MarketData struct {
    Symbol    string    `json:"symbol"`
    Price     float64   `json:"price"`
    Volume    float64   `json:"volume"`
    High      float64   `json:"high"`
    Low       float64   `json:"low"`
    Open      float64   `json:"open"`
    Close     float64   `json:"close"`
    Timestamp time.Time `json:"timestamp"`
}

// Prediction LSTM 예측 결과
type Prediction struct {
    Symbol       string    `json:"symbol"`
    CurrentPrice float64   `json:"current_price"`
    PredictedPrice float64 `json:"predicted_price"`
    Direction    string    `json:"direction"` // UP, DOWN, NEUTRAL
    Confidence   float64   `json:"confidence"`
    TimeHorizon  string    `json:"time_horizon"` // 1h, 4h, 1d
    Features     Features  `json:"features"`
    Timestamp    time.Time `json:"timestamp"`
}

// Features 기술적 특징
type Features struct {
    RSI        float64 `json:"rsi"`
    MACD       float64 `json:"macd"`
    BollingerUpper float64 `json:"bollinger_upper"`
    BollingerLower float64 `json:"bollinger_lower"`
    Volume24h  float64 `json:"volume_24h"`
    Volatility float64 `json:"volatility"`
}

// NewLSTMPredictor 새로운 LSTM 예측기 생성
func NewLSTMPredictor(pythonAPI string) *LSTMPredictor {
    return &LSTMPredictor{
        pythonAPI:   pythonAPI,
        cache:       make(map[string]*Prediction),
        dataBuffer:  make([]MarketData, 0, 1000),
        predictions: make(chan Prediction, 100),
    }
}

// AddData 데이터 버퍼에 추가
func (l *LSTMPredictor) AddData(data MarketData) {
    l.bufferMutex.Lock()
    defer l.bufferMutex.Unlock()

    l.dataBuffer = append(l.dataBuffer, data)

    // 버퍼 크기 제한 (최근 1000개만 유지)
    if len(l.dataBuffer) > 1000 {
        l.dataBuffer = l.dataBuffer[len(l.dataBuffer)-1000:]
    }

    // 100개 데이터마다 예측 실행
    if len(l.dataBuffer)%100 == 0 {
        go l.runPrediction(data.Symbol)
    }
}

// runPrediction 예측 실행
func (l *LSTMPredictor) runPrediction(symbol string) {
    l.bufferMutex.Lock()
    data := make([]MarketData, len(l.dataBuffer))
    copy(data, l.dataBuffer)
    l.bufferMutex.Unlock()

    // 데이터 전처리
    processed := l.preprocessData(data)

    // 기술적 지표 계산
    features := l.calculateFeatures(processed)

    // Python AI 서버로 예측 요청
    prediction := l.callPythonAPI(symbol, processed, features)

    if prediction != nil {
        // 캐시 업데이트
        l.cacheMutex.Lock()
        l.cache[symbol] = prediction
        l.cacheMutex.Unlock()

        // 예측 채널로 전송
        select {
        case l.predictions <- *prediction:
        default:
            // 채널이 가득 찬 경우 스킵
        }
    }
}

// preprocessData 데이터 전처리 (Go의 병렬 처리 활용)
func (l *LSTMPredictor) preprocessData(data []MarketData) []MarketData {
    if len(data) == 0 {
        return data
    }

    // 병렬 처리를 위한 워커 수
    numWorkers := 4
    chunkSize := len(data) / numWorkers

    var wg sync.WaitGroup
    processed := make([]MarketData, len(data))

    for i := 0; i < numWorkers; i++ {
        start := i * chunkSize
        end := start + chunkSize
        if i == numWorkers-1 {
            end = len(data)
        }

        wg.Add(1)
        go func(start, end int) {
            defer wg.Done()

            for j := start; j < end; j++ {
                // 정규화
                processed[j] = data[j]
                processed[j].Price = l.normalize(data[j].Price, 0, 100000)
                processed[j].Volume = l.normalize(data[j].Volume, 0, 1000000)
            }
        }(start, end)
    }

    wg.Wait()
    return processed
}

// calculateFeatures 기술적 지표 계산
func (l *LSTMPredictor) calculateFeatures(data []MarketData) Features {
    if len(data) < 14 {
        return Features{}
    }

    // RSI 계산
    rsi := l.calculateRSI(data, 14)

    // MACD 계산
    macd := l.calculateMACD(data)

    // 볼린저 밴드 계산
    upper, lower := l.calculateBollingerBands(data, 20)

    // 24시간 거래량
    volume24h := 0.0
    for i := len(data) - 24; i < len(data) && i >= 0; i++ {
        volume24h += data[i].Volume
    }

    // 변동성 계산
    volatility := l.calculateVolatility(data)

    return Features{
        RSI:        rsi,
        MACD:       macd,
        BollingerUpper: upper,
        BollingerLower: lower,
        Volume24h:  volume24h,
        Volatility: volatility,
    }
}

// calculateRSI RSI 계산
func (l *LSTMPredictor) calculateRSI(data []MarketData, period int) float64 {
    if len(data) < period {
        return 50.0
    }

    gains := 0.0
    losses := 0.0

    for i := len(data) - period; i < len(data)-1; i++ {
        change := data[i+1].Price - data[i].Price
        if change > 0 {
            gains += change
        } else {
            losses += math.Abs(change)
        }
    }

    avgGain := gains / float64(period)
    avgLoss := losses / float64(period)

    if avgLoss == 0 {
        return 100.0
    }

    rs := avgGain / avgLoss
    rsi := 100 - (100 / (1 + rs))

    return rsi
}

// calculateMACD MACD 계산
func (l *LSTMPredictor) calculateMACD(data []MarketData) float64 {
    if len(data) < 26 {
        return 0.0
    }

    // 간단한 MACD 계산 (12일 EMA - 26일 EMA)
    ema12 := l.calculateEMA(data, 12)
    ema26 := l.calculateEMA(data, 26)

    return ema12 - ema26
}

// calculateEMA 지수 이동 평균 계산
func (l *LSTMPredictor) calculateEMA(data []MarketData, period int) float64 {
    if len(data) < period {
        return 0.0
    }

    multiplier := 2.0 / float64(period+1)
    ema := data[len(data)-period].Price

    for i := len(data) - period + 1; i < len(data); i++ {
        ema = (data[i].Price-ema)*multiplier + ema
    }

    return ema
}

// calculateBollingerBands 볼린저 밴드 계산
func (l *LSTMPredictor) calculateBollingerBands(data []MarketData, period int) (upper, lower float64) {
    if len(data) < period {
        return 0, 0
    }

    // SMA 계산
    sum := 0.0
    for i := len(data) - period; i < len(data); i++ {
        sum += data[i].Price
    }
    sma := sum / float64(period)

    // 표준편차 계산
    variance := 0.0
    for i := len(data) - period; i < len(data); i++ {
        variance += math.Pow(data[i].Price-sma, 2)
    }
    stdDev := math.Sqrt(variance / float64(period))

    upper = sma + (2 * stdDev)
    lower = sma - (2 * stdDev)

    return upper, lower
}

// calculateVolatility 변동성 계산
func (l *LSTMPredictor) calculateVolatility(data []MarketData) float64 {
    if len(data) < 2 {
        return 0.0
    }

    returns := make([]float64, 0)
    for i := 1; i < len(data); i++ {
        if data[i-1].Price > 0 {
            ret := (data[i].Price - data[i-1].Price) / data[i-1].Price
            returns = append(returns, ret)
        }
    }

    if len(returns) == 0 {
        return 0.0
    }

    // 평균 수익률
    avgReturn := 0.0
    for _, r := range returns {
        avgReturn += r
    }
    avgReturn /= float64(len(returns))

    // 분산
    variance := 0.0
    for _, r := range returns {
        variance += math.Pow(r-avgReturn, 2)
    }
    variance /= float64(len(returns))

    // 변동성 (표준편차)
    return math.Sqrt(variance) * 100
}

// callPythonAPI Python AI 서버 호출
func (l *LSTMPredictor) callPythonAPI(symbol string, data []MarketData, features Features) *Prediction {
    // TODO: 실제 Python AI 서버 연동
    // 현재는 모의 예측 생성

    if len(data) == 0 {
        return nil
    }

    currentPrice := data[len(data)-1].Price

    // 간단한 예측 로직 (실제로는 Python LSTM 모델 사용)
    var direction string
    var predictedPrice float64
    var confidence float64

    if features.RSI > 70 {
        direction = "DOWN"
        predictedPrice = currentPrice * 0.98
        confidence = 0.75
    } else if features.RSI < 30 {
        direction = "UP"
        predictedPrice = currentPrice * 1.02
        confidence = 0.75
    } else {
        direction = "NEUTRAL"
        predictedPrice = currentPrice
        confidence = 0.5
    }

    // 변동성에 따른 신뢰도 조정
    if features.Volatility > 5 {
        confidence *= 0.8
    }

    return &Prediction{
        Symbol:         symbol,
        CurrentPrice:   currentPrice,
        PredictedPrice: predictedPrice,
        Direction:      direction,
        Confidence:     confidence,
        TimeHorizon:    "1h",
        Features:       features,
        Timestamp:      time.Now(),
    }
}

// normalize 정규화
func (l *LSTMPredictor) normalize(value, min, max float64) float64 {
    if max-min == 0 {
        return 0
    }
    return (value - min) / (max - min)
}

// GetPrediction 최신 예측 가져오기
func (l *LSTMPredictor) GetPrediction(symbol string) *Prediction {
    l.cacheMutex.RLock()
    defer l.cacheMutex.RUnlock()

    return l.cache[symbol]
}

// GetPredictionChannel 예측 채널 반환
func (l *LSTMPredictor) GetPredictionChannel() <-chan Prediction {
    return l.predictions
}