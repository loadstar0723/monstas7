"""
자동매매 페이지 모듈
전략 생성, 실시간 모니터링, 성과 리포트 등
"""

import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import numpy as np
from datetime import datetime, timedelta


def show_page(page_id: str):
    """페이지 라우팅"""
    if page_id == 'bot_create':
        show_strategy_creation()
    elif page_id == 'bot_monitoring':
        show_bot_monitoring()
    elif page_id == 'bot_report':
        show_performance_report()
    elif page_id == 'bot_risk':
        show_risk_management()
    elif page_id == 'bot_alerts':
        show_alert_settings()
    else:
        st.error(f"페이지 {page_id}를 찾을 수 없습니다.")


def show_strategy_creation():
    """전략 생성 페이지"""
    st.subheader("🤖 자동매매 전략 생성")
    
    # 전략 유형 선택
    strategy_type = st.selectbox(
        "전략 유형",
        ["AI 기반 전략", "기술적 지표 전략", "그리드 트레이딩", "차익거래", "DCA (분할매수)"]
    )
    
    if strategy_type == "AI 기반 전략":
        show_ai_strategy_form()
    elif strategy_type == "기술적 지표 전략":
        show_technical_strategy_form()
    elif strategy_type == "그리드 트레이딩":
        show_grid_strategy_form()
    elif strategy_type == "차익거래":
        show_arbitrage_strategy_form()
    else:  # DCA
        show_dca_strategy_form()


def show_ai_strategy_form():
    """AI 기반 전략 폼"""
    st.markdown("### 🤖 AI 전략 설정")
    
    with st.form("ai_strategy"):
        col1, col2 = st.columns(2)
        
        with col1:
            strategy_name = st.text_input("전략 이름")
            selected_models = st.multiselect(
                "사용할 AI 모델",
                ["LSTM", "GRU", "Transformer", "XGBoost", "Ensemble"]
            )
            min_confidence = st.slider("최소 신뢰도 (%)", 50, 100, 75)
            max_position = st.number_input("최대 포지션 크기 (USDT)", value=10000.0)
        
        with col2:
            symbols = st.multiselect(
                "거래 대상",
                ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"],
                default=["BTCUSDT"]
            )
            stop_loss = st.number_input("손절 (%)", value=5.0, step=0.5)
            take_profit = st.number_input("익절 (%)", value=10.0, step=0.5)
            trailing_stop = st.checkbox("트레일링 스탑 사용")
        
        st.markdown("### 🎯 진입/청산 조건")
        
        col1, col2 = st.columns(2)
        with col1:
            entry_condition = st.text_area(
                "진입 조건",
                "AI 신호가 '강한 매수'이고\n신뢰도가 75% 이상일 때"
            )
        with col2:
            exit_condition = st.text_area(
                "청산 조건",
                "AI 신호가 '매도'로 변경되거나\n손절/익절 도달 시"
            )
        
        submitted = st.form_submit_button("전략 생성", use_container_width=True)
        if submitted:
            st.success(f"'{strategy_name}' 전략이 생성되었습니다!")


def show_technical_strategy_form():
    """기술적 지표 전략 폼"""
    st.markdown("### 📊 기술적 지표 전략 설정")
    
    with st.form("tech_strategy"):
        strategy_name = st.text_input("전략 이름")
        
        st.markdown("#### 지표 선택")
        col1, col2, col3 = st.columns(3)
        
        with col1:
            use_rsi = st.checkbox("RSI")
            if use_rsi:
                rsi_period = st.number_input("RSI 기간", value=14)
                rsi_oversold = st.number_input("과매도", value=30)
                rsi_overbought = st.number_input("과매수", value=70)
        
        with col2:
            use_macd = st.checkbox("MACD")
            if use_macd:
                macd_fast = st.number_input("Fast", value=12)
                macd_slow = st.number_input("Slow", value=26)
                macd_signal = st.number_input("Signal", value=9)
        
        with col3:
            use_bb = st.checkbox("Bollinger Bands")
            if use_bb:
                bb_period = st.number_input("BB 기간", value=20)
                bb_std = st.number_input("표준편차", value=2.0)
        
        submitted = st.form_submit_button("전략 생성", use_container_width=True)


