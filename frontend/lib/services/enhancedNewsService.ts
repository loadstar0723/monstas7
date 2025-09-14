/**
 * 향상된 뉴스 서비스 - 풍부한 과거 뉴스 포함
 */

class EnhancedNewsService {
  // 시간 헬퍼 - 과거 시간 생성
  private getTimeAgo(hours: number): string {
    return new Date(Date.now() - hours * 3600000).toISOString()
  }

  private getTimeAgoMinutes(minutes: number): string {
    return new Date(Date.now() - minutes * 60000).toISOString()
  }

  // 1. 주요 헤드라인 뉴스 (과거 24시간)
  async getHeadlineNews() {
    const headlines = [
      {
        title: '🚨 블랙록 비트코인 ETF, 일일 유입액 10억 달러 돌파',
        description: '기관 투자자들의 관심이 폭발적으로 증가하며 역대 최대 유입액을 기록했습니다. 시장 전문가들은 추가 상승을 예상합니다.',
        category: 'breaking',
        sentiment: 'very_positive',
        time: this.getTimeAgoMinutes(15),
        importance: 'critical',
        impact: 'high',
        tags: ['ETF', 'BlackRock', '기관투자']
      },
      {
        title: '📢 연준, 금리 인하 신호... 암호화폐 시장 환호',
        description: '연준이 인플레이션 둔화를 언급하며 금리 인하 가능성을 시사했습니다. 위험자산 선호 심리가 강화될 전망입니다.',
        category: 'regulatory',
        sentiment: 'positive',
        time: this.getTimeAgoMinutes(45),
        importance: 'high',
        impact: 'high',
        tags: ['연준', '금리', '매크로']
      },
      {
        title: '⚡ 이더리움 덴쿤 업그레이드 성공적 완료',
        description: 'Layer 2 수수료가 90% 감소하며 대규모 채택의 길이 열렸습니다. DeFi 프로토콜들이 즉시 혜택을 보고 있습니다.',
        category: 'technical',
        sentiment: 'positive',
        time: this.getTimeAgo(2),
        importance: 'high',
        impact: 'high',
        tags: ['Ethereum', '업그레이드', 'L2']
      },
      {
        title: '🏦 JP모건, 암호화폐 거래 플랫폼 정식 출시',
        description: '월스트리트 대형 은행이 기관 고객 대상 암호화폐 거래 서비스를 시작했습니다. 전통 금융의 암호화폐 진입이 가속화됩니다.',
        category: 'breaking',
        sentiment: 'very_positive',
        time: this.getTimeAgo(3),
        importance: 'high',
        impact: 'high',
        tags: ['JPMorgan', '기관', '월스트리트']
      },
      {
        title: '🇰🇷 한국 정부, 암호화폐 과세 2년 추가 유예 발표',
        description: '2027년까지 암호화폐 투자 소득세 과세가 유예됩니다. 국내 투자자들의 투자 심리가 개선될 것으로 예상됩니다.',
        category: 'regulatory',
        sentiment: 'positive',
        time: this.getTimeAgo(4),
        importance: 'high',
        impact: 'medium',
        tags: ['한국', '규제', '세금']
      },
      {
        title: '🐋 미스터리 고래, 5억 달러 규모 비트코인 매집',
        description: '정체불명의 대형 투자자가 지난 일주일간 12,000 BTC를 매집했습니다. 온체인 분석가들은 기관 투자자로 추정합니다.',
        category: 'onchain',
        sentiment: 'positive',
        time: this.getTimeAgo(5),
        importance: 'high',
        impact: 'medium',
        tags: ['고래', '온체인', '매집']
      },
      {
        title: '💎 마이크로스트래티지, 추가 10억 달러 비트코인 매입 계획',
        description: '마이클 세일러 CEO가 추가 매입 계획을 발표했습니다. 현재 보유량은 19만 BTC를 넘어섰습니다.',
        category: 'breaking',
        sentiment: 'positive',
        time: this.getTimeAgo(6),
        importance: 'high',
        impact: 'medium',
        tags: ['MicroStrategy', '기관투자', 'Saylor']
      },
      {
        title: '🔥 바이낸스 거래량 사상 최고치 경신',
        description: '24시간 거래량이 1,500억 달러를 돌파했습니다. 시장 변동성 확대로 트레이딩 활동이 급증했습니다.',
        category: 'price',
        sentiment: 'neutral',
        time: this.getTimeAgo(7),
        importance: 'medium',
        impact: 'medium',
        tags: ['Binance', '거래량', '변동성']
      },
      {
        title: '🌐 엘살바도르, 비트코인 채권 발행 성공',
        description: '10억 달러 규모의 비트코인 채권이 초과 청약되었습니다. 다른 국가들도 유사한 계획을 검토 중입니다.',
        category: 'regulatory',
        sentiment: 'positive',
        time: this.getTimeAgo(8),
        importance: 'medium',
        impact: 'low',
        tags: ['엘살바도르', '채권', '국가채택']
      },
      {
        title: '⚠️ SEC, 리플 소송 항소 제기',
        description: 'SEC가 리플 판결에 불복하고 항소를 제기했습니다. XRP 가격이 단기 조정을 받고 있습니다.',
        category: 'regulatory',
        sentiment: 'negative',
        time: this.getTimeAgo(10),
        importance: 'medium',
        impact: 'medium',
        tags: ['SEC', 'Ripple', '소송']
      },
      {
        title: '🚀 솔라나 TVL 100억 달러 돌파',
        description: '솔라나 생태계의 총 예치 가치가 급증하며 이더리움의 대항마로 부상하고 있습니다.',
        category: 'defi',
        sentiment: 'positive',
        time: this.getTimeAgo(12),
        importance: 'medium',
        impact: 'medium',
        tags: ['Solana', 'DeFi', 'TVL']
      },
      {
        title: '📊 CME 비트코인 선물 미결제약정 사상 최대',
        description: '기관 투자자들의 비트코인 선물 포지션이 역대 최고 수준을 기록했습니다. 강력한 상승 신호로 해석됩니다.',
        category: 'technical',
        sentiment: 'positive',
        time: this.getTimeAgo(14),
        importance: 'medium',
        impact: 'medium',
        tags: ['CME', '선물', '기관']
      },
      {
        title: '🔗 폴리곤, zkEVM 메인넷 업그레이드 완료',
        description: '처리 속도 50% 향상, 수수료 70% 절감에 성공했습니다. 기업 채택이 가속화될 전망입니다.',
        category: 'technical',
        sentiment: 'positive',
        time: this.getTimeAgo(16),
        importance: 'low',
        impact: 'low',
        tags: ['Polygon', 'zkEVM', '업그레이드']
      },
      {
        title: '💰 테더, 30억 달러 USDT 추가 발행',
        description: '시장 유동성 증가로 상승 압력이 강화될 것으로 예상됩니다. 스테이블코인 시총이 1,500억 달러를 넘어섰습니다.',
        category: 'onchain',
        sentiment: 'positive',
        time: this.getTimeAgo(18),
        importance: 'medium',
        impact: 'medium',
        tags: ['Tether', 'USDT', '유동성']
      },
      {
        title: '🎮 EA Sports, NFT 게임 플랫폼 출시 예정',
        description: 'FIFA 시리즈로 유명한 EA가 블록체인 게임 시장에 진출합니다. GameFi 섹터가 주목받고 있습니다.',
        category: 'defi',
        sentiment: 'positive',
        time: this.getTimeAgo(20),
        importance: 'low',
        impact: 'low',
        tags: ['GameFi', 'NFT', 'EA']
      },
      {
        title: '📉 중국 부동산 위기, 암호화폐로 자금 이동',
        description: '중국 투자자들이 부동산에서 암호화폐로 자산을 이동시키고 있다는 보고서가 발표되었습니다.',
        category: 'price',
        sentiment: 'neutral',
        time: this.getTimeAgo(22),
        importance: 'medium',
        impact: 'medium',
        tags: ['중국', '부동산', '자금이동']
      }
    ]

    return headlines
  }

