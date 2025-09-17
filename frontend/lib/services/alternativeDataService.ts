// 대체 데이터 소스 서비스
// Binance API 차단 시 사용할 대체 API들

import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 30 }); // 30초 캐시

export class AlternativeDataService {
  private cryptocompareApiKey = process.env.NEXT_PUBLIC_CRYPTOCOMPARE_API_KEY || '57f89e8ea43da615e49a75d31d9e64742063d53553dc16bb7b832a8ea359422b';

  // CryptoCompare API를 통한 실시간 가격 조회
  async getPrice(symbol: string): Promise<any> {
    const cacheKey = `price_${symbol}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const baseSymbol = symbol.replace('USDT', '');
      const url = `https://min-api.cryptocompare.com/data/price?fsym=${baseSymbol}&tsyms=USDT&api_key=${this.cryptocompareApiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      const formattedData = {
        symbol: symbol,
        price: data.USDT?.toString() || '0',
        source: 'cryptocompare'
      };

      cache.set(cacheKey, formattedData);
      return formattedData;
    } catch (error) {
      console.error('CryptoCompare API error:', error);
      throw error;
    }
  }

  // CoinGecko API (백업용)
  async getPriceFromCoinGecko(symbol: string): Promise<any> {
    try {
      const coinId = this.getCoinGeckoId(symbol);
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`;

      const response = await fetch(url);
      const data = await response.json();

      return {
        symbol: symbol,
        price: data[coinId]?.usd?.toString() || '0',
        source: 'coingecko'
      };
    } catch (error) {
      console.error('CoinGecko API error:', error);
      throw error;
    }
  }

  // 심볼을 CoinGecko ID로 변환
  private getCoinGeckoId(symbol: string): string {
    const mapping: Record<string, string> = {
      'BTCUSDT': 'bitcoin',
      'ETHUSDT': 'ethereum',
      'BNBUSDT': 'binancecoin',
      'SOLUSDT': 'solana',
      'ADAUSDT': 'cardano',
      'XRPUSDT': 'ripple',
      'DOGEUSDT': 'dogecoin',
      'AVAXUSDT': 'avalanche-2',
      'SHIBUSDT': 'shiba-inu',
      'DOTUSDT': 'polkadot',
      'LINKUSDT': 'chainlink',
      'MATICUSDT': 'matic-network',
      'UNIUSDT': 'uniswap',
      'LTCUSDT': 'litecoin',
      'ATOMUSDT': 'cosmos',
      'NEARUSDT': 'near',
      'APTUSDT': 'aptos',
      'ARBUSDT': 'arbitrum',
      'OPUSDT': 'optimism'
    };

    return mapping[symbol] || 'bitcoin';
  }

  // WebSocket 대체: CryptoCompare WebSocket
  connectWebSocket(symbols: string[], onMessage: (data: any) => void): WebSocket | null {
    try {
      const ws = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${this.cryptocompareApiKey}`);

      ws.onopen = () => {
        console.log('CryptoCompare WebSocket connected');

        // 구독 메시지 전송
        const subs = symbols.map(s => `5~CCCAGG~${s.replace('USDT', '')}~USDT`);
        ws.send(JSON.stringify({
          action: 'SubAdd',
          subs: subs
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.TYPE === '5') { // TRADE 메시지
            onMessage({
              symbol: `${data.FROMSYMBOL}USDT`,
              price: data.PRICE,
              volume: data.VOLUME,
              source: 'cryptocompare'
            });
          }
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('CryptoCompare WebSocket error:', error);
      };

      return ws;
    } catch (error) {
      console.error('WebSocket connection error:', error);
      return null;
    }
  }
}

export const alternativeDataService = new AlternativeDataService();