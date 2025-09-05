import { useEffect, useState } from 'react';
import WebSocketManager from '@/lib/websocketManager';

// CryptoPrice type import
import type { CryptoPrice } from '@/lib/websocketManager';
export type { CryptoPrice };

export function useBinanceWebSocket() {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const wsManager = WebSocketManager.getInstance();
    
    const handleUpdate = (data: { prices: CryptoPrice[], isConnected: boolean, error: string | null }) => {
      setPrices(data.prices);
      setIsConnected(data.isConnected);
      setError(data.error);
    };

    // 구독
    wsManager.subscribe(handleUpdate);

    // Cleanup - 언마운트 시 구독 해제만 하고 연결은 유지
    return () => {
      wsManager.unsubscribe(handleUpdate);
    };
  }, []);

  return { prices, isConnected, error };
}