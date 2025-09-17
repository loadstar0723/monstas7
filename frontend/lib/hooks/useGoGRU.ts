// Go Trading Engine GRU 통합 훅
import { useState, useEffect, useCallback } from 'react'
import { goTradingEngine } from '@/lib/services/goTradingEngineService'

interface GRUGates {
  updateGate: number
  resetGate: number
  candidateState: number
  hiddenState: number
}

interface GRUPrediction {
  timestamp: string
  price: number
  prediction: number
  confidence: number
  gates: GRUGates
  signal: 'BUY' | 'SELL' | 'HOLD'
}

interface GRUPerformance {
  model: string
  accuracy: number
  loss: number
  trainTime: number
  inferenceTime: number
  memoryUsage: number
}

interface HyperParams {
  hiddenSize: number
  numLayers: number
  dropout: number
  learningRate: number
  batchSize: number
  epochs: number
}

interface UseGoGRUOptions {
  symbol: string
  interval?: string
  autoTrain?: boolean
}

export function useGoGRU({ symbol, interval = '1h', autoTrain = true }: UseGoGRUOptions) {
  const [predictions, setPredictions] = useState<GRUPrediction[]>([])
  const [currentPrediction, setCurrentPrediction] = useState<GRUPrediction | null>(null)
  const [gates, setGates] = useState<GRUGates | null>(null)
  const [performance, setPerformance] = useState<GRUPerformance | null>(null)
  const [hyperParams, setHyperParams] = useState<HyperParams>({
    hiddenSize: 128,
    numLayers: 3,
    dropout: 0.2,
    learningRate: 0.001,
    batchSize: 32,
    epochs: 100
  })
  const [isTraining, setIsTraining] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // GRU 모델 학습
  const trainModel = useCallback(async () => {
    setIsTraining(true)
    setError(null)

    try {
      const response = await fetch(`${goTradingEngine.baseUrl}/api/gru/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          interval,
          hyperParams
        })
      })

      if (!response.ok) throw new Error('GRU training failed')
      const data = await response.json()

      setPerformance({
        model: 'GRU',
        accuracy: data.accuracy,
        loss: data.loss,
        trainTime: data.trainTime,
        inferenceTime: data.inferenceTime,
        memoryUsage: data.memoryUsage
      })

      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Training failed')
      return null
    } finally {
      setIsTraining(false)
    }
  }, [symbol, interval, hyperParams])

  // 실시간 예측
  const getPrediction = useCallback(async () => {
    try {
      const response = await fetch(`${goTradingEngine.baseUrl}/api/gru/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, interval })
      })

      if (!response.ok) throw new Error('Prediction failed')
      const data = await response.json()

      const prediction: GRUPrediction = {
        timestamp: data.timestamp,
        price: data.price,
        prediction: data.prediction,
        confidence: data.confidence,
        gates: data.gates,
        signal: data.signal
      }

      setCurrentPrediction(prediction)
      setPredictions(prev => [...prev.slice(-99), prediction])
      setGates(data.gates)

      return prediction
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prediction failed')
      return null
    }
  }, [symbol, interval])

  // 게이트 상태 가져오기
  const fetchGateStates = useCallback(async () => {
    try {
      const response = await fetch(`${goTradingEngine.baseUrl}/api/gru/gates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol })
      })

      if (!response.ok) throw new Error('Failed to fetch gate states')
      const data = await response.json()
      setGates(data.gates)
      return data.gates
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gate fetch failed')
      return null
    }
  }, [symbol])

  // 성능 비교 데이터
  const comparePerformance = useCallback(async () => {
    try {
      const response = await fetch(`${goTradingEngine.baseUrl}/api/gru/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, models: ['GRU', 'LSTM', 'RNN'] })
      })

      if (!response.ok) throw new Error('Performance comparison failed')
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Comparison failed')
      return null
    }
  }, [symbol])

  // 하이퍼파라미터 최적화
  const optimizeHyperParams = useCallback(async () => {
    setIsTraining(true)
    setError(null)

    try {
      const response = await fetch(`${goTradingEngine.baseUrl}/api/gru/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          interval,
          searchSpace: {
            hiddenSize: [64, 128, 256],
            numLayers: [2, 3, 4],
            dropout: [0.1, 0.2, 0.3],
            learningRate: [0.001, 0.01, 0.1]
          }
        })
      })

      if (!response.ok) throw new Error('Hyperparameter optimization failed')
      const data = await response.json()

      setHyperParams(data.bestParams)
      return data.bestParams
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Optimization failed')
      return null
    } finally {
      setIsTraining(false)
    }
  }, [symbol, interval])

  // WebSocket 실시간 연결
  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        await goTradingEngine.connectWebSocket()
        setIsConnected(true)

        // GRU 실시간 업데이트 구독
        goTradingEngine.subscribe('gru_prediction', (data: any) => {
          if (data.symbol === symbol) {
            const prediction: GRUPrediction = {
              timestamp: data.timestamp,
              price: data.price,
              prediction: data.prediction,
              confidence: data.confidence,
              gates: data.gates,
              signal: data.signal
            }

            setCurrentPrediction(prediction)
            setPredictions(prev => [...prev.slice(-99), prediction])
            setGates(data.gates)
          }
        })

        // 게이트 상태 업데이트 구독
        goTradingEngine.subscribe('gru_gates', (data: any) => {
          if (data.symbol === symbol) {
            setGates(data.gates)
          }
        })

        // 자동 학습
        if (autoTrain) {
          await trainModel()
        }

        // 초기 예측 가져오기
        await getPrediction()
      } catch (err) {
        console.error('WebSocket connection failed:', err)
        setError('실시간 연결 실패')
        setIsConnected(false)
      }
    }

    connectWebSocket()

    return () => {
      goTradingEngine.unsubscribe('gru_prediction')
      goTradingEngine.unsubscribe('gru_gates')
    }
  }, [symbol, autoTrain, trainModel, getPrediction])

  // 주기적 예측 업데이트
  useEffect(() => {
    if (!isConnected) return

    const interval = setInterval(() => {
      getPrediction()
      fetchGateStates()
    }, 5000) // 5초마다 업데이트

    return () => clearInterval(interval)
  }, [isConnected, getPrediction, fetchGateStates])

  return {
    predictions,
    currentPrediction,
    gates,
    performance,
    hyperParams,
    setHyperParams,
    isTraining,
    isConnected,
    error,
    trainModel,
    getPrediction,
    fetchGateStates,
    comparePerformance,
    optimizeHyperParams
  }
}