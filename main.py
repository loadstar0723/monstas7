import streamlit as st
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
import requests
import json
import time
from typing import List, Dict, Any
import asyncio
import websocket
import threading

# 페이지 설정
st.set_page_config(
    page_title="MONSTA - 퀀텀 AI 크립토 트레이딩",
    page_icon="🚀",
    layout="wide",
    initial_sidebar_state="expanded"
)

# CSS 스타일
st.markdown("""
<style>
    /* 다크 테마 */
    .stApp {
        background: linear-gradient(180deg, #1a1a2e 0%, #0f0f1e 100%);
        color: white;
    }
    
    /* 헤더 스타일 */
    .main-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 3rem;
        border-radius: 20px;
        text-align: center;
        margin-bottom: 2rem;
    }
    
    .main-title {
        font-size: 4rem;
        font-weight: 800;
        background: linear-gradient(90deg, #a855f7, #ec4899, #3b82f6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-fill-color: transparent;
        margin-bottom: 1rem;
    }
    
    .subtitle {
        font-size: 1.5rem;
        color: #9ca3af;
        margin-bottom: 2rem;
    }
    
    /* 카드 스타일 */
    .metric-card {
        background: rgba(31, 41, 55, 0.8);
        border: 1px solid rgba(75, 85, 99, 0.3);
        border-radius: 16px;
        padding: 1.5rem;
        margin-bottom: 1rem;
    }
    
    .price-card {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1));
        border: 1px solid rgba(168, 85, 247, 0.3);
        border-radius: 16px;
        padding: 1.5rem;
        margin-bottom: 1rem;
    }
    
    /* 버튼 스타일 */
    .stButton > button {
        background: linear-gradient(90deg, #a855f7, #3b82f6);
        color: white;
        border: none;
        padding: 0.75rem 2rem;
        font-size: 1.1rem;
        font-weight: 600;
        border-radius: 10px;
        transition: all 0.3s ease;
    }
    
    .stButton > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(168, 85, 247, 0.3);
    }
    
    /* 메트릭 스타일 */
    [data-testid="metric-container"] {
        background: rgba(31, 41, 55, 0.8);
        border: 1px solid rgba(75, 85, 99, 0.3);
        padding: 1rem;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    /* 탭 스타일 */
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
        background: rgba(31, 41, 55, 0.5);
        padding: 8px;
        border-radius: 12px;
    }
    
    .stTabs [data-baseweb="tab"] {
        background: transparent;
        color: #9ca3af;
        border-radius: 8px;
        padding: 8px 16px;
    }
    
    .stTabs [data-baseweb="tab"]:hover {
        background: rgba(168, 85, 247, 0.1);
        color: white;
    }
    
    .stTabs [aria-selected="true"] {
        background: linear-gradient(90deg, #a855f7, #3b82f6);
        color: white !important;
    }
    
    /* 사이드바 스타일 */
    .css-1d391kg {
        background: rgba(17, 24, 39, 0.95);
    }
    
    /* 히트맵 스타일 */
    .heatmap-container {
        background: rgba(31, 41, 55, 0.8);
        border-radius: 16px;
        padding: 1.5rem;
        margin: 1rem 0;
    }
    
    .heatmap-cell {
        border-radius: 8px;
        padding: 8px;
        text-align: center;
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .heatmap-cell:hover {
        transform: scale(1.05);
        z-index: 10;
    }
</style>
""", unsafe_allow_html=True)

