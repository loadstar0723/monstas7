import { useEffect, useState } from 'react';
import { getBinanceWebSocket } from '@/lib/binanceWebSocket';
import { formatVolume } from '@/lib/formatters';

export interface CryptoPrice {
  symbol: string;
  price: number;
  change: number;
  volume: string;
  high?: number;
  low?: number;
}

export function useBinanceWebSocket() {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ws = getBinanceWebSocket();
    
    if (!ws) {
      setError('WebSocket not initialized');
      return;
    }

    // WebSocket이 연결되면 상태 업데이트
    setIsConnected(true);

    // 주요 코인들 구독
    const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT'];
    const priceData: Map<string, CryptoPrice> = new Map();

    symbols.forEach(symbol => {
      ws.subscribe(symbol, (data) => {
        priceData.set(symbol, {
          symbol: data.symbol || symbol,
          price: data.price || 0,
          change: data.change || 0,
          volume: formatVolume(data.volume || 0),
          high: data.high || 0,
          low: data.low || 0
        });
        
        // 배열로 변환하여 상태 업데이트
        setPrices(Array.from(priceData.values()));
      });
    });

    // Cleanup - 언마운트 시 구독 해제
    return () => {
      symbols.forEach(symbol => ws.unsubscribe(symbol));
    };
  }, []);

  return { prices, isConnected, error };
}