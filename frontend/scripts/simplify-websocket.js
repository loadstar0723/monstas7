const fs = require('fs');
const path = require('path');

// SmartMoneyUltimate.tsx에서 dataService 관련 코드 제거하고 직접 WebSocket 연결
const filePath = path.join(__dirname, '../app/signals/smart-money/SmartMoneyUltimate.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// dataService import 제거
content = content.replace(/import { dataService } from '@\/lib\/services\/finalDataService'\n/, '');

// connectDataService 함수 내용 수정
const connectFunctionStart = content.indexOf('const connectDataService = async (symbol: string) => {');
const connectFunctionEnd = content.indexOf('// Binance 오더북 데이터 가져오기');

if (connectFunctionStart !== -1 && connectFunctionEnd !== -1) {
  const beforeFunction = content.substring(0, connectFunctionStart);
  const afterFunction = content.substring(connectFunctionEnd);
  
  const newConnectFunction = `const connectDataService = async (symbol: string) => {
    console.log('🔄 스마트머니 데이터 연결 시작:', symbol)
    
    // 초기값 설정
    const initialPrices: Record<string, number> = {
      'BTCUSDT': 98000,
      'ETHUSDT': 3500,
      'BNBUSDT': 700,
      'SOLUSDT': 240,
      'XRPUSDT': 2.4
    }
    
    setCurrentPrice(initialPrices[symbol] || 100)
    setIsConnected(false)
    
    // 24시간 티커 정보 가져오기
    fetch(\`/api/binance/ticker?symbol=\${symbol}\`)
      .then(res => res.json())
      .then(data => {
        if (data.price) {
          setCurrentPrice(data.price)
          setPriceChange24h(data.priceChangePercent || 0)
          setVolume24h(data.volume || 0)
        }
      })
      .catch(err => console.warn('티커 정보 로드 실패:', err))
    
    // 캔들스틱 데이터 가져오기
    fetch(\`/api/binance/klines?symbol=\${symbol}&interval=1h&limit=24\`)
      .then(res => res.json())
      .then(klines => {
        if (Array.isArray(klines)) {
          const chartData = klines.map(k => ({
            time: new Date(k[0]).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            price: parseFloat(k[4]),
            high: parseFloat(k[2]),
            low: parseFloat(k[3]),
            volume: parseFloat(k[5])
          }))
          setPriceHistory(chartData)
        }
      })
      .catch(err => console.warn('캔들 데이터 로드 실패:', err))
    
    // 오더북 데이터 가져오기
    fetch(\`/api/binance/orderbook?symbol=\${symbol}&limit=20\`)
      .then(res => res.json())
      .then(data => {
        if (data.bids && data.asks) {
          setOrderBookData({
            bids: data.bids,
            asks: data.asks,
            spread: data.spread,
            spreadPercent: data.spreadPercent,
            bestBid: data.bestBid,
            bestAsk: data.bestAsk
          })
          
          // 마켓메이커 데이터 생성
          const totalBidVolume = data.bids.reduce((sum: number, bid: any) => sum + bid.total, 0)
          const totalAskVolume = data.asks.reduce((sum: number, ask: any) => sum + ask.total, 0)
          const imbalance = (totalBidVolume - totalAskVolume) / (totalBidVolume + totalAskVolume)
          
          const makers: MarketMaker[] = [
            {
              name: 'Binance MM',
              symbol: symbol.replace('USDT', ''),
              bidVolume: totalBidVolume,
              askVolume: totalAskVolume,
              spread: data.spreadPercent,
              depth: data.bids.length + data.asks.length,
              activity: Math.abs(imbalance) < (volume24h / currentPrice / 100000) ? 'active' : 'moderate',
              lastUpdate: new Date().toLocaleTimeString('ko-KR')
            }
          ]
          
          setMarketMakers(makers)
        }
      })
      .catch(err => console.warn('오더북 데이터 로드 실패:', err))
    
    // 과거 거래 내역 가져오기
    fetch(\`/api/binance/trades?symbol=\${symbol}&limit=500\`)
      .then(res => res.json())
      .then(trades => {
        if (Array.isArray(trades)) {
          const now = Date.now()
          const dayAgo = now - (24 * 60 * 60 * 1000)
          
          const historicalFlows = trades
            .filter((trade: any) => trade.T > dayAgo)
            .map((trade: any) => {
              const price = parseFloat(trade.p)
              const quantity = parseFloat(trade.q)
              const value = price * quantity
              
              if (value > 10000) {
                return {
                  id: \`hist-\${trade.a}\`,
                  institution: getInstitutionLabel(value, trade.a.toString()),
                  symbol: symbol.replace('USDT', ''),
                  type: trade.m ? 'distribution' : 'accumulation',
                  amount: quantity,
                  price,
                  value,
                  time: new Date(trade.T).toLocaleTimeString('ko-KR'),
                  timestamp: trade.T,
                  confidence: Math.min(95, Math.max(30, 
                    50 + (value / 100000) * 2 + (Math.abs(priceChange24h) > 5 ? 10 : 0)
                  )),
                  source: value > 1000000 ? 'otc' : value > 500000 ? 'custody' : 'exchange',
                  impact: value > 1000000 ? 'high' : value > 500000 ? 'medium' : 'low'
                }
              }
              return null
            })
            .filter(Boolean)
          
          setInstitutionalFlows(historicalFlows)
        }
      })
      .catch(err => console.warn('거래 내역 로드 실패:', err))
    
    // WebSocket 연결 (브라우저에서만)
    if (typeof window !== 'undefined') {
      // 기존 연결 종료
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      
      // 연결 지연 (빠른 전환 방지)
      clearTimeout(connectionDelayRef.current)
      connectionDelayRef.current = setTimeout(() => {
        const ws = new WebSocket(\`wss://stream.binance.com:9443/ws/\${symbol.toLowerCase()}@aggTrade\`)
        
        ws.onopen = () => {
          console.log('✅ WebSocket 연결 성공:', symbol)
          setIsConnected(true)
        }
        
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data)
          const price = parseFloat(data.p)
          const quantity = parseFloat(data.q)
          const value = price * quantity
          
          // 현재 가격 업데이트
          setCurrentPrice(price)
          
          // 대규모 거래만 처리
          const threshold = symbol === 'BTCUSDT' ? 10000 :
                           symbol === 'ETHUSDT' ? 5000 :
                           symbol === 'SOLUSDT' ? 2000 :
                           symbol === 'BNBUSDT' ? 3000 :
                           1000
          
          if (value > threshold) {
            const institution = getInstitutionLabel(value, data.a?.toString())
            const flow: InstitutionalFlow = {
              id: \`\${Date.now()}-\${value}\`,
              institution,
              symbol: symbol.replace('USDT', ''),
              type: data.m ? 'distribution' : 'accumulation',
              amount: quantity,
              price,
              value,
              time: new Date(data.T).toLocaleTimeString('ko-KR'),
              timestamp: data.T,
              confidence: value > 500000 ? 90 : value > 100000 ? 75 : 60,
              source: value > 1000000 ? 'otc' : value > 500000 ? 'custody' : 'exchange',
              impact: value > 1000000 ? 'high' : value > 500000 ? 'medium' : 'low'
            }
            
            setInstitutionalFlows(prev => [flow, ...prev].slice(0, 100))
            setFlowsBySymbol(prev => ({
              ...prev,
              [symbol]: [flow, ...(prev[symbol] || [])].slice(0, 50)
            }))
            
            // 대규모 거래 알림
            if (value > 1000000) {
              const notificationService = NotificationService.getInstance()
              notificationService.showWhaleAlert(
                symbol.replace('USDT', ''),
                value,
                flow.type === 'accumulation' ? 'buy' : 'sell'
              )
              audioService.playNotification()
            }
          }
        }
        
        ws.onerror = (error) => {
          console.warn('WebSocket 에러:', error)
          setIsConnected(false)
        }
        
        ws.onclose = () => {
          console.log('WebSocket 연결 종료')
          setIsConnected(false)
          wsRef.current = null
        }
        
        wsRef.current = ws
      }, 500)
    }
  }

  `;
  
  content = beforeFunction + newConnectFunction + afterFunction;
}

// 파일 저장
fs.writeFileSync(filePath, content);
console.log('✅ SmartMoneyUltimate.tsx WebSocket 연결 간소화 완료');