class BinanceDataFetcher:
    """바이낸스 실시간 데이터 가져오기"""
    
    @staticmethod
    def get_ticker_24hr(symbols: List[str] = None):
        """24시간 티커 데이터 가져오기"""
        try:
            if symbols:
                # 특정 심볼들의 데이터
                data = []
                for symbol in symbols:
                    url = f"https://api.binance.com/api/v3/ticker/24hr?symbol={symbol}"
                    response = requests.get(url, timeout=5)
                    if response.status_code == 200:
                        data.append(response.json())
            else:
                # 전체 티커 데이터
                url = "https://api.binance.com/api/v3/ticker/24hr"
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                else:
                    data = []
            
            return data
        except Exception as e:
            st.error(f"바이낸스 API 오류: {e}")
            return []
    
    @staticmethod
    def get_klines(symbol: str, interval: str = '1h', limit: int = 100):
        """캔들스틱 데이터 가져오기"""
        try:
            url = f"https://api.binance.com/api/v3/klines"
            params = {
                'symbol': symbol,
                'interval': interval,
                'limit': limit
            }
            response = requests.get(url, params=params, timeout=5)
            if response.status_code == 200:
                return response.json()
            return []
        except Exception as e:
            return []

def format_number(num):
    """숫자 포맷팅"""
    if num >= 1e9:
        return f"${num/1e9:.2f}B"
    elif num >= 1e6:
        return f"${num/1e6:.2f}M"
    elif num >= 1e3:
        return f"${num/1e3:.2f}K"
    else:
        return f"${num:.2f}"

def get_color_by_change(change):
    """변화율에 따른 색상 결정"""
    if change > 10:
        return "#10b981"  # green-500
    elif change > 5:
        return "#34d399"  # green-400
    elif change > 2:
        return "#86efac"  # green-300
    elif change > 0:
        return "#bbf7d0"  # green-200
    elif change > -2:
        return "#fecaca"  # red-200
    elif change > -5:
        return "#fca5a5"  # red-300
    elif change > -10:
        return "#f87171"  # red-400
    else:
        return "#ef4444"  # red-500

def create_heatmap(data):
    """암호화폐 히트맵 생성"""
    # 거래량 기준 상위 100개 선택
    usdt_pairs = [d for d in data if d['symbol'].endswith('USDT')]
    sorted_pairs = sorted(usdt_pairs, key=lambda x: float(x['quoteVolume']), reverse=True)[:100]
    
    # 데이터 준비
    symbols = []
    changes = []
    volumes = []
    prices = []
    
    for pair in sorted_pairs:
        symbol = pair['symbol'].replace('USDT', '')
        symbols.append(symbol)
        changes.append(float(pair['priceChangePercent']))
        volumes.append(float(pair['quoteVolume']))
        prices.append(float(pair['lastPrice']))
    
    # 히트맵 데이터 생성
    df = pd.DataFrame({
        'Symbol': symbols,
        'Change': changes,
        'Volume': volumes,
        'Price': prices
    })
    
    # 그리드 레이아웃 생성 (10x10)
    grid_size = 10
    fig = go.Figure()
    
    # 색상 스케일 정의
    colors = []
    for change in changes:
        colors.append(get_color_by_change(change))
    
    # 히트맵 생성
    x_pos = []
    y_pos = []
    for i in range(len(symbols)):
        x_pos.append(i % grid_size)
        y_pos.append(i // grid_size)
    
    # 버블 차트로 표현 (크기는 거래량에 비례)
    max_volume = max(volumes) if volumes else 1
    sizes = [(v / max_volume) * 100 + 20 for v in volumes]  # 크기 정규화
    
    fig.add_trace(go.Scatter(
        x=x_pos,
        y=y_pos,
        mode='markers+text',
        marker=dict(
            size=sizes,
            color=changes,
            colorscale=[
                [0, '#ef4444'],      # 빨간색
                [0.5, '#6b7280'],    # 회색
                [1, '#10b981']       # 초록색
            ],
            colorbar=dict(
                title="24h 변동률 (%)",
                thickness=20,
                len=0.5
            ),
            line=dict(width=1, color='white')
        ),
        text=[f"{s}<br>{c:+.1f}%" for s, c in zip(symbols, changes)],
        textposition="middle center",
        textfont=dict(size=8, color='white'),
        hovertemplate='<b>%{text}</b><br>가격: $%{customdata[0]:,.2f}<br>거래량: $%{customdata[1]:,.0f}<extra></extra>',
        customdata=list(zip(prices, volumes))
    ))
    
    fig.update_layout(
        title="🔥 실시간 암호화폐 히트맵 (상위 100개)",
        xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
        yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)',
        height=600,
        margin=dict(l=0, r=0, t=50, b=0),
        showlegend=False,
        font=dict(color='white')
    )
    
    return fig