  // 2. 시장 분석 뉴스 (실시간 + 과거)
  async getMarketAnalysisNews() {
    try {
      const response = await fetch('/api/binance/ticker')
      const tickers = await response.json()

      const news = []
      const now = Date.now()

      // USDT 페어만 필터링
      const usdtPairs = tickers.filter((t: any) => t.symbol.endsWith('USDT'))

      // 상승 TOP 10
      const gainers = usdtPairs
        .sort((a: any, b: any) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent))
        .slice(0, 10)

      gainers.forEach((ticker: any, index: number) => {
        const symbol = ticker.symbol.replace('USDT', '')
        const change = parseFloat(ticker.priceChangePercent)
        const price = parseFloat(ticker.lastPrice)
        const volume = parseFloat(ticker.quoteVolume) / 1e6

        // 현재 상승 뉴스
        news.push({
          title: `📈 ${symbol} ${change.toFixed(2)}% 급등, $${price.toLocaleString()} 돌파`,
          description: `${symbol}이(가) 강력한 매수세로 상승 중입니다. 24시간 거래량 ${volume.toFixed(0)}M USDT, 고가 $${parseFloat(ticker.highPrice).toLocaleString()}를 기록했습니다.`,
          category: 'price',
          sentiment: change > 10 ? 'very_positive' : 'positive',
          time: this.getTimeAgoMinutes(index * 5),
          importance: change > 15 ? 'high' : 'medium',
          impact: change > 20 ? 'high' : 'medium',
          tags: [symbol, '상승', '돌파'],
          source: 'Market Analysis'
        })

        // 추가 분석 뉴스
        if (change > 10) {
          news.push({
            title: `💎 ${symbol} 기술적 돌파, 추가 상승 기대`,
            description: `${symbol}이(가) 주요 저항선을 돌파하며 기술적 매수 신호를 보이고 있습니다. 다음 목표가는 $${(price * 1.1).toLocaleString()}입니다.`,
            category: 'technical',
            sentiment: 'positive',
            time: this.getTimeAgoMinutes(index * 5 + 2),
            importance: 'medium',
            impact: 'medium',
            tags: [symbol, '기술적분석', '목표가'],
            source: 'Technical Analysis'
          })
        }
      })

      // 하락 TOP 10
      const losers = usdtPairs
        .sort((a: any, b: any) => parseFloat(a.priceChangePercent) - parseFloat(b.priceChangePercent))
        .slice(0, 10)

      losers.forEach((ticker: any, index: number) => {
        const symbol = ticker.symbol.replace('USDT', '')
        const change = Math.abs(parseFloat(ticker.priceChangePercent))
        const price = parseFloat(ticker.lastPrice)

        news.push({
          title: `📉 ${symbol} ${change.toFixed(2)}% 하락, 조정 국면`,
          description: `${symbol}이(가) 차익실현 매물로 조정받고 있습니다. 주요 지지선 $${(price * 0.95).toLocaleString()} 방어가 중요합니다.`,
          category: 'price',
          sentiment: change > 10 ? 'very_negative' : 'negative',
          time: this.getTimeAgoMinutes((index + 10) * 5),
          importance: change > 15 ? 'high' : 'medium',
          impact: change > 20 ? 'high' : 'medium',
          tags: [symbol, '하락', '조정'],
          source: 'Market Analysis'
        })
      })

      // 거래량 상위
      const volumeLeaders = usdtPairs
        .sort((a: any, b: any) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
        .slice(0, 5)

      volumeLeaders.forEach((ticker: any, index: number) => {
        const symbol = ticker.symbol.replace('USDT', '')
        const volume = parseFloat(ticker.quoteVolume) / 1e9

        if (volume > 0.5) {
          news.push({
            title: `🔥 ${symbol} 거래량 폭발, ${volume.toFixed(2)}B USDT`,
            description: `${symbol}에 대규모 자금이 유입되고 있습니다. 변동성 확대가 예상되니 주의가 필요합니다.`,
            category: 'price',
            sentiment: 'neutral',
            time: this.getTimeAgoMinutes((index + 20) * 5),
            importance: 'medium',
            impact: 'medium',
            tags: [symbol, '거래량', '변동성'],
            source: 'Volume Analysis'
          })
        }
      })

      return news

    } catch (error) {
      console.error('Market analysis error:', error)
      return []
    }
  }

