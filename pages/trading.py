"""
트레이딩 관련 페이지 모듈
실시간 차트, 주문 실행, 포트폴리오 관리 등
"""

import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from datetime import datetime, timedelta
from services.binance_api import get_binance_client
from services.database import get_db_manager


def show_page(page_id: str):
    """페이지 라우팅"""
    if page_id == 'trading_chart':
        show_realtime_chart()
    elif page_id == 'trading_order':
        show_order_page()
    elif page_id == 'trading_portfolio':
        show_portfolio()
    elif page_id == 'trading_history':
        show_trading_history()
    elif page_id == 'trading_pnl':
        show_pnl_analysis()
    else:
        st.error(f"페이지 {page_id}를 찾을 수 없습니다.")


def show_realtime_chart():
    """실시간 차트 페이지"""
    # 심볼 선택
    col1, col2, col3, col4 = st.columns([2, 1, 1, 1])
    
    with col1:
        symbol = st.selectbox(
            "심볼 선택",
            ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "ADAUSDT", "XRPUSDT"],
            index=0
        )
    
    with col2:
        interval = st.selectbox(
            "시간 간격",
            ["1m", "5m", "15m", "30m", "1h", "4h", "1d"],
            index=2
        )
    
    with col3:
        chart_type = st.selectbox(
            "차트 타입",
            ["캔들스틱", "라인", "바"]
        )
    
    with col4:
        if st.button("🔄 새로고침", use_container_width=True):
            st.rerun()
    
    # 차트 영역
    st.subheader(f"📈 {symbol} 차트")
    
    # 바이낸스에서 실시간 데이터 가져오기
    try:
        client = get_binance_client()
        df = client.get_klines(symbol, interval, limit=100)
        
        if not df.empty:
            # Plotly 캔들스틱 차트
            fig = go.Figure()
            
            if chart_type == "캔들스틱":
                fig.add_trace(go.Candlestick(
                    x=df.index,
                    open=df['open'],
                    high=df['high'],
                    low=df['low'],
                    close=df['close'],
                    name=symbol
                ))
            elif chart_type == "라인":
                fig.add_trace(go.Scatter(
                    x=df.index,
                    y=df['close'],
                    mode='lines',
                    name=symbol,
                    line=dict(color='blue', width=2)
                ))
            else:  # 바 차트
                fig.add_trace(go.Bar(
                    x=df.index,
                    y=df['close'],
                    name=symbol
                ))
            
            # 볼륨 추가
            fig.add_trace(go.Bar(
                x=df.index,
                y=df['volume'],
                name='Volume',
                yaxis='y2',
                opacity=0.3
            ))
            
            fig.update_layout(
                title=f'{symbol} - {interval}',
                yaxis_title='Price (USDT)',
                yaxis2=dict(
                    title='Volume',
                    overlaying='y',
                    side='right'
                ),
                xaxis_title='Time',
                hovermode='x',
                height=600
            )
            
            st.plotly_chart(fig, use_container_width=True)
            
            # 현재 가격 정보
            current_price = df['close'].iloc[-1]
            price_change = ((df['close'].iloc[-1] - df['close'].iloc[0]) / df['close'].iloc[0]) * 100
            
            col1, col2, col3, col4 = st.columns(4)
            with col1:
                st.metric("현재가", f"${current_price:,.2f}", f"{price_change:+.2f}%")
            with col2:
                st.metric("24시간 최고", f"${df['high'].max():,.2f}")
            with col3:
                st.metric("24시간 최저", f"${df['low'].min():,.2f}")
            with col4:
                st.metric("거래량", f"{df['volume'].sum():,.0f}")
        else:
            st.warning("데이터를 불러올 수 없습니다.")
            
    except Exception as e:
        st.error(f"차트 데이터 로딩 실패: {e}")
        st.info("바이낸스 API 키 설정을 확인해주세요.")
    
    # 기술적 지표
    with st.expander("📊 기술적 지표", expanded=False):
        col1, col2, col3 = st.columns(3)
        with col1:
            st.checkbox("SMA (20)")
            st.checkbox("EMA (20)")
            st.checkbox("볼린저 밴드")
        with col2:
            st.checkbox("RSI (14)")
            st.checkbox("MACD")
            st.checkbox("Stochastic")
        with col3:
            st.checkbox("Volume Profile")
            st.checkbox("ATR")
            st.checkbox("Ichimoku")


