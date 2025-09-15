'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FaProjectDiagram, FaChartLine, FaExclamationTriangle,
  FaCheckCircle, FaLink, FaUnlink
} from 'react-icons/fa'
import { AiOutlineCluster } from 'react-icons/ai'
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts'

export default function ModelCorrelation() {
  const [selectedModel, setSelectedModel] = useState('Transformer')

  // 상관관계 매트릭스
  const correlationMatrix = [
    { model1: 'Transformer', model2: 'DeepAR', correlation: 0.85, strength: 'high' },
    { model1: 'Transformer', model2: 'LSTM', correlation: 0.78, strength: 'high' },
    { model1: 'Transformer', model2: 'GRU', correlation: 0.76, strength: 'high' },
    { model1: 'LSTM', model2: 'GRU', correlation: 0.92, strength: 'very-high' },
    { model1: 'XGBoost', model2: 'LightGBM', correlation: 0.88, strength: 'high' },
    { model1: 'XGBoost', model2: 'Random Forest', correlation: 0.73, strength: 'medium' },
    { model1: 'CNN', model2: 'Neural Net', correlation: 0.69, strength: 'medium' },
    { model1: 'Prophet', model2: 'ARIMA', correlation: 0.81, strength: 'high' },
    { model1: 'Transformer', model2: 'XGBoost', correlation: 0.42, strength: 'low' },
    { model1: 'LSTM', model2: 'Random Forest', correlation: 0.38, strength: 'low' },
    { model1: 'DeepAR', model2: 'ARIMA', correlation: 0.35, strength: 'low' },
    { model1: 'CNN', model2: 'Prophet', correlation: 0.31, strength: 'low' }
  ]

  // 모델별 독립성 점수
  const independenceScores = [
    { model: 'Transformer', independence: 72, diversityContribution: 18 },
    { model: 'XGBoost', independence: 68, diversityContribution: 16 },
    { model: 'CNN', independence: 75, diversityContribution: 15 },
    { model: 'Random Forest', independence: 64, diversityContribution: 13 },
    { model: 'Prophet', independence: 70, diversityContribution: 12 },
    { model: 'DeepAR', independence: 58, diversityContribution: 9 },
    { model: 'Neural Net', independence: 62, diversityContribution: 7 },
    { model: 'LightGBM', independence: 45, diversityContribution: 4 },
    { model: 'ARIMA', independence: 55, diversityContribution: 3 },
    { model: 'GRU', independence: 38, diversityContribution: 2 },
    { model: 'LSTM', independence: 35, diversityContribution: 1 }
  ]

  // 클러스터 그룹
  const modelClusters = [
    {
      name: '시계열 전문',
      models: ['LSTM', 'GRU', 'DeepAR'],
      color: '#3b82f6',
      avgCorrelation: 0.82
    },
    {
      name: '부스팅 알고리즘',
      models: ['XGBoost', 'LightGBM', 'Random Forest'],
      color: '#10b981',
      avgCorrelation: 0.76
    },
    {
      name: '패턴 인식',
      models: ['CNN', 'Neural Net'],
      color: '#f59e0b',
      avgCorrelation: 0.69
    },
    {
      name: '통계 모델',
      models: ['Prophet', 'ARIMA'],
      color: '#ef4444',
      avgCorrelation: 0.81
    },
    {
      name: '독립적',
      models: ['Transformer'],
      color: '#8b5cf6',
      avgCorrelation: 0.0
    }
  ]

  // 상관관계 시각화 데이터
  const getCorrelationData = () => {
    const models = ['Transformer', 'DeepAR', 'XGBoost', 'LightGBM', 'LSTM', 
                    'Neural Net', 'GRU', 'Random Forest', 'CNN', 'Prophet', 'ARIMA']
    
    const data = []
    models.forEach((model1, i) => {
      models.forEach((model2, j) => {
        if (i < j) {
          const corr = correlationMatrix.find(
            c => (c.model1 === model1 && c.model2 === model2) || 
                 (c.model1 === model2 && c.model2 === model1)
          )
          if (corr) {
            data.push({
              x: i,
              y: j,
              value: corr.correlation,
              model1,
              model2
            })
          }
        }
      })
    })
    return data
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <AiOutlineCluster className="text-purple-400" />
          모델 상관관계 분석
        </h3>
        <p className="text-gray-400">
          모델 간 예측 상관관계를 분석하여 다양성을 최적화합니다
        </p>
      </div>

      {/* 주요 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">평균 상관관계</span>
            <FaLink className="text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">0.62</div>
          <div className="text-sm text-gray-400 mt-1">적정 수준</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">다양성 지수</span>
            <FaProjectDiagram className="text-green-400" />
          </div>
          <div className="text-3xl font-bold text-green-400">8.2/10</div>
          <div className="text-sm text-gray-400 mt-1">높은 다양성</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">독립 모델 수</span>
            <FaUnlink className="text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-purple-400">4개</div>
          <div className="text-sm text-gray-400 mt-1">충분한 독립성</div>
        </motion.div>
      </div>

      {/* 모델 클러스터 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-xl font-bold text-white mb-4">모델 클러스터링</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modelClusters.map((cluster, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50"
              style={{ borderColor: cluster.color + '40' }}
            >
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-lg font-semibold text-white">{cluster.name}</h5>
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: cluster.color }}
                />
              </div>
              <div className="space-y-2">
                {cluster.models.map((model, idx) => (
                  <div key={idx} className="text-sm text-gray-300 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-500" />
                    {model}
                  </div>
                ))}
              </div>
              {cluster.avgCorrelation > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <p className="text-xs text-gray-400">
                    평균 상관관계: {cluster.avgCorrelation.toFixed(2)}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* 독립성 점수 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-xl font-bold text-white mb-4">모델별 독립성 점수</h4>
        <div className="space-y-3">
          {independenceScores.map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-24 text-gray-300">{item.model}</div>
              <div className="flex-1">
                <div className="bg-gray-700 rounded-full h-6 relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    style={{ width: `${item.independence}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-semibold">
                    {item.independence}%
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-400 w-32 text-right">
                다양성 기여도: {item.diversityContribution}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 상관관계 매트릭스 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-xl font-bold text-white mb-4">주요 상관관계</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-green-400 font-semibold mb-3">낮은 상관관계 (좋음)</h5>
            <div className="space-y-2">
              {correlationMatrix
                .filter(c => c.strength === 'low')
                .slice(0, 5)
                .map((corr, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-700/30 rounded-lg p-3">
                    <span className="text-sm text-gray-300">
                      {corr.model1} ↔ {corr.model2}
                    </span>
                    <span className="text-green-400 font-semibold">
                      {corr.correlation.toFixed(2)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
          
          <div>
            <h5 className="text-yellow-400 font-semibold mb-3">높은 상관관계 (주의)</h5>
            <div className="space-y-2">
              {correlationMatrix
                .filter(c => c.strength === 'high' || c.strength === 'very-high')
                .slice(0, 5)
                .map((corr, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-700/30 rounded-lg p-3">
                    <span className="text-sm text-gray-300">
                      {corr.model1} ↔ {corr.model2}
                    </span>
                    <span className={`font-semibold ${
                      corr.strength === 'very-high' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {corr.correlation.toFixed(2)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* 최적화 제안 */}
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/30">
        <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaExclamationTriangle className="text-yellow-400" />
          다양성 최적화 제안
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-purple-400 font-semibold mb-3">권장 조정</h5>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-400 mt-1" />
                <span>LSTM과 GRU의 가중치 중 하나 감소 (상관관계 0.92)</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-400 mt-1" />
                <span>Transformer 가중치 증가 (독립성 높음)</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-400 mt-1" />
                <span>CNN 모델 활용도 증가 권장</span>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="text-pink-400 font-semibold mb-3">예상 효과</h5>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                <span>다양성 지수 8.2 → 9.1 향상</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                <span>예측 안정성 12% 증가</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                <span>극단 상황 대응력 향상</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}