def show_grid_strategy_form():
    """그리드 트레이딩 전략 폼"""
    st.markdown("### 📊 그리드 트레이딩 설정")
    
    with st.form("grid_strategy"):
        col1, col2 = st.columns(2)
        
        with col1:
            strategy_name = st.text_input("전략 이름")
            symbol = st.selectbox("심볼", ["BTCUSDT", "ETHUSDT", "BNBUSDT"])
            upper_price = st.number_input("상단 가격", value=45000.0)
            lower_price = st.number_input("하단 가격", value=40000.0)
        
        with col2:
            grid_count = st.number_input("그리드 개수", value=20, min_value=2)
            investment = st.number_input("투자 금액 (USDT)", value=10000.0)
            grid_type = st.radio("그리드 타입", ["산술", "기하"])
        
        submitted = st.form_submit_button("그리드 생성", use_container_width=True)


def show_arbitrage_strategy_form():
    """차익거래 전략 폼"""
    st.markdown("### 💱 차익거래 설정")
    
    with st.form("arb_strategy"):
        strategy_name = st.text_input("전략 이름")
        arb_type = st.selectbox(
            "차익거래 유형",
            ["삼각 차익거래", "거래소간 차익거래", "선물-현물 차익거래"]
        )
        
        min_profit = st.number_input("최소 수익률 (%)", value=0.5, step=0.1)
        max_exposure = st.number_input("최대 노출 금액 (USDT)", value=5000.0)
        
        submitted = st.form_submit_button("전략 생성", use_container_width=True)


def show_dca_strategy_form():
    """DCA 전략 폼"""
    st.markdown("### 💰 DCA (분할매수) 설정")
    
    with st.form("dca_strategy"):
        col1, col2 = st.columns(2)
        
        with col1:
            strategy_name = st.text_input("전략 이름")
            symbol = st.selectbox("심볼", ["BTCUSDT", "ETHUSDT", "BNBUSDT"])
            interval = st.selectbox("매수 주기", ["매일", "매주", "매월"])
        
        with col2:
            amount_per_buy = st.number_input("회당 매수 금액 (USDT)", value=100.0)
            total_budget = st.number_input("총 예산 (USDT)", value=10000.0)
            price_deviation = st.number_input("가격 편차 매수 (%)", value=5.0)
        
        submitted = st.form_submit_button("DCA 시작", use_container_width=True)


def show_bot_monitoring():
    """봇 모니터링 페이지"""
    st.subheader("📊 실시간 봇 모니터링")
    
    # 실행 중인 봇 현황
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("실행 중인 봇", "5", "+2")
    with col2:
        st.metric("오늘 수익", "$1,234", "+12.5%")
    with col3:
        st.metric("진행 중 거래", "3")
    with col4:
        st.metric("총 수익률", "+28.5%")
    
    # 봇 상태 테이블
    st.markdown("### 🤖 봇 상태")
    
    bot_status = pd.DataFrame({
        "봇 이름": ["AI 트레이더", "그리드 봇", "DCA 봇", "스캘핑 봇", "차익거래 봇"],
        "상태": ["🟢 실행중", "🟢 실행중", "🟡 대기", "🟢 실행중", "🔴 중지"],
        "심볼": ["BTCUSDT", "ETHUSDT", "BNBUSDT", "BTCUSDT", "Multi"],
        "수익률": ["+15.2%", "+8.5%", "+3.2%", "+22.1%", "-2.5%"],
        "거래 횟수": [45, 123, 15, 234, 67],
        "시작 시간": ["2024-01-15", "2024-01-10", "2024-01-20", "2024-01-18", "2024-01-12"]
    })
    
    st.dataframe(bot_status, use_container_width=True)
    
    # 실시간 거래 로그
    st.markdown("### 📜 실시간 거래 로그")
    
    with st.container():
        log_data = [
            "[14:32:15] AI 트레이더: BTCUSDT 매수 신호 감지 (신뢰도: 85%)",
            "[14:32:16] AI 트레이더: 0.1 BTC @ $42,150 매수 주문 실행",
            "[14:32:17] 그리드 봇: ETHUSDT 그리드 #12 도달",
            "[14:32:18] 그리드 봇: 1 ETH @ $2,200 매도 주문 실행",
            "[14:32:20] 스캘핑 봇: BTCUSDT 단기 변동성 증가 감지",
            "[14:32:21] DCA 봇: 정기 매수 대기 중 (다음 매수: 15:00)"
        ]
        
        for log in log_data:
            st.text(log)
    
    # 성과 차트
    st.markdown("### 📈 봇별 성과")
    
    dates = pd.date_range(start="2024-01-01", periods=30, freq="D")
    performance = pd.DataFrame({
        "날짜": dates,
        "AI 트레이더": np.cumsum(np.random.randn(30) * 100) + 10000,
        "그리드 봇": np.cumsum(np.random.randn(30) * 50) + 10000,
        "스캘핑 봇": np.cumsum(np.random.randn(30) * 80) + 10000
    })
    
    fig = go.Figure()
    for col in ["AI 트레이더", "그리드 봇", "스캘핑 봇"]:
        fig.add_trace(go.Scatter(
            x=performance["날짜"],
            y=performance[col],
            mode='lines',
            name=col
        ))
    
    fig.update_layout(
        title="봇별 수익 곡선",
        xaxis_title="날짜",
        yaxis_title="포트폴리오 가치 ($)",
        height=400
    )
    st.plotly_chart(fig, use_container_width=True)