def show_order_page():
    """주문 실행 페이지"""
    st.subheader("💰 주문 실행")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("### 매수 주문")
        with st.form("buy_order"):
            symbol = st.selectbox("심볼", ["BTCUSDT", "ETHUSDT", "BNBUSDT"])
            order_type = st.radio("주문 유형", ["시장가", "지정가"])
            
            if order_type == "지정가":
                price = st.number_input("가격 (USDT)", min_value=0.0, step=0.01)
            
            quantity = st.number_input("수량", min_value=0.0, step=0.001)
            total = st.number_input("총액 (USDT)", min_value=0.0, disabled=True)
            
            if st.form_submit_button("매수 실행", type="primary", use_container_width=True):
                st.success("주문이 접수되었습니다.")
    
    with col2:
        st.markdown("### 매도 주문")
        with st.form("sell_order"):
            symbol = st.selectbox("심볼", ["BTCUSDT", "ETHUSDT", "BNBUSDT"])
            order_type = st.radio("주문 유형", ["시장가", "지정가"])
            
            if order_type == "지정가":
                price = st.number_input("가격 (USDT)", min_value=0.0, step=0.01)
            
            quantity = st.number_input("수량", min_value=0.0, step=0.001)
            total = st.number_input("총액 (USDT)", min_value=0.0, disabled=True)
            
            if st.form_submit_button("매도 실행", type="secondary", use_container_width=True):
                st.success("주문이 접수되었습니다.")
    
    # 미체결 주문
    st.markdown("### 📋 미체결 주문")
    st.info("미체결 주문이 없습니다.")


def show_portfolio():
    """포트폴리오 페이지"""
    st.subheader("💼 보유 자산")
    
    # 포트폴리오 요약
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("총 평가액", "$45,678", "+$5,234")
    with col2:
        st.metric("일일 손익", "+$1,234", "+2.7%")
    with col3:
        st.metric("실현 손익", "+$8,456", "+18.5%")
    with col4:
        st.metric("미실현 손익", "+$3,234", "+7.1%")
    
    # 자산 목록
    portfolio_data = pd.DataFrame({
        "자산": ["BTC", "ETH", "BNB", "SOL", "ADA", "XRP"],
        "수량": [0.5, 5.2, 12.5, 45.0, 1500.0, 3000.0],
        "평균 매수가": ["$38,000", "$2,000", "$330", "$80", "$0.42", "$0.50"],
        "현재가": ["$42,000", "$2,200", "$320", "$98", "$0.45", "$0.52"],
        "평가액": ["$21,000", "$11,440", "$4,000", "$4,410", "$675", "$1,560"],
        "손익": ["+$2,000", "+$1,040", "-$125", "+$810", "+$45", "+$60"],
        "수익률": ["+10.5%", "+10.0%", "-3.0%", "+22.5%", "+7.1%", "+4.0%"]
    })
    
    st.dataframe(portfolio_data, use_container_width=True)
    
    # 포트폴리오 차트
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("### 자산 배분")
        fig = go.Figure(data=[go.Pie(
            labels=portfolio_data["자산"],
            values=[21000, 11440, 4000, 4410, 675, 1560],
            hole=.3
        )])
        fig.update_layout(height=400)
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        st.markdown("### 수익률 분포")
        fig = go.Figure(data=[go.Bar(
            x=portfolio_data["자산"],
            y=[10.5, 10.0, -3.0, 22.5, 7.1, 4.0],
            marker_color=['green' if x > 0 else 'red' for x in [10.5, 10.0, -3.0, 22.5, 7.1, 4.0]]
        )])
        fig.update_layout(height=400, yaxis_title="수익률 (%)")
        st.plotly_chart(fig, use_container_width=True)


