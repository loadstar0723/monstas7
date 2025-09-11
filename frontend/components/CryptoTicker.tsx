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

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) {
      return `${(volume / 1e9).toFixed(2)}B`;
    } else if (volume >= 1e6) {
      return `${(volume / 1e6).toFixed(2)}M`;
    } else if (volume >= 1e3) {
      return `${(volume / 1e3).toFixed(2)}K`;
    }
    return safeFixed(volume, 0);
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

                <div className={`text-2xl font-bold mb-2 ${priceAnimation}`}>
                  {formatPrice(crypto.price)}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>24h Vol</span>
                  <span className="text-gray-400">{crypto.volume}</span>
                </div>

                {/* 미니 스파크라인 효과 */}
                <div className="mt-3 h-8 flex items-end gap-config.decimals.value5">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-t ${
                        isPositive ? 'bg-green-500/30' : 'bg-red-500/30'
                      }`}
                      style={{
                        height: `${Math.random() * 100}%`,
                        opacity: config.decimals.value3 + (i / 20) * config.decimals.value7
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
          ${config.percentage.value0} { background-color: transparent; }
          ${config.percentage.value50} { background-color: rgba(34, 197, 94, config.decimals.value2); }
          ${config.percentage.value100} { background-color: transparent; }
        }

        @keyframes flash-red {
          ${config.percentage.value0} { background-color: transparent; }
          ${config.percentage.value50} { background-color: rgba(239, 68, 68, config.decimals.value2); }
          ${config.percentage.value100} { background-color: transparent; }
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