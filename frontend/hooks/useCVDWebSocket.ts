import { useEffect, useState, useRef, useCallback } from 'react';

export interface CVDData {
  time: string;
  price: number;
  buyVolume: number;
  sellVolume: number;
  delta: number;
  cvd: number;
  deltaPercent: string;
}

export interface SymbolStats {
  currentPrice: number;
  priceChange: number;
  volume24h: number;
}

const MAX_DATA_POINTS = 100; // Keep last 100 data points

export function useCVDWebSocket(symbol: string) {
  const [cvdData, setCvdData] = useState<CVDData[]>([]);
  const [stats, setStats] = useState<SymbolStats>({
    currentPrice: 0,
    priceChange: 0,
    volume24h: 0
  });
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const cumulativeCVD = useRef<number>(0);
  const dataBuffer = useRef<CVDData[]>([]);
  const aggregationInterval = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const priceHistory = useRef<number[]>([]);
  
  // Track volume over time windows
  const volumeWindow = useRef<{ buy: number; sell: number; timestamp: number }[]>([]);

  // Get 24hr ticker stats from REST API
  const fetchTickerStats = useCallback(async () => {
    try {
      const response = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=' + symbol);
      if (response.ok) {
        const data = await response.json();
        const currentPrice = parseFloat(data.lastPrice);
        priceHistory.current = [currentPrice]; // Initialize price history
        
        setStats({
          currentPrice,
          priceChange: parseFloat(data.priceChangePercent),
          volume24h: parseFloat(data.quoteVolume)
        });
      }
    } catch (err) {
      console.error('Error fetching ticker stats:', err);
    }
  }, [symbol]);

  // Process aggregated trades over time window
  const processAggregatedData = useCallback(() => {
    if (volumeWindow.current.length === 0) return;

    const now = Date.now();
    const windowSize = 5000; // 5 second window
    const cutoff = now - windowSize;

    // Filter out old data
    volumeWindow.current = volumeWindow.current.filter(v => v.timestamp > cutoff);

    if (volumeWindow.current.length === 0) return;

    // Aggregate volume over the window
    const aggregated = volumeWindow.current.reduce(
      (acc, curr) => ({
        buy: acc.buy + curr.buy,
        sell: acc.sell + curr.sell
      }),
      { buy: 0, sell: 0 }
    );

    const delta = aggregated.buy - aggregated.sell;
    cumulativeCVD.current += delta;

    // Get latest price from price history
    const currentPrice = priceHistory.current[priceHistory.current.length - 1] || 0;

    const newDataPoint: CVDData = {
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      price: currentPrice,
      buyVolume: Math.round(aggregated.buy),
      sellVolume: Math.round(aggregated.sell),
      delta: Math.round(delta),
      cvd: Math.round(cumulativeCVD.current),
      deltaPercent: aggregated.buy + aggregated.sell > 0 
        ? ((aggregated.buy - aggregated.sell) / (aggregated.buy + aggregated.sell) * 100).toFixed(2)
        : '0.00'
    };

    setCvdData(prev => {
      const updated = [...prev, newDataPoint];
      return updated.slice(-MAX_DATA_POINTS); // Keep only last MAX_DATA_POINTS
    });

    // Update current price in stats
    setStats(prev => ({
      ...prev,
      currentPrice
    }));
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@aggTrade`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        
        // Fetch initial ticker stats
        fetchTickerStats();
        
        // Start aggregation interval
        if (aggregationInterval.current) {
          clearInterval(aggregationInterval.current);
        }
        aggregationInterval.current = setInterval(processAggregatedData, 1000); // Process every second
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Update price history
          const price = parseFloat(data.p);
          priceHistory.current.push(price);
          if (priceHistory.current.length > 10) {
            priceHistory.current.shift(); // Keep last 10 prices
          }
          
          // Calculate volume based on maker side
          // m = true means the buyer is the maker (sell market order)
          // m = false means the seller is the maker (buy market order)
          const quantity = parseFloat(data.q);
          const quoteQuantity = quantity * price;
          
          volumeWindow.current.push({
            buy: data.m ? 0 : quoteQuantity,
            sell: data.m ? quoteQuantity : 0,
            timestamp: Date.now()
          });
          
        } catch (err) {
          console.error('Error processing aggTrade message:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('CVD WebSocket error:', err);
        setError('WebSocket connection error');
      };

      ws.onclose = () => {
        setIsConnected(false);
        
        // Clear aggregation interval
        if (aggregationInterval.current) {
          clearInterval(aggregationInterval.current);
          aggregationInterval.current = null;
        }
        
        // Only reconnect if this is the current WebSocket
        if (wsRef.current === ws && reconnectAttempts.current < 5) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          `);
          
          reconnectTimeout.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectAttempts.current >= 5) {
          setError('Failed to connect after 5 attempts');
        }
      };
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setError('Failed to create WebSocket connection');
    }
  }, [symbol, fetchTickerStats, processAggregatedData]);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
    
    if (aggregationInterval.current) {
      clearInterval(aggregationInterval.current);
      aggregationInterval.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    // Reset data
    cumulativeCVD.current = 0;
    volumeWindow.current = [];
    priceHistory.current = [];
    dataBuffer.current = [];
  }, []);

  // Reset CVD when symbol changes
  const resetCVD = useCallback(() => {
    setCvdData([]);
    cumulativeCVD.current = 0;
    volumeWindow.current = [];
    priceHistory.current = [];
    dataBuffer.current = [];
    setStats({
      currentPrice: 0,
      priceChange: 0,
      volume24h: 0
    });
  }, []);

  useEffect(() => {
    // Reset data when symbol changes
    setCvdData([]);
    cumulativeCVD.current = 0;
    volumeWindow.current = [];
    priceHistory.current = [];
    dataBuffer.current = [];
    setStats({
      currentPrice: 0,
      priceChange: 0,
      volume24h: 0
    });
    
    // Disconnect existing connection
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
    
    if (aggregationInterval.current) {
      clearInterval(aggregationInterval.current);
      aggregationInterval.current = null;
    }
    
    let eventSource: EventSource | null = null;
    
    // Reset reconnect attempts
    reconnectAttempts.current = 0;
    
    // Connect using EventSource
    const connectToSymbol = () => {
      try {
        // Use API route to proxy WebSocket connection
        eventSource = new EventSource('/api/binance/stream?symbol=' + symbol);
        
        eventSource.onopen = () => {
          setIsConnected(true);
          setError(null);
          reconnectAttempts.current = 0;
          
          // Fetch initial ticker stats
          fetch('/api/binance/ticker?symbol=' + symbol)
            .then(response => response.json())
            .then(data => {
              const currentPrice = parseFloat(data.lastPrice);
              priceHistory.current = [currentPrice];
              
              setStats({
                currentPrice,
                priceChange: parseFloat(data.priceChangePercent),
                volume24h: parseFloat(data.quoteVolume)
              });
            })
            .catch(err => console.error('Error fetching ticker stats:', err));
          
          // Start aggregation interval
          if (aggregationInterval.current) {
            clearInterval(aggregationInterval.current);
          }
          
          aggregationInterval.current = setInterval(() => {
            if (volumeWindow.current.length === 0) return;

            const now = Date.now();
            const windowSize = 5000; // 5 second window
            const cutoff = now - windowSize;

            // Filter out old data
            volumeWindow.current = volumeWindow.current.filter(v => v.timestamp > cutoff);

            if (volumeWindow.current.length === 0) return;

            // Aggregate volume over the window
            const aggregated = volumeWindow.current.reduce(
              (acc, curr) => ({
                buy: acc.buy + curr.buy,
                sell: acc.sell + curr.sell
              }),
              { buy: 0, sell: 0 }
            );

            const delta = aggregated.buy - aggregated.sell;
            cumulativeCVD.current += delta;

            // Get latest price from price history
            const currentPrice = priceHistory.current[priceHistory.current.length - 1] || 0;

            const newDataPoint: CVDData = {
              time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              price: currentPrice,
              buyVolume: Math.round(aggregated.buy),
              sellVolume: Math.round(aggregated.sell),
              delta: Math.round(delta),
              cvd: Math.round(cumulativeCVD.current),
              deltaPercent: aggregated.buy + aggregated.sell > 0 
                ? ((aggregated.buy - aggregated.sell) / (aggregated.buy + aggregated.sell) * 100).toFixed(2)
                : '0.00'
            };

            setCvdData(prev => {
              const updated = [...prev, newDataPoint];
              return updated.slice(-MAX_DATA_POINTS); // Keep only last MAX_DATA_POINTS
            });

            // Update current price in stats
            setStats(prev => ({
              ...prev,
              currentPrice
            }));
          }, 1000); // Process every second
        };
        
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Update price history
            const price = parseFloat(data.p);
            priceHistory.current.push(price);
            if (priceHistory.current.length > 10) {
              priceHistory.current.shift(); // Keep last 10 prices
            }
            
            // Calculate volume based on maker side
            // m = true means the buyer is the maker (sell market order)
            // m = false means the seller is the maker (buy market order)
            const quantity = parseFloat(data.q);
            const quoteQuantity = quantity * price;
            
            volumeWindow.current.push({
              buy: data.m ? 0 : quoteQuantity,
              sell: data.m ? quoteQuantity : 0,
              timestamp: Date.now()
            });
            
          } catch (err) {
            console.error('Error processing aggTrade message:', err);
          }
        };
        
        eventSource.onerror = (err) => {
          console.error('CVD stream error:', err);
          setError('Stream connection error');
          setIsConnected(false);
          
          // Clear aggregation interval
          if (aggregationInterval.current) {
            clearInterval(aggregationInterval.current);
            aggregationInterval.current = null;
          }
          
          // Attempt to reconnect
          if (reconnectAttempts.current < 5) {
            reconnectAttempts.current++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
            
            eventSource?.close();
            reconnectTimeout.current = setTimeout(connectToSymbol, delay);
          } else {
            setError('Failed to connect after 5 attempts');
            eventSource?.close();
          }
        };
      } catch (err) {
        console.error('Error creating EventSource:', err);
        setError('Failed to create stream connection');
      }
    };
    
    // Initial connection
    connectToSymbol();

    return () => {
      // Cleanup on unmount or symbol change
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
      }
      
      if (aggregationInterval.current) {
        clearInterval(aggregationInterval.current);
        aggregationInterval.current = null;
      }
      
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [symbol]); // Only reconnect when symbol changes

  // Periodic stats refresh (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(fetchTickerStats, 30000);
    return () => clearInterval(interval);
  }, [fetchTickerStats]);

  return {
    cvdData,
    stats,
    isConnected,
    error,
    currentCVD: cvdData[cvdData.length - 1]?.cvd || 0,
    currentDelta: cvdData[cvdData.length - 1]?.delta || 0,
    buyPressure: cvdData[cvdData.length - 1]?.buyVolume || 0,
    sellPressure: cvdData[cvdData.length - 1]?.sellVolume || 0
  };
}