def show_trading_history():
    """거래 내역 페이지"""
    st.subheader("📜 거래 내역")
    
    # 필터
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        date_range = st.date_input("기간", value=(datetime.now() - timedelta(days=30), datetime.now()))
    with col2:
        symbol = st.selectbox("심볼", ["전체", "BTCUSDT", "ETHUSDT", "BNBUSDT"])
    with col3:
        trade_type = st.selectbox("거래 유형", ["전체", "매수", "매도"])
    with col4:
        st.button("🔍 조회", use_container_width=True)
    
    # 거래 내역 테이블
    history_data = pd.DataFrame({
        "시간": pd.date_range(start="2024-01-01", periods=20, freq="D"),
        "심볼": ["BTCUSDT", "ETHUSDT", "BNBUSDT"] * 6 + ["BTCUSDT", "ETHUSDT"],
        "유형": ["매수", "매도"] * 10,
        "가격": [42000, 2200, 320, 41500, 2150, 315] * 3 + [42500, 2250],
        "수량": [0.1, 1.0, 5.0, 0.1, 1.0, 5.0] * 3 + [0.1, 1.0],
        "총액": [4200, 2200, 1600, 4150, 2150, 1575] * 3 + [4250, 2250],
        "수수료": [4.2, 2.2, 1.6, 4.15, 2.15, 1.57] * 3 + [4.25, 2.25],
        "상태": ["완료"] * 20
    })
    
    st.dataframe(history_data, use_container_width=True)
    
    # 통계
    st.markdown("### 📊 거래 통계")
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("총 거래 횟수", "152")
    with col2:
        st.metric("승률", "68%")
    with col3:
        st.metric("평균 수익", "+2.3%")
    with col4:
        st.metric("총 수수료", "$234")


def show_pnl_analysis():
    """손익 분석 페이지"""
    st.subheader("📈 손익 분석")
    
    # 기간 선택
    period = st.selectbox("분석 기간", ["오늘", "이번 주", "이번 달", "3개월", "6개월", "1년"])
    
    # 손익 요약
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("총 손익", "+$8,456", "+18.5%")
    with col2:
        st.metric("실현 손익", "+$5,234", "+12.3%")
    with col3:
        st.metric("미실현 손익", "+$3,222", "+6.2%")
    with col4:
        st.metric("최대 손실", "-$1,234", "-2.8%")
    
    # 손익 차트
    st.markdown("### 일별 손익 추이")
    dates = pd.date_range(start="2024-01-01", periods=30, freq="D")
    pnl_data = pd.DataFrame({
        "날짜": dates,
        "손익": [100, -50, 200, 150, -30, 300, 250, -100, 400, 350,
                200, 150, -50, 300, 400, 250, 100, 500, 450, 300,
                350, 400, 200, 600, 550, 400, 450, 500, 300, 700]
    })
    
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=pnl_data["날짜"],
        y=pnl_data["손익"].cumsum(),
        mode='lines',
        fill='tozeroy',
        line=dict(color='green', width=2)
    ))
    fig.update_layout(
        title="누적 손익",
        xaxis_title="날짜",
        yaxis_title="손익 (USD)",
        height=400
    )
    st.plotly_chart(fig, use_container_width=True)
    
    # 심볼별 손익
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("### 심볼별 손익")
        symbol_pnl = pd.DataFrame({
            "심볼": ["BTC", "ETH", "BNB", "SOL", "ADA"],
            "손익": [2000, 1040, -125, 810, 45],
            "수익률": [10.5, 10.0, -3.0, 22.5, 7.1]
        })
        st.dataframe(symbol_pnl, use_container_width=True)
    
    with col2:
        st.markdown("### 승패 분석")
        win_loss = pd.DataFrame({
            "구분": ["승리", "패배"],
            "횟수": [95, 45],
            "평균 수익": ["+$156", "-$67"],
            "최대 수익": ["+$1,234", "-$456"]
        })
        st.dataframe(win_loss, use_container_width=True)