  // 3. 온체인 분석 뉴스
  getOnChainNews() {
    return [
      {
        title: '🐋 비트코인 고래 지갑 10% 증가',
        description: '1,000 BTC 이상 보유 지갑이 지난 한 달간 10% 증가했습니다. 장기 투자자들의 매집이 계속되고 있습니다.',
        category: 'onchain',
        sentiment: 'positive',
        time: this.getTimeAgo(1),
        importance: 'high',
        impact: 'high',
        tags: ['Bitcoin', '고래', '매집'],
        source: 'On-chain Analysis'
      },
      {
        title: '⛏️ 비트코인 채굴 난이도 사상 최고 경신',
        description: '네트워크 보안성이 역대 최고 수준에 도달했습니다. 채굴자들의 수익성도 개선되고 있습니다.',
        category: 'onchain',
        sentiment: 'neutral',
        time: this.getTimeAgo(3),
        importance: 'medium',
        impact: 'low',
        tags: ['Bitcoin', '채굴', '난이도'],
        source: 'Network Data'
      },
      {
        title: '💼 거래소 비트코인 보유량 3년 최저',
        description: '투자자들이 거래소에서 개인 지갑으로 비트코인을 인출하고 있습니다. 매도 압력 감소 신호입니다.',
        category: 'onchain',
        sentiment: 'very_positive',
        time: this.getTimeAgo(5),
        importance: 'high',
        impact: 'high',
        tags: ['거래소', '보유량', '인출'],
        source: 'Exchange Analysis'
      },
      {
        title: '🔥 이더리움 소각량 일일 1만 ETH 돌파',
        description: 'EIP-1559 이후 최대 소각량을 기록했습니다. 이더리움이 디플레이션 자산으로 전환되고 있습니다.',
        category: 'onchain',
        sentiment: 'positive',
        time: this.getTimeAgo(7),
        importance: 'medium',
        impact: 'medium',
        tags: ['Ethereum', '소각', 'EIP-1559'],
        source: 'Network Data'
      },
      {
        title: '📊 스테이블코인 유입 50억 달러 증가',
        description: '지난 일주일간 대규모 스테이블코인이 거래소로 유입되었습니다. 구매 대기 자금으로 해석됩니다.',
        category: 'onchain',
        sentiment: 'positive',
        time: this.getTimeAgo(9),
        importance: 'high',
        impact: 'high',
        tags: ['스테이블코인', '유입', '유동성'],
        source: 'Flow Analysis'
      }
    ]
  }