def show_performance_report():
    """성과 리포트 페이지"""
    st.subheader("📊 자동매매 성과 리포트")
    
    # 기간 선택
    period = st.selectbox("리포트 기간", ["오늘", "이번 주", "이번 달", "3개월", "전체"])
    
    # 전체 성과
    st.markdown("### 📈 전체 성과")
    
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("총 수익", "$12,345", "+28.5%")
    with col2:
        st.metric("승률", "68%", "+5%")
    with col3:
        st.metric("평균 수익", "+2.3%")
    with col4:
        st.metric("샤프 비율", "1.85")
    
    # 봇별 성과 비교
    st.markdown("### 🤖 봇별 성과 비교")
    
    bot_performance = pd.DataFrame({
        "봇 이름": ["AI 트레이더", "그리드 봇", "DCA 봇", "스캘핑 봇", "차익거래 봇"],
        "수익률": [28.5, 15.2, 8.3, 22.1, -2.5],
        "거래 횟수": [245, 523, 45, 1234, 167],
        "승률": [68, 55, 72, 61, 45],
        "최대 손실": [-8.2, -5.3, -2.1, -12.5, -15.8]
    })
    
    fig = go.Figure()
    fig.add_trace(go.Bar(
        x=bot_performance["봇 이름"],
        y=bot_performance["수익률"],
        marker_color=['green' if x > 0 else 'red' for x in bot_performance["수익률"]]
    ))
    
    fig.update_layout(
        title="봇별 수익률",
        xaxis_title="봇",
        yaxis_title="수익률 (%)",
        height=400
    )
    st.plotly_chart(fig, use_container_width=True)
    
    # 상세 통계
    st.markdown("### 📊 상세 통계")
    st.dataframe(bot_performance, use_container_width=True)
    
    # 월별 성과
    st.markdown("### 📅 월별 성과")
    
    monthly_performance = pd.DataFrame({
        "월": ["1월", "2월", "3월", "4월", "5월", "6월"],
        "수익": [2345, 1856, 3234, 2891, 4123, 3567],
        "거래 횟수": [234, 189, 267, 245, 312, 298]
    })
    
    col1, col2 = st.columns(2)
    
    with col1:
        fig = go.Figure()
        fig.add_trace(go.Bar(
            x=monthly_performance["월"],
            y=monthly_performance["수익"],
            name="수익 ($)"
        ))
        fig.update_layout(title="월별 수익", height=300)
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        fig = go.Figure()
        fig.add_trace(go.Line(
            x=monthly_performance["월"],
            y=monthly_performance["거래 횟수"],
            name="거래 횟수"
        ))
        fig.update_layout(title="월별 거래 횟수", height=300)
        st.plotly_chart(fig, use_container_width=True)


def show_risk_management():
    """리스크 관리 페이지"""
    st.subheader("⚠️ 리스크 관리")
    
    # 리스크 지표
    st.markdown("### 📊 리스크 지표")
    
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("최대 손실 (MDD)", "-12.5%", "위험")
    with col2:
        st.metric("VaR (95%)", "$2,345")
    with col3:
        st.metric("변동성", "18.5%", "+2.3%")
    with col4:
        st.metric("노출 비율", "65%", "안전")
    
    # 리스크 설정
    st.markdown("### ⚙️ 리스크 설정")
    
    with st.form("risk_settings"):
        col1, col2 = st.columns(2)
        
        with col1:
            max_drawdown = st.slider("최대 허용 손실 (%)", 0, 50, 20)
            max_position_size = st.slider("최대 포지션 크기 (%)", 0, 100, 30)
            max_daily_loss = st.number_input("일일 최대 손실 (USDT)", value=1000.0)
        
        with col2:
            stop_loss_default = st.number_input("기본 손절 (%)", value=5.0)
            risk_per_trade = st.slider("거래당 리스크 (%)", 0.5, 5.0, 2.0, step=0.5)
            leverage_limit = st.selectbox("최대 레버리지", ["1x", "2x", "3x", "5x", "10x"])
        
        submitted = st.form_submit_button("설정 저장", use_container_width=True)
        if submitted:
            st.success("리스크 설정이 저장되었습니다.")
    
    # 리스크 히트맵
    st.markdown("### 🔥 리스크 히트맵")
    
    strategies = ["AI 트레이더", "그리드 봇", "DCA 봇", "스캘핑 봇", "차익거래 봇"]
    risk_factors = ["변동성", "노출도", "레버리지", "상관관계", "유동성"]
    
    risk_matrix = np.random.uniform(0, 100, (5, 5))
    
    fig = go.Figure(data=go.Heatmap(
        z=risk_matrix,
        x=risk_factors,
        y=strategies,
        colorscale='RdYlGn_r',
        text=risk_matrix.round(1),
        texttemplate="%{text}",
        textfont={"size": 10},
        colorbar=dict(title="리스크 레벨")
    ))
    
    fig.update_layout(
        title="전략별 리스크 매트릭스",
        height=400
    )
    st.plotly_chart(fig, use_container_width=True)