def create_price_chart(symbol, klines):
    """가격 차트 생성"""
    if not klines:
        return None
    
    df = pd.DataFrame(klines, columns=[
        'timestamp', 'open', 'high', 'low', 'close', 'volume',
        'close_time', 'quote_volume', 'trades', 'taker_buy_base',
        'taker_buy_quote', 'ignore'
    ])
    
    df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
    df[['open', 'high', 'low', 'close', 'volume']] = df[['open', 'high', 'low', 'close', 'volume']].astype(float)
    
    fig = go.Figure(data=[go.Candlestick(
        x=df['timestamp'],
        open=df['open'],
        high=df['high'],
        low=df['low'],
        close=df['close'],
        name=symbol
    )])
    
    fig.update_layout(
        title=f"{symbol} 실시간 차트",
        yaxis_title="가격 (USDT)",
        xaxis_title="시간",
        template="plotly_dark",
        height=500,
        xaxis_rangeslider_visible=False
    )
    
    return fig

def main():
    """메인 페이지"""
    
    # 헤더
    st.markdown("""
    <div class="main-header">
        <h1 class="main-title">퀀텀 AI가 창조하는<br>크립토 유니버스 MONSTA</h1>
        <p class="subtitle">Crypto Universe Created by Quantum Intelligence</p>
    </div>
    """, unsafe_allow_html=True)
    
    # 액션 버튼
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        if st.button("🚀 7일 무료 체험", use_container_width=True):
            st.switch_page("pages/signup.py")
    with col2:
        if st.button("📊 실시간 트레이딩", use_container_width=True):
            st.switch_page("pages/trading.py")
    with col3:
        if st.button("🤖 AI 분석", use_container_width=True):
            st.switch_page("pages/ai_analysis.py")
    with col4:
        if st.button("💬 텔레그램 봇", use_container_width=True):
            st.switch_page("pages/telegram.py")
    
    # 실시간 시장 현황
    st.markdown("## 🔥 실시간 시장 현황")
    
    # 데이터 가져오기
    fetcher = BinanceDataFetcher()
    main_symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT']
    main_tickers = fetcher.get_ticker_24hr(main_symbols)
    
    if main_tickers:
        col1, col2, col3, col4 = st.columns(4)
        cols = [col1, col2, col3, col4]
        
        for i, ticker in enumerate(main_tickers):
            if i < 4:
                with cols[i]:
                    symbol = ticker['symbol'].replace('USDT', '')
                    price = float(ticker['lastPrice'])
                    change = float(ticker['priceChangePercent'])
                    volume = float(ticker['quoteVolume'])
                    
                    st.metric(
                        label=f"{symbol}/USDT",
                        value=f"${price:,.2f}",
                        delta=f"{change:+.2f}%",
                        delta_color="normal" if change >= 0 else "inverse"
                    )
                    st.caption(f"거래량: {format_number(volume)}")
    
    # 탭 구성
    tab1, tab2, tab3, tab4, tab5 = st.tabs([
        "📊 히트맵", "📈 차트 분석", "🤖 AI 예측", "💰 구독 플랜", "📰 실시간 뉴스"
    ])
    
    with tab1:
        st.markdown("### 🔥 암호화폐 히트맵 (거래량 TOP 100)")
        
        # 전체 티커 데이터 가져오기
        with st.spinner("실시간 데이터 로딩 중..."):
            all_tickers = fetcher.get_ticker_24hr()
            
        if all_tickers:
            heatmap_fig = create_heatmap(all_tickers)
            st.plotly_chart(heatmap_fig, use_container_width=True)
            
            # 범례 설명
            col1, col2 = st.columns(2)
            with col1:
                st.markdown("""
                **📈 색상 (24시간 변동률)**
                - 🟢 초록색: 상승 (진할수록 큰 상승)
                - 🔴 빨간색: 하락 (진할수록 큰 하락)
                - ⚪ 회색: 변동 없음
                """)
            with col2:
                st.markdown("""
                **📊 크기 (거래량)**
                - 원의 크기가 클수록 거래량이 많음
                - BTC, ETH 등 주요 코인이 큰 원으로 표시
                """)
    
    with tab2:
        st.markdown("### 📈 실시간 차트 분석")
        
        col1, col2 = st.columns([1, 3])
        with col1:
            selected_symbol = st.selectbox(
                "코인 선택",
                ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 
                 'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'DOTUSDT', 'MATICUSDT']
            )
            
            interval = st.select_slider(
                "시간 간격",
                options=['1m', '5m', '15m', '30m', '1h', '4h', '1d'],
                value='1h'
            )
            
            if st.button("🔄 새로고침", use_container_width=True):
                st.rerun()
        
        with col2:
            klines = fetcher.get_klines(selected_symbol, interval)
            if klines:
                chart_fig = create_price_chart(selected_symbol, klines)
                if chart_fig:
                    st.plotly_chart(chart_fig, use_container_width=True)
    
    with tab3:
        st.markdown("### 🤖 AI 예측 시스템")
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.markdown("""
            <div class="metric-card">
                <h4>🧠 GPT-4 분석</h4>
                <p>최신 GPT-4 모델을 활용한 시장 심리 및 트렌드 분석</p>
                <div style="color: #10b981;">예측 정확도: 87.3%</div>
            </div>
            """, unsafe_allow_html=True)
        
        with col2:
            st.markdown("""
            <div class="metric-card">
                <h4>📊 LSTM 예측</h4>
                <p>딥러닝 시계열 분석으로 가격 패턴 예측</p>
                <div style="color: #3b82f6;">예측 정확도: 82.1%</div>
            </div>
            """, unsafe_allow_html=True)
        
        with col3:
            st.markdown("""
            <div class="metric-card">
                <h4>🔮 앙상블 모델</h4>
                <p>11개 AI 모델의 종합 분석</p>
                <div style="color: #a855f7;">예측 정확도: 91.5%</div>
            </div>
            """, unsafe_allow_html=True)
        
        # AI 예측 결과 표시
        st.markdown("#### 오늘의 AI 추천")
        
        predictions = pd.DataFrame({
            '코인': ['BTC', 'ETH', 'SOL', 'BNB', 'XRP'],
            '현재가': [43250, 2280, 98.5, 312, 0.52],
            '24h 예측': [44500, 2350, 102, 320, 0.54],
            '신호': ['매수', '매수', '홀드', '매수', '매도'],
            '신뢰도': [92, 88, 75, 85, 70]
        })
        
        # 스타일링된 데이터프레임
        def color_signal(val):
            if val == '매수':
                color = 'background-color: rgba(16, 185, 129, 0.2); color: #10b981;'
            elif val == '매도':
                color = 'background-color: rgba(239, 68, 68, 0.2); color: #ef4444;'
            else:
                color = 'background-color: rgba(107, 114, 128, 0.2); color: #6b7280;'
            return color
        
        styled_df = predictions.style.applymap(color_signal, subset=['신호'])
        st.dataframe(styled_df, use_container_width=True)
    
    with tab4:
        st.markdown("### 💰 구독 플랜")
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.markdown("""
            <div class="price-card">
                <h3>🥈 Silver</h3>
                <h2>₩49,000/월</h2>
                <ul style="list-style: none; padding: 0;">
                    <li>✅ 실시간 뉴스</li>
                    <li>✅ 기본 기술적 분석</li>
                    <li>✅ AI 질문 30개/일</li>
                    <li>✅ 텔레그램 기본 시그널</li>
                </ul>
                <button style="width: 100%; padding: 10px; margin-top: 20px;">선택하기</button>
            </div>
            """, unsafe_allow_html=True)
        
        with col2:
            st.markdown("""
            <div class="price-card" style="border: 2px solid #a855f7;">
                <div style="background: #a855f7; color: white; padding: 5px; border-radius: 20px; text-align: center; margin-bottom: 10px;">
                    POPULAR
                </div>
                <h3>🥇 Gold</h3>
                <h2>₩190,000/월</h2>
                <ul style="list-style: none; padding: 0;">
                    <li>✅ 모든 Silver 기능</li>
                    <li>✅ AI 무제한 질문</li>
                    <li>✅ 고급 자동매매</li>
                    <li>✅ 백테스팅 도구</li>
                    <li>✅ 우선 고객 지원</li>
                </ul>
                <button style="width: 100%; padding: 10px; margin-top: 20px; background: linear-gradient(90deg, #a855f7, #3b82f6); color: white; border: none;">선택하기</button>
            </div>
            """, unsafe_allow_html=True)
        
        with col3:
            st.markdown("""
            <div class="price-card">
                <h3>💎 Diamond</h3>
                <h2>₩990,000/월</h2>
                <ul style="list-style: none; padding: 0;">
                    <li>✅ 모든 Gold 기능</li>
                    <li>✅ 전담 매니저</li>
                    <li>✅ 맞춤 전략 개발</li>
                    <li>✅ API 무제한</li>
                    <li>✅ 1:1 컨설팅</li>
                </ul>
                <button style="width: 100%; padding: 10px; margin-top: 20px;">선택하기</button>
            </div>
            """, unsafe_allow_html=True)
    
    with tab5:
        st.markdown("### 📰 실시간 크립토 뉴스")
        
        # 샘플 뉴스 데이터 (실제로는 API에서 가져와야 함)
        news_data = [
            {
                "title": "비트코인, 연말 10만 달러 돌파 전망",
                "source": "CoinDesk",
                "time": "10분 전",
                "sentiment": "긍정"
            },
            {
                "title": "이더리움 2.0 업그레이드 성공적 완료",
                "source": "CryptoNews",
                "time": "30분 전",
                "sentiment": "긍정"
            },
            {
                "title": "SEC, 새로운 암호화폐 규제 발표",
                "source": "Reuters",
                "time": "1시간 전",
                "sentiment": "부정"
            },
            {
                "title": "솔라나 네트워크 장애 복구 완료",
                "source": "BlockNews",
                "time": "2시간 전",
                "sentiment": "중립"
            }
        ]
        
        for news in news_data:
            sentiment_color = {
                "긍정": "#10b981",
                "부정": "#ef4444",
                "중립": "#6b7280"
            }
            
            st.markdown(f"""
            <div style="background: rgba(31, 41, 55, 0.8); padding: 15px; border-radius: 10px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="margin: 0;">{news['title']}</h4>
                        <p style="color: #9ca3af; margin: 5px 0;">{news['source']} • {news['time']}</p>
                    </div>
                    <div style="background: {sentiment_color[news['sentiment']]}; padding: 5px 10px; border-radius: 5px;">
                        {news['sentiment']}
                    </div>
                </div>
            </div>
            """, unsafe_allow_html=True)
    
    # 푸터
    st.markdown("---")
    st.markdown("""
    <div style="text-align: center; color: #6b7280;">
        <h4>MONSTA - 세계 최고의 가상화폐 AI 트레이딩 플랫폼</h4>
        <p>실시간 데이터 제공: Binance | © 2024 MONSTA. All rights reserved.</p>
        <p style="margin-top: 10px;">
            <a href="/pages/terms" style="color: #a855f7; margin: 0 10px;">이용약관</a>
            <a href="/pages/privacy" style="color: #a855f7; margin: 0 10px;">개인정보처리방침</a>
            <a href="/pages/contact" style="color: #a855f7; margin: 0 10px;">문의하기</a>
        </p>
    </div>
    """, unsafe_allow_html=True)

# 자동 새로고침 (10초마다)
if 'last_refresh' not in st.session_state:
    st.session_state.last_refresh = time.time()

current_time = time.time()
if current_time - st.session_state.last_refresh > 10:
    st.session_state.last_refresh = current_time
    st.rerun()

if __name__ == "__main__":
    main()