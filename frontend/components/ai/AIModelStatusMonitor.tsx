'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { goBackendService } from '@/lib/services/goBackendService';
import {
  FaBrain, FaRobot, FaChartLine, FaNetworkWired,
  FaCheckCircle, FaExclamationTriangle, FaCog
} from 'react-icons/fa';
import { AiOutlineThunderbolt } from 'react-icons/ai';
import { MdPattern, MdMemory, MdSpeed } from 'react-icons/md';

interface ModelStatus {
  name: string;
  loaded: boolean;
  version: string;
  accuracy: number;
  last_update: string;
}

const modelIcons: Record<string, React.ReactNode> = {
  'technical_analysis': <FaChartLine className="w-5 h-5" />,
  'neural_network': <FaBrain className="w-5 h-5" />,
  'lstm': <FaNetworkWired className="w-5 h-5" />,
  'gru': <AiOutlineThunderbolt className="w-5 h-5" />,
  'xgboost': <FaRobot className="w-5 h-5" />,
  'arima': <FaChartLine className="w-5 h-5" />,
  'lightgbm': <MdSpeed className="w-5 h-5" />,
  'random_forest': <FaCog className="w-5 h-5" />,
  'ensemble': <FaNetworkWired className="w-5 h-5" />,
  'pattern_recognition': <MdPattern className="w-5 h-5" />
};

const modelColors: Record<string, string> = {
  'technical_analysis': 'from-blue-500 to-cyan-500',
  'neural_network': 'from-purple-500 to-pink-500',
  'lstm': 'from-green-500 to-emerald-500',
  'gru': 'from-yellow-500 to-orange-500',
  'xgboost': 'from-red-500 to-rose-500',
  'arima': 'from-indigo-500 to-purple-500',
  'lightgbm': 'from-teal-500 to-cyan-500',
  'random_forest': 'from-emerald-500 to-green-500',
  'ensemble': 'from-violet-500 to-purple-500',
  'pattern_recognition': 'from-pink-500 to-rose-500'
};