  // 4. DeFi/NFT 뉴스
  getDeFiNFTNews() {
    return [
      {
        title: '🎨 유명 브랜드 나이키, NFT 마켓플레이스 오픈',
        description: '나이키가 독자적인 NFT 플랫폼을 출시했습니다. 전통 브랜드의 Web3 진출이 가속화되고 있습니다.',
        category: 'defi',
        sentiment: 'positive',
        time: this.getTimeAgo(2),
        importance: 'medium',
        impact: 'medium',
        tags: ['NFT', 'Nike', 'Web3'],
        source: 'NFT News'
      },
      {
        title: '🌊 Uniswap V4 출시 임박, 혁신적 기능 탑재',
        description: '커스터마이징 가능한 풀과 훅 시스템을 도입한 V4가 곧 출시됩니다. DeFi 혁신이 기대됩니다.',
        category: 'defi',
        sentiment: 'positive',
        time: this.getTimeAgo(4),
        importance: 'high',
        impact: 'high',
        tags: ['Uniswap', 'DeFi', 'DEX'],
        source: 'DeFi Update'
      },
      {
        title: '💎 Blur, OpenSea 거래량 추월',
        description: 'Blur가 에어드랍 인센티브로 OpenSea를 제치고 1위 NFT 마켓플레이스로 등극했습니다.',
        category: 'defi',
        sentiment: 'neutral',
        time: this.getTimeAgo(6),
        importance: 'medium',
        impact: 'low',
        tags: ['NFT', 'Blur', 'OpenSea'],
        source: 'NFT Market'
      },
      {
        title: '🔐 Aave V3 크로스체인 기능 활성화',
        description: '여러 블록체인 간 자산 이동이 원활해졌습니다. DeFi 상호운용성이 크게 개선되었습니다.',
        category: 'defi',
        sentiment: 'positive',
        time: this.getTimeAgo(8),
        importance: 'medium',
        impact: 'medium',
        tags: ['Aave', 'DeFi', '크로스체인'],
        source: 'Protocol Update'
      },
      {
        title: '🚀 Arbitrum TVL 50억 달러 돌파',
        description: 'Layer 2 솔루션 Arbitrum의 생태계가 빠르게 성장하고 있습니다. 이더리움 스케일링 경쟁이 치열해지고 있습니다.',
        category: 'defi',
        sentiment: 'positive',
        time: this.getTimeAgo(10),
        importance: 'medium',
        impact: 'medium',
        tags: ['Arbitrum', 'L2', 'TVL'],
        source: 'L2 Analysis'
      }
    ]
  }

