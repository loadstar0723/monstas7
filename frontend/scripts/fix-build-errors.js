const fs = require('fs');
const path = require('path');

// 빌드 에러 수정 스크립트
const fixes = [
  {
    file: 'frontend/app/microstructure/footprint/FootprintChartModule.tsx',
    fix: (content) => {
      // 파일이 중간에 끊긴 부분 수정 - WebSocket 연결 로직 완성
      if (!content.includes('export default function FootprintChartModule')) {
        return content; // 이미 수정됨
      }
      
      // 끊긴 부분부터 나머지 코드 추가
      const incompleteCode = `      console.log(\`[WebSocket] 연결 시도: \${wsUrl}\`)`;
      
      if (content.endsWith(incompleteCode)) {
        const completionCode = `
      
      wsRef.current = new WebSocket(wsUrl)
      
      wsRef.current.onopen = () => {
        console.log('[WebSocket] 연결 성공')
        setIsConnected(true)
        reconnectAttemptsRef.current = 0
      }
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          processTradeData(data)
        } catch (error) {
          console.error('[WebSocket] 메시지 처리 오류:', error)
        }
      }
      
      wsRef.current.onerror = (error) => {
        console.error('[WebSocket] 오류:', error)
        setIsConnected(false)
      }
      
      wsRef.current.onclose = () => {
        console.log('[WebSocket] 연결 종료')
        setIsConnected(false)
        
        // 재연결 시도
        if (reconnectAttemptsRef.current < 5) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++
            connectWebSocket()
          }, 5000)
        } else {
          // 재연결 실패 시 시뮬레이션 모드
          startSimulationMode()
        }
      }
    } catch (error) {
      console.error('[WebSocket] 연결 생성 실패:', error)
      setIsConnected(false)
      startSimulationMode()
    }
  }, [selectedSymbol, processTradeData, startSimulationMode])

  // 초기 연결
  useEffect(() => {
    if (!isSimulationMode) {
      connectSSE()
    }
    
    return () => {
      if (sseRef.current) {
        sseRef.current.close()
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current)
      }
    }
  }, [selectedSymbol, isSimulationMode, connectSSE])
  
  // 시뮬레이션 모드 토글
  useEffect(() => {
    if (isSimulationMode) {
      startSimulationMode()
    } else {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current)
      }
      connectSSE()
    }
  }, [isSimulationMode, startSimulationMode, connectSSE])
  
  // 초기 데이터 로드
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true)
      try {
        // 초기 가격 데이터 로드
        const priceData = await fetchInitialPrice(selectedSymbol)
        if (priceData) {
          setMarketMetrics(prev => ({
            ...prev,
            price: priceData.price,
            change24h: priceData.change24h,
            volume24h: priceData.volume24h
          }))
        }
        
        // 샘플 풋프린트 데이터 생성 (초기 표시용)
        const sampleData = generateSampleFootprintData(selectedSymbol)
        setFootprintData(sampleData)
        
        // 샘플 마켓 프로파일 생성
        const sampleProfile = generateSampleMarketProfile(priceData?.price || 0)
        setMarketProfile(sampleProfile)
      } catch (error) {
        console.error('초기 데이터 로드 실패:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadInitialData()
  }, [selectedSymbol])
  
  // 풀스크린 토글
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          📊 풋프린트 차트 분석
        </h1>
        
        {/* 심볼 선택 */}
        <div className="mb-6 flex justify-center gap-2 flex-wrap">
          {TRACKED_SYMBOLS.map(s => (
            <button
              key={s.symbol}
              onClick={() => setSelectedSymbol(s.symbol)}
              className={\`px-4 py-2 rounded-lg transition-all \${
                selectedSymbol === s.symbol
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }\`}
            >
              <span style={{ color: s.color }}>{s.name}</span>
            </button>
          ))}
        </div>
        
        {/* 컨트롤 패널 */}
        <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setIsSimulationMode(!isSimulationMode)}
              className={\`px-4 py-2 rounded-lg transition-all \${
                isSimulationMode
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }\`}
            >
              {isSimulationMode ? '🎮 시뮬레이션' : '📡 실시간'}
            </button>
            <button
              onClick={toggleFullscreen}
              className="px-4 py-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700"
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <span className={\`px-3 py-1 rounded-full text-sm \${
              isConnected ? 'bg-green-600' : 'bg-red-600'
            } text-white\`}>
              {isConnected ? '● 연결됨' : '○ 연결 끊김'}
            </span>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300"
            >
              <option value="1m">1분</option>
              <option value="5m">5분</option>
              <option value="15m">15분</option>
              <option value="1h">1시간</option>
            </select>
          </div>
        </div>
        
        {/* 메인 콘텐츠 */}
        <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm">
          {isLoading ? (
            <div className="text-center py-12">
              <FaSync className="animate-spin text-4xl text-purple-400 mx-auto mb-4" />
              <p className="text-gray-400">데이터 로딩 중...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 시장 메트릭 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">현재가</p>
                  <p className="text-2xl font-bold text-white">
                    ${safePrice(marketMetrics.price)}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">24시간 변동</p>
                  <p className={\`text-2xl font-bold \${
                    marketMetrics.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }\`}>
                    {safePercent(marketMetrics.change24h)}%
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">24시간 거래량</p>
                  <p className="text-2xl font-bold text-white">
                    ${safeMillion(marketMetrics.volume24h)}M
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">오더플로우</p>
                  <p className={\`text-2xl font-bold \${
                    marketMetrics.orderFlowSentiment === 'bullish' ? 'text-green-400' :
                    marketMetrics.orderFlowSentiment === 'bearish' ? 'text-red-400' :
                    'text-yellow-400'
                  }\`}>
                    {marketMetrics.orderFlowSentiment === 'bullish' ? '🔥 강세' :
                     marketMetrics.orderFlowSentiment === 'bearish' ? '❄️ 약세' :
                     '⚖️ 중립'}
                  </p>
                </div>
              </div>
              
              {/* 섹션 탭 */}
              <div className="flex gap-2 border-b border-gray-700">
                {['overview', 'footprint', 'delta', 'profile', 'heatmap', 'orderflow', 'guide'].map(section => (
                  <button
                    key={section}
                    onClick={() => setActiveSection(section)}
                    className={\`px-4 py-2 transition-all \${
                      activeSection === section
                        ? 'border-b-2 border-purple-400 text-purple-400'
                        : 'text-gray-400 hover:text-white'
                    }\`}
                  >
                    {section === 'overview' && '📊 개요'}
                    {section === 'footprint' && '👣 풋프린트'}
                    {section === 'delta' && '🔢 델타'}
                    {section === 'profile' && '📈 프로파일'}
                    {section === 'heatmap' && '🔥 히트맵'}
                    {section === 'orderflow' && '💹 오더플로우'}
                    {section === 'guide' && '📚 가이드'}
                  </button>
                ))}
              </div>
              
              {/* 콘텐츠 영역 */}
              <div className="min-h-[400px]">
                {activeSection === 'overview' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white mb-4">시장 구조 개요</h3>
                    <p className="text-gray-400">
                      풋프린트 차트는 가격 레벨별 거래량과 매수/매도 압력을 시각화하여
                      시장 구조를 명확하게 보여줍니다.
                    </p>
                    
                    {/* 가격 추이 차트 */}
                    <div className="bg-gray-800 rounded-lg p-4">
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={priceHistory}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="time" stroke="#9CA3AF" />
                          <YAxis stroke="#9CA3AF" />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                            labelStyle={{ color: '#9CA3AF' }}
                          />
                          <Line
                            type="monotone"
                            dataKey="close"
                            stroke="#8B5CF6"
                            strokeWidth={2}
                            dot={false}
                          />
                          <Area
                            type="monotone"
                            dataKey="volume"
                            stroke="#10B981"
                            fill="#10B981"
                            fillOpacity={0.2}
                            yAxisId="volume"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
                
                {activeSection === 'footprint' && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">풋프린트 차트</h3>
                    <p className="text-gray-400 mb-4">
                      각 가격 레벨에서의 매수/매도 거래량을 실시간으로 표시합니다.
                    </p>
                    {/* FootprintChart 컴포넌트 위치 */}
                    <div className="bg-gray-800 rounded-lg p-4 h-[500px] flex items-center justify-center">
                      <p className="text-gray-500">풋프린트 차트 로딩 중...</p>
                    </div>
                  </div>
                )}
                
                {activeSection === 'guide' && (
                  <FootprintGuide />
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* 종합 분석 */}
        <ComprehensiveAnalysis
          symbol={selectedSymbol.replace('USDT', '')}
          price={marketMetrics.price}
          change24h={marketMetrics.change24h}
          volume={marketMetrics.volume24h}
          fearGreedIndex={65}
          dominance={45}
          onChainData={{
            whaleActivity: marketMetrics.whaleActivity,
            exchangeInflow: marketMetrics.institutionalFlow,
            exchangeOutflow: marketMetrics.retailFlow
          }}
        />
      </div>
    </div>
  )
}`;
        return content + completionCode;
      }
      return content;
    }
  },
  {
    file: 'frontend/app/signals/arbitrage/components/ExchangePriceMatrix.tsx',
    fix: (content) => {
      // 107번 라인에 쉼표 추가
      return content.replace(
        /change24h: Math\.sin\(Date\.now\(\) \/ 86400000 \+ exchange\.name\.charCodeAt\(0\)\) \* 8\s*lastUpdate:/g,
        'change24h: Math.sin(Date.now() / 86400000 + exchange.name.charCodeAt(0)) * 8,\n        lastUpdate:'
      );
    }
  },
  {
    file: 'frontend/app/signals/dex-flow/DexFlowUltimate.tsx',
    fix: (content) => {
      // 164번 라인 WebSocket 코드 수정
      return content.replace(
        /wsRef\.current = \/\* WebSocket replaced with optimized service \*\/\}@ticker`\)/g,
        `wsRef.current = new WebSocket(\`wss://stream.binance.com:9443/ws/\${symbol.toLowerCase()}@ticker\`)`
      );
    }
  },
  {
    file: 'frontend/app/signals/funding-rate/FundingRateUltimate.tsx',
    fix: (content) => {
      // 88번 라인 부근 확인 - 파일 끝에 닫는 중괄호가 없는 경우
      if (!content.trim().endsWith('}')) {
        // WebSocket 연결 코드 완성
        const completion = `
    
    wsRef.current = new WebSocket(\`wss://fstream.binance.com/ws/\${streamName}\`)
    
    wsRef.current.onopen = () => {
      console.log('WebSocket connected for funding rate:', symbol)
    }
    
    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.e === 'markPriceUpdate') {
          setFundingData(prev => {
            if (!prev) return null
            return {
              ...prev,
              current: {
                ...prev.current,
                fundingRate: data.r || prev.current.fundingRate,
                markPrice: parseFloat(data.p),
                indexPrice: parseFloat(data.i),
                nextFundingTime: data.T,
                countdown: formatCountdown(data.T - Date.now()),
                countdownMs: data.T - Date.now()
              }
            }
          })
        }
      } catch (error) {
        console.error('WebSocket message error:', error)
      }
    }
    
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
    
    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected')
      setTimeout(() => connectWebSocket(symbol), 5000)
    }
  }, [])
  
  // 펀딩 히스토리 로드
  const loadFundingHistory = useCallback(async (symbol: string) => {
    try {
      const response = await fetch(\`/api/binance/fundingRate?symbol=\${symbol}&limit=100\`)
      if (response.ok) {
        const data = await response.json()
        setHistoryData(data)
        
        // 통계 계산
        if (data && data.length > 0) {
          const rates = data.map((d: any) => parseFloat(d.fundingRate))
          const avgRate = rates.reduce((a: number, b: number) => a + b, 0) / rates.length
          const maxRate = Math.max(...rates)
          const minRate = Math.min(...rates)
          
          setFundingData(prev => {
            if (!prev) {
              return {
                current: {
                  symbol,
                  fundingRate: rates[0],
                  nextFundingRate: 0,
                  lastFundingRate: rates[1] || 0,
                  fundingTime: Date.now(),
                  nextFundingTime: Date.now() + 28800000,
                  countdown: '08:00:00',
                  countdownMs: 28800000,
                  markPrice: 0,
                  indexPrice: 0,
                  premium: 0,
                  annualizedRate: rates[0] * 365 * 3
                },
                statistics: {
                  avgRate,
                  maxRate,
                  minRate,
                  trend: avgRate > 0 ? 'bullish' : 'bearish',
                  sentiment: Math.abs(avgRate) > 0.01 ? 'extreme' : 'normal',
                  dataPoints: data.length
                },
                history: data.slice(0, 50).map((d: any) => ({
                  time: d.fundingTime,
                  rate: parseFloat(d.fundingRate),
                  symbol: d.symbol
                })),
                recommendation: {
                  action: avgRate > 0.01 ? 'Consider Short' : avgRate < -0.01 ? 'Consider Long' : 'Neutral',
                  confidence: Math.min(95, Math.abs(avgRate) * 10000),
                  reason: avgRate > 0.01 ? 'High positive funding rate' : avgRate < -0.01 ? 'High negative funding rate' : 'Balanced funding'
                }
              }
            }
            
            return {
              ...prev,
              statistics: {
                avgRate,
                maxRate,
                minRate,
                trend: avgRate > 0 ? 'bullish' : 'bearish',
                sentiment: Math.abs(avgRate) > 0.01 ? 'extreme' : 'normal',
                dataPoints: data.length
              },
              history: data.slice(0, 50).map((d: any) => ({
                time: d.fundingTime,
                rate: parseFloat(d.fundingRate),
                symbol: d.symbol
              }))
            }
          })
        }
      }
    } catch (error) {
      console.error('Failed to load funding history:', error)
    }
  }, [])
  
  // 카운트다운 포맷
  const formatCountdown = (ms: number) => {
    if (ms <= 0) return '00:00:00'
    const hours = Math.floor(ms / 3600000)
    const minutes = Math.floor((ms % 3600000) / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return \`\${hours.toString().padStart(2, '0')}:\${minutes.toString().padStart(2, '0')}:\${seconds.toString().padStart(2, '0')}\`
  }
  
  // 초기화
  useEffect(() => {
    connectWebSocket(selectedCoin)
    loadFundingHistory(selectedCoin.replace('USDT', '') + 'USDT')
    
    const priceInterval = setInterval(() => {
      fetch(\`https://api.binance.com/api/v3/ticker/price?symbol=\${selectedCoin}\`)
        .then(res => res.json())
        .then(data => {
          setCurrentPrice(parseFloat(data.price))
        })
        .catch(console.error)
    }, 5000)
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      clearInterval(priceInterval)
    }
  }, [selectedCoin, connectWebSocket, loadFundingHistory])
  
  // 자동 새로고침
  useEffect(() => {
    if (!autoRefresh) return
    
    const refreshInterval = setInterval(() => {
      loadFundingHistory(selectedCoin.replace('USDT', '') + 'USDT')
    }, 30000)
    
    return () => clearInterval(refreshInterval)
  }, [autoRefresh, selectedCoin, loadFundingHistory])
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          💸 펀딩 비율 분석
        </h1>
        
        {/* 코인 선택 */}
        <div className="mb-6 flex justify-center gap-2 flex-wrap">
          {COINS.map(coin => {
            const Icon = coin.icon
            return (
              <button
                key={coin.symbol}
                onClick={() => setSelectedCoin(coin.symbol)}
                className={\`px-4 py-2 rounded-lg transition-all flex items-center gap-2 \${
                  selectedCoin === coin.symbol
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }\`}
              >
                <Icon style={{ color: coin.color }} />
                <span>{coin.name}</span>
              </button>
            )
          })}
        </div>
        
        {/* 자동 새로고침 토글 */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={\`px-4 py-2 rounded-lg transition-all flex items-center gap-2 \${
              autoRefresh ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'
            }\`}
          >
            <FaSync className={autoRefresh ? 'animate-spin' : ''} />
            {autoRefresh ? '자동 새로고침 ON' : '자동 새로고침 OFF'}
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <FaClock className="animate-spin text-4xl text-purple-400 mx-auto mb-4" />
            <p className="text-gray-400">펀딩 데이터 로딩 중...</p>
          </div>
        ) : fundingData ? (
          <div className="space-y-6">
            {/* 현재 펀딩 정보 */}
            <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <FaPercent className="text-purple-400" />
                현재 펀딩 비율
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">현재 펀딩률</p>
                  <p className={\`text-3xl font-bold \${
                    fundingData.current.fundingRate > 0 ? 'text-red-400' : 'text-green-400'
                  }\`}>
                    {safePercent(fundingData.current.fundingRate * 100)}%
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {fundingData.current.fundingRate > 0 ? 'Longs pay Shorts' : 'Shorts pay Longs'}
                  </p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">연간 수익률</p>
                  <p className={\`text-3xl font-bold \${
                    fundingData.current.annualizedRate > 0 ? 'text-green-400' : 'text-red-400'
                  }\`}>
                    {safePercent(fundingData.current.annualizedRate)}%
                  </p>
                  <p className="text-sm text-gray-500 mt-1">APR</p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">다음 펀딩까지</p>
                  <p className="text-3xl font-bold text-yellow-400">
                    {fundingData.current.countdown}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    <FaClock className="inline mr-1" />
                    8시간마다 정산
                  </p>
                </div>
              </div>
            </div>
            
            {/* 통계 정보 */}
            <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <FaChartBar className="text-purple-400" />
                펀딩 통계
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">평균 펀딩률</p>
                  <p className={\`text-xl font-bold \${
                    fundingData.statistics.avgRate > 0 ? 'text-red-400' : 'text-green-400'
                  }\`}>
                    {safePercent(fundingData.statistics.avgRate * 100)}%
                  </p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">최대 펀딩률</p>
                  <p className="text-xl font-bold text-red-400">
                    {safePercent(fundingData.statistics.maxRate * 100)}%
                  </p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">최소 펀딩률</p>
                  <p className="text-xl font-bold text-green-400">
                    {safePercent(fundingData.statistics.minRate * 100)}%
                  </p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">시장 센티먼트</p>
                  <p className={\`text-xl font-bold \${
                    fundingData.statistics.sentiment === 'extreme' ? 'text-yellow-400' : 'text-blue-400'
                  }\`}>
                    {fundingData.statistics.sentiment === 'extreme' ? '🔥 극단적' : '⚖️ 정상'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* 추천 전략 */}
            <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <FaRobot className="text-purple-400" />
                AI 추천 전략
              </h2>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xl font-bold text-white">{fundingData.recommendation.action}</p>
                  <div className="flex items-center gap-2">
                    <FaLightbulb className="text-yellow-400" />
                    <span className="text-gray-400">신뢰도: {safeFixed(fundingData.recommendation.confidence, 0)}%</span>
                  </div>
                </div>
                <p className="text-gray-400">{fundingData.recommendation.reason}</p>
                
                <div className="mt-4 p-3 bg-gray-900 rounded-lg">
                  <p className="text-sm text-gray-500">
                    💡 팁: 펀딩률이 극단적일 때 반대 포지션을 고려하세요.
                    높은 양의 펀딩률은 숏 포지션에 유리하고,
                    높은 음의 펀딩률은 롱 포지션에 유리합니다.
                  </p>
                </div>
              </div>
            </div>
            
            {/* 펀딩 히스토리 차트 */}
            {fundingData.history && fundingData.history.length > 0 && (
              <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <FaHistory className="text-purple-400" />
                  펀딩 히스토리
                </h2>
                
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={fundingData.history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#9CA3AF"
                      tickFormatter={(time) => new Date(time).toLocaleDateString()}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      tickFormatter={(value) => \`\${(value * 100).toFixed(3)}%\`}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                      labelStyle={{ color: '#9CA3AF' }}
                      formatter={(value: any) => \`\${(value * 100).toFixed(4)}%\`}
                      labelFormatter={(time) => new Date(time).toLocaleString()}
                    />
                    <Area
                      type="monotone"
                      dataKey="rate"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaExclamationTriangle className="text-4xl text-yellow-400 mx-auto mb-4" />
            <p className="text-gray-400">펀딩 데이터를 불러올 수 없습니다</p>
          </div>
        )}
      </div>
    </div>
  )
}`;
        return content + completion;
      }
      return content;
    }
  }
];

// 파일 수정 실행
fixes.forEach(({ file, fix }) => {
  const filePath = path.join(__dirname, '..', '..', file);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const fixedContent = fix(content);
    
    if (content !== fixedContent) {
      fs.writeFileSync(filePath, fixedContent);
      console.log(`✅ Fixed: ${file}`);
    } else {
      console.log(`⏭️ No changes needed: ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error.message);
  }
});

console.log('\n✨ Build error fixes complete!');