export default function AIModelStatusMonitor() {
  const [models, setModels] = useState<Record<string, ModelStatus>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    fetchModelStatus();
    const interval = setInterval(fetchModelStatus, 5000); // 5초마다 업데이트
    return () => clearInterval(interval);
  }, []);

  const fetchModelStatus = async () => {
    try {
      const status = await goBackendService.system.getStatus();

      if (status && status.models) {
        setModels(status.models);
        setIsConnected(true);
        setError(null);
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error('모델 상태 가져오기 실패:', err);
      setIsConnected(false);

      // 에러 시 기본 모델 표시 (Pattern Recognition 포함)
      const defaultModels: Record<string, ModelStatus> = {
        'technical_analysis': {
          name: 'Technical Analysis',
          loaded: false,
          version: '1.0.0',
          accuracy: 0,
          last_update: new Date().toISOString()
        },
        'neural_network': {
          name: 'Neural Network',
          loaded: false,
          version: '1.0.0',
          accuracy: 0,
          last_update: new Date().toISOString()
        },
        'lstm': {
          name: 'LSTM',
          loaded: false,
          version: '1.0.0',
          accuracy: 0,
          last_update: new Date().toISOString()
        },
        'gru': {
          name: 'GRU',
          loaded: false,
          version: '1.0.0',
          accuracy: 0,
          last_update: new Date().toISOString()
        },
        'xgboost': {
          name: 'XGBoost',
          loaded: false,
          version: '1.0.0',
          accuracy: 0,
          last_update: new Date().toISOString()
        },
        'arima': {
          name: 'ARIMA',
          loaded: false,
          version: '1.0.0',
          accuracy: 0,
          last_update: new Date().toISOString()
        },
        'lightgbm': {
          name: 'LightGBM',
          loaded: false,
          version: '1.0.0',
          accuracy: 0,
          last_update: new Date().toISOString()
        },
        'random_forest': {
          name: 'Random Forest',
          loaded: false,
          version: '1.0.0',
          accuracy: 0,
          last_update: new Date().toISOString()
        },
        'ensemble': {
          name: 'Ensemble',
          loaded: false,
          version: '1.0.0',
          accuracy: 0,
          last_update: new Date().toISOString()
        },
        'pattern_recognition': {
          name: 'Pattern Recognition',
          loaded: false,
          version: '1.0.0',
          accuracy: 0,
          last_update: new Date().toISOString()
        }
      };
      setModels(defaultModels);
      setError('Go 백엔드 연결 실패');
    } finally {
      setLoading(false);
    }
  };

  const getModelDisplayName = (key: string): string => {
    const nameMap: Record<string, string> = {
      'technical_analysis': '기술적 분석',
      'neural_network': '신경망',
      'lstm': 'LSTM',
      'gru': 'GRU',
      'xgboost': 'XGBoost',
      'arima': 'ARIMA',
      'lightgbm': 'LightGBM',
      'random_forest': '랜덤 포레스트',
      'ensemble': '앙상블',
      'pattern_recognition': '패턴 인식'
    };
    return nameMap[key] || key;
  };

  const totalModels = Object.keys(models).length;
  const loadedModels = Object.values(models).filter(m => m.loaded).length;
  const avgAccuracy = totalModels > 0
    ? Object.values(models).reduce((sum, m) => sum + m.accuracy, 0) / totalModels
    : 0;

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-48"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-700/50 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <FaBrain className="text-purple-400" />
            AI 모델 상태 모니터
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            실시간 모델 성능 및 상태 추적
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className={`text-sm font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? 'Go 엔진 연결됨' : 'Go 엔진 오프라인'}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            마지막 업데이트: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* 전체 통계 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">전체 모델</p>
          <p className="text-2xl font-bold text-white">{totalModels}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">활성 모델</p>
          <p className="text-2xl font-bold text-green-400">{loadedModels}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">평균 정확도</p>
          <p className="text-2xl font-bold text-purple-400">{avgAccuracy.toFixed(1)}%</p>
        </div>
      </div>

      {/* 개별 모델 상태 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <AnimatePresence>
          {Object.entries(models).map(([key, model], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className={`relative overflow-hidden rounded-lg border ${
                model.loaded
                  ? 'bg-gradient-to-br ' + modelColors[key] + ' bg-opacity-10 border-gray-700'
                  : 'bg-gray-800/50 border-gray-700/50'
              }`}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white">
                    {modelIcons[key] || <FaCog className="w-5 h-5" />}
                  </div>
                  {model.loaded ? (
                    <FaCheckCircle className="text-green-400 w-4 h-4" />
                  ) : (
                    <FaExclamationTriangle className="text-yellow-500 w-4 h-4" />
                  )}
                </div>

                <h3 className="text-sm font-semibold text-white mb-1">
                  {getModelDisplayName(key)}
                </h3>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">정확도</span>
                    <span className={`text-xs font-bold ${
                      model.accuracy >= 85 ? 'text-green-400' :
                      model.accuracy >= 75 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {model.accuracy.toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">버전</span>
                    <span className="text-xs text-gray-300">{model.version}</span>
                  </div>

                  <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
                    <div
                      className={`h-1 rounded-full transition-all ${
                        model.loaded ? 'bg-gradient-to-r ' + modelColors[key] : 'bg-gray-600'
                      }`}
                      style={{ width: `${model.accuracy}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 특별 표시: Pattern Recognition */}
              {key === 'pattern_recognition' && (
                <div className="absolute top-0 right-0 bg-pink-500 text-white text-xs px-2 py-1 rounded-bl">
                  NEW
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mt-4 p-4 bg-red-900/20 border border-red-700 rounded-lg">
          <p className="text-red-400 text-sm flex items-center gap-2">
            <FaExclamationTriangle />
            {error}
          </p>
        </div>
      )}
    </div>
  );
}