def show_alert_settings():
    """알림 설정 페이지"""
    st.subheader("🔔 알림 설정")
    
    # 알림 채널
    st.markdown("### 📢 알림 채널")
    
    col1, col2, col3 = st.columns(3)
    with col1:
        email_alert = st.checkbox("이메일 알림", value=True)
        if email_alert:
            email = st.text_input("이메일 주소", "user@example.com")
    
    with col2:
        telegram_alert = st.checkbox("텔레그램 알림", value=True)
        if telegram_alert:
            telegram_id = st.text_input("텔레그램 ID", "@username")
    
    with col3:
        push_alert = st.checkbox("푸시 알림")
        if push_alert:
            device_token = st.text_input("디바이스 토큰")
    
    # 알림 조건
    st.markdown("### ⚙️ 알림 조건")
    
    alert_conditions = pd.DataFrame({
        "조건": ["거래 체결", "손절 도달", "익절 도달", "큰 손실 발생", "봇 오류", "일일 리포트"],
        "이메일": [True, True, False, True, True, True],
        "텔레그램": [True, True, True, True, True, False],
        "푸시": [False, True, False, True, True, False],
        "상태": ["활성", "활성", "활성", "활성", "활성", "활성"]
    })
    
    st.dataframe(alert_conditions, use_container_width=True)
    
    # 커스텀 알림 규칙
    st.markdown("### 📝 커스텀 알림 규칙")
    
    with st.form("custom_alert"):
        col1, col2 = st.columns(2)
        
        with col1:
            rule_name = st.text_input("규칙 이름")
            condition_type = st.selectbox(
                "조건 유형",
                ["가격 도달", "수익률 도달", "거래량 급증", "변동성 증가", "AI 신호"]
            )
        
        with col2:
            threshold = st.number_input("임계값", value=100.0)
            alert_frequency = st.selectbox(
                "알림 빈도",
                ["즉시", "5분마다", "시간당 1회", "일 1회"]
            )
        
        alert_message = st.text_area("알림 메시지 템플릿", 
                                     "[{time}] {rule_name}: {condition} 조건 충족 (값: {value})")
        
        submitted = st.form_submit_button("규칙 추가", use_container_width=True)
        if submitted:
            st.success(f"'{rule_name}' 알림 규칙이 추가되었습니다.")
    
    # 알림 히스토리
    st.markdown("### 📜 최근 알림")
    
    alert_history = pd.DataFrame({
        "시간": pd.date_range(start="2024-01-01 12:00", periods=10, freq="30T"),
        "유형": ["거래 체결", "손절 도달", "AI 신호", "거래 체결", "익절 도달",
                "봇 오류", "거래 체결", "큰 손실", "AI 신호", "일일 리포트"],
        "메시지": [
            "BTCUSDT 0.1 BTC 매수 체결",
            "ETHUSDT 손절가 도달 (-5%)",
            "BTCUSDT 강한 매수 신호 (85%)",
            "BNBUSDT 5 BNB 매도 체결",
            "SOLUSDT 익절가 도달 (+10%)",
            "그리드 봇 API 연결 오류",
            "BTCUSDT 0.05 BTC 매수 체결",
            "일일 최대 손실 도달 (-$500)",
            "ETHUSDT 매수 신호 (78%)",
            "오늘 수익: +$1,234 (+12.5%)"
        ],
        "채널": ["이메일, 텔레그램", "모든 채널", "텔레그램", "이메일", "텔레그램",
                "모든 채널", "이메일", "모든 채널", "텔레그램", "이메일"]
    })
    
    st.dataframe(alert_history, use_container_width=True)