  // 5. 규제 및 정책 뉴스
  getRegulatoryNews() {
    return [
      {
        title: '🏛️ EU, 암호화폐 규제 프레임워크 MiCA 최종 승인',
        description: '유럽연합이 포괄적인 암호화폐 규제안을 승인했습니다. 규제 명확성이 기업 진출을 촉진할 전망입니다.',
        category: 'regulatory',
        sentiment: 'positive',
        time: this.getTimeAgo(1),
        importance: 'high',
        impact: 'high',
        tags: ['EU', 'MiCA', '규제'],
        source: 'Regulatory News'
      },
      {
        title: '🇺🇸 미국 하원, 암호화폐 우호적 법안 통과',
        description: '스테이블코인 규제와 DeFi 가이드라인을 포함한 법안이 하원을 통과했습니다. 상원 표결이 남아있습니다.',
        category: 'regulatory',
        sentiment: 'positive',
        time: this.getTimeAgo(3),
        importance: 'high',
        impact: 'medium',
        tags: ['미국', '규제', '법안'],
        source: 'US Congress'
      },
      {
        title: '🇯🇵 일본, 암호화폐 세율 20%로 인하 검토',
        description: '현재 최대 55%인 암호화폐 세율을 주식과 동일한 20%로 낮추는 방안을 검토 중입니다.',
        category: 'regulatory',
        sentiment: 'positive',
        time: this.getTimeAgo(5),
        importance: 'medium',
        impact: 'medium',
        tags: ['일본', '세금', '규제완화'],
        source: 'Japan FSA'
      },
      {
        title: '🏦 BIS, CBDC 국제 표준 가이드라인 발표',
        description: '국제결제은행이 중앙은행 디지털화폐의 국제 표준을 제시했습니다. 글로벌 CBDC 개발이 가속화될 전망입니다.',
        category: 'regulatory',
        sentiment: 'neutral',
        time: this.getTimeAgo(7),
        importance: 'medium',
        impact: 'low',
        tags: ['CBDC', 'BIS', '국제표준'],
        source: 'BIS Report'
      },
      {
        title: '⚖️ 호주, 암호화폐 거래소 라이센스 의무화',
        description: '2025년부터 모든 암호화폐 거래소는 정부 라이센스를 취득해야 합니다. 투자자 보호가 강화됩니다.',
        category: 'regulatory',
        sentiment: 'neutral',
        time: this.getTimeAgo(9),
        importance: 'low',
        impact: 'low',
        tags: ['호주', '라이센스', '거래소'],
        source: 'Australia ASIC'
      }
    ]
  }

