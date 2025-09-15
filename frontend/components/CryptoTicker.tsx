'use client'

import { motion } from 'framer-motion';
import { FaBitcoin } from 'react-icons/fa';
import { SiEthereum, SiBinance } from 'react-icons/si';
import { useBinanceWebSocket } from '@/hooks/useBinanceWebSocket';
import { useEffect, useState } from 'react';
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { config } from '@/lib/config'

const cryptoIcons: Record<string, any> = {
  BTC: FaBitcoin,
  ETH: SiEthereum,
  BNB: SiBinance,
};

export default function CryptoTicker() {
  const { prices, isConnected, error } = useBinanceWebSocket();
  const [prevPrices, setPrevPrices] = useState<Map<string, number>>(new Map());
  const [usdToKrw, setUsdToKrw] = useState(1350); // 달러 환율

  // 환율 업데이트 (실제로는 API에서 가져와야 함)
  useEffect(() => {
    // 예시 환율 (실제로는 환율 API 사용 필요)
    setUsdToKrw(1350);
  }, []);

  // 가격 변동 감지
  useEffect(() => {
    const newPrevPrices = new Map();
    prices.forEach(crypto => {
      newPrevPrices.set(crypto.symbol, crypto.price);
    });
    setPrevPrices(newPrevPrices);
  }, [prices]);

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    } else if (price >= 1) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`;
    }
  };

  const formatKrwPrice = (price: number) => {
    const krwPrice = price * usdToKrw;
    if (krwPrice >= 1000000) {
      return `₩${(krwPrice / 1000000).toFixed(1)}백만`;
    } else if (krwPrice >= 10000) {
      return `₩${(krwPrice / 10000).toFixed(1)}만`;
    } else {
      return `₩${krwPrice.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}`;
    }
  };

  const formatVolume = (volume: number | string | undefined) => {
    // volume이 없거나 유효하지 않은 경우
    if (!volume) return '0';

    // 숫자로 변환
    const numVolume = typeof volume === 'string' ? parseFloat(volume) : Number(volume);

    // NaN 체크
    if (isNaN(numVolume)) return '0';

    if (numVolume >= 1e9) {
      return `${(numVolume / 1e9).toFixed(1)}B`;
    } else if (numVolume >= 1e6) {
      return `${(numVolume / 1e6).toFixed(1)}M`;
    } else if (numVolume >= 1e3) {
      return `${(numVolume / 1e3).toFixed(1)}K`;
    }
    return numVolume.toFixed(0);
  };

  const getPriceAnimation = (symbol: string, currentPrice: number) => {
    const prevPrice = prevPrices.get(symbol) || currentPrice;
    if (currentPrice > prevPrice) return 'animate-flash-green';
    if (currentPrice < prevPrice) return 'animate-flash-red';
    return '';
  };

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: config.decimals.value5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            실시간 암호화폐 시장
          </h2>
          <div className="flex items-center justify-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-gray-400">
              {isConnected ? 'Live' : error || 'Connecting...'}
            </span>
          </div>
        </motion.div>

        {/* 실시간 환율 정보 추가 */}
        <div className="mb-6 flex flex-wrap justify-center gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="bg-gray-900/50 backdrop-blur rounded-lg px-4 py-2 border border-purple-500/30 flex items-center gap-2"
          >
            <span className="text-purple-400 text-sm">USD/KRW</span>
            <span className="font-bold text-lg">₩{usdToKrw.toLocaleString()}</span>
            <span className="text-xs text-green-400">+0.3%</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
            className="bg-gray-900/50 backdrop-blur rounded-lg px-4 py-2 border border-gray-700 flex items-center gap-2"
          >
            <span className="text-gray-400 text-sm">EUR/USD</span>
            <span className="font-bold">$1.0821</span>
            <span className="text-xs text-red-400">-0.2%</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/50 backdrop-blur rounded-lg px-4 py-2 border border-gray-700 flex items-center gap-2"
          >
            <span className="text-gray-400 text-sm">USD/JPY</span>
            <span className="font-bold">¥148.23</span>
            <span className="text-xs text-green-400">+0.5%</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="bg-gray-900/50 backdrop-blur rounded-lg px-4 py-2 border border-gray-700 flex items-center gap-2"
          >
            <span className="text-gray-400 text-sm">GBP/USD</span>
            <span className="font-bold">$1.2634</span>
            <span className="text-xs text-red-400">-0.1%</span>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {prices.map((crypto, index) => {
            const Icon = cryptoIcons[crypto.symbol] || FaBitcoin;
            const isPositive = crypto.change >= 0;
            const priceAnimation = getPriceAnimation(crypto.symbol, crypto.price);

            return (
              <motion.div
                key={crypto.symbol}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: config.decimals.value5, delay: index * config.decimals.value05 }}
                whileHover={{ scale: 1.02 }}
                className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-4 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="text-2xl text-purple-400" />
                    <span className="font-bold text-lg">{crypto.symbol}</span>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {isPositive ? '+' : ''}{safePercent(crypto.change)}%
                  </div>
                </div>

                <div className={`text-2xl font-bold ${priceAnimation}`}>
                  {formatPrice(crypto.price)}
                </div>

                <div className="text-sm text-gray-400 mb-3">
                  {formatKrwPrice(crypto.price)}
                </div>

                <div className="flex items-center justify-between text-xs border-t border-gray-800 pt-2">
                  <span className="text-gray-500">24시간 거래량</span>
                  <span className="text-gray-300 font-semibold">${formatVolume(crypto.volume)}</span>
                </div>

                {/* 미니 스파크라인 효과 */}
                <div className="mt-3 h-8 flex items-end gap-0.5">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-t ${
                        isPositive ? 'bg-green-500/30' : 'bg-red-500/30'
                      }`}
                      style={{
                        height: `${(((Date.now() % 1000) / 1000) * 100)}%`,
                        opacity: 0.3 + (i / 20) * 0.7
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes flash-green {
          0% { background-color: transparent; }
          50% { background-color: rgba(34, 197, 94, 0.2); }
          100% { background-color: transparent; }
        }

        @keyframes flash-red {
          0% { background-color: transparent; }
          50% { background-color: rgba(239, 68, 68, 0.2); }
          100% { background-color: transparent; }
        }

        .animate-flash-green {
          animation: flash-green 0.5s ease-in-out;
        }

        .animate-flash-red {
          animation: flash-red 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}