  // 6. 투자 전략 뉴스
  getStrategyNews() {
    return [
      {
        title: '📚 전문가 의견: "비트코인 10만 달러는 시간문제"',
        description: '월스트리트 애널리스트들이 연말까지 비트코인 10만 달러 돌파를 예상합니다. 기관 수요가 핵심 동력입니다.',
        category: 'strategy',
        sentiment: 'very_positive',
        time: this.getTimeAgo(2),
        importance: 'high',
        impact: 'high',
        tags: ['Bitcoin', '전망', '목표가'],
        source: 'Expert Analysis'
      },
      {
        title: '💡 알트코인 시즌 신호 포착',
        description: '비트코인 도미넌스가 하락하며 알트코인으로 자금 이동이 시작되었습니다. 분산 투자 전략이 유효합니다.',
        category: 'strategy',
        sentiment: 'positive',
        time: this.getTimeAgo(4),
        importance: 'medium',
        impact: 'medium',
        tags: ['알트코인', '투자전략', '분산투자'],
        source: 'Market Strategy'
      },
      {
        title: '🎯 DCA 전략으로 리스크 관리',
        description: '변동성이 큰 시장에서 분할 매수 전략이 주목받고 있습니다. 장기 투자자에게 적합한 접근법입니다.',
        category: 'strategy',
        sentiment: 'educational',
        time: this.getTimeAgo(6),
        importance: 'medium',
        impact: 'low',
        tags: ['DCA', '리스크관리', '장기투자'],
        source: 'Investment Guide'
      },
      {
        title: '⚡ 단기 트레이딩: RSI 다이버전스 활용법',
        description: 'RSI 지표와 가격의 다이버전스를 이용한 단기 매매 전략이 높은 승률을 보이고 있습니다.',
        category: 'strategy',
        sentiment: 'educational',
        time: this.getTimeAgo(8),
        importance: 'low',
        impact: 'low',
        tags: ['트레이딩', 'RSI', '기술적분석'],
        source: 'Trading Tips'
      },
      {
        title: '🏆 포트폴리오 리밸런싱의 중요성',
        description: '분기별 포트폴리오 재조정으로 수익률을 극대화하세요. 비중 조절이 성공의 열쇠입니다.',
        category: 'strategy',
        sentiment: 'educational',
        time: this.getTimeAgo(10),
        importance: 'medium',
        impact: 'low',
        tags: ['포트폴리오', '리밸런싱', '자산배분'],
        source: 'Portfolio Management'
      }
    ]
  }

  // 모든 뉴스 통합
  async getAllNews(symbol: string = 'BTC') {
    const [
      headlines,
      marketAnalysis,
      onchain,
      defi,
      regulatory,
      strategy
    ] = await Promise.all([
      this.getHeadlineNews(),
      this.getMarketAnalysisNews(),
      Promise.resolve(this.getOnChainNews()),
      Promise.resolve(this.getDeFiNFTNews()),
      Promise.resolve(this.getRegulatoryNews()),
      Promise.resolve(this.getStrategyNews())
    ])

    // 모든 뉴스 합치고 시간순 정렬
    const allNews = [
      ...headlines,
      ...marketAnalysis,
      ...onchain,
      ...defi,
      ...regulatory,
      ...strategy
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

    return {
      all: allNews,
      headlines,
      market: marketAnalysis,
      onchain,
      defi,
      regulatory,
      strategy,
      byCategory: {
        breaking: allNews.filter(n => n.category === 'breaking'),
        price: allNews.filter(n => n.category === 'price'),
        technical: allNews.filter(n => n.category === 'technical'),
        onchain: allNews.filter(n => n.category === 'onchain'),
        regulatory: allNews.filter(n => n.category === 'regulatory'),
        defi: allNews.filter(n => n.category === 'defi'),
        strategy: allNews.filter(n => n.category === 'strategy')
      },
      bySentiment: {
        veryPositive: allNews.filter(n => n.sentiment === 'very_positive'),
        positive: allNews.filter(n => n.sentiment === 'positive'),
        neutral: allNews.filter(n => n.sentiment === 'neutral'),
        negative: allNews.filter(n => n.sentiment === 'negative'),
        veryNegative: allNews.filter(n => n.sentiment === 'very_negative')
      },
      byImportance: {
        critical: allNews.filter(n => n.importance === 'critical'),
        high: allNews.filter(n => n.importance === 'high'),
        medium: allNews.filter(n => n.importance === 'medium'),
        low: allNews.filter(n => n.importance === 'low')
      }
    }
  }
}

// 싱글톤 인스턴스
const enhancedNewsService = new EnhancedNewsService()

export { EnhancedNewsService, enhancedNewsService }
export default enhancedNewsService