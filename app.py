"""
MONSTA Trading Platform - 메인 애플리케이션
"""

import streamlit as st
import os
import sys
from datetime import datetime
from pathlib import Path

# 프로젝트 경로 추가
sys.path.append(str(Path(__file__).parent))

from config import STREAMLIT_CONFIG, USER_ROLES
from components.menu import render_sidebar_menu, get_page_title
from services.binance_api import get_binance_client, get_top_gainers, get_top_losers, get_top_volume
import pages  # 페이지 모듈 임포트

# 페이지 설정
st.set_page_config(
    page_title=STREAMLIT_CONFIG['page_title'],
    page_icon=STREAMLIT_CONFIG['page_icon'],
    layout=STREAMLIT_CONFIG['layout'],
    initial_sidebar_state=STREAMLIT_CONFIG['initial_sidebar_state']
)

# 세션 상태 초기화
if 'logged_in' not in st.session_state:
    st.session_state['logged_in'] = False
    st.session_state['user_role'] = None
    st.session_state['user_id'] = None
    st.session_state['user_email'] = None
    st.session_state['current_page'] = 'dashboard'

# CSS 스타일
st.markdown("""
    <style>
    /* 메인 컨테이너 스타일 */
    .main {
        padding: 0rem 1rem;
    }
    
    /* 헤더 스타일 */
    .header-container {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 2rem;
        border-radius: 10px;
        margin-bottom: 2rem;
        color: white;
    }
    
    .header-title {
        font-size: 2.5rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
    }
    
    .header-subtitle {
        font-size: 1.2rem;
        opacity: 0.9;
    }
    
    /* 카드 스타일 */
    .stat-card {
        background: white;
        padding: 1.5rem;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin-bottom: 1rem;
    }
    
    .stat-value {
        font-size: 2rem;
        font-weight: bold;
        color: #1f77b4;
    }
    
    .stat-label {
        color: #666;
        margin-top: 0.5rem;
    }
    
    .positive {
        color: #28a745;
    }
    
    .negative {
        color: #dc3545;
    }
    
    /* 메뉴 스타일 */
    .sidebar .sidebar-content {
        background-color: #f8f9fa;
    }
    
    /* 버튼 스타일 */
    .stButton > button {
        width: 100%;
        border-radius: 5px;
        padding: 0.5rem 1rem;
        font-weight: 500;
        transition: all 0.3s;
    }
    
    .stButton > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    /* 테이블 스타일 */
    .dataframe {
        font-size: 0.9rem;
    }
    
    /* 탭 스타일 */
    .stTabs [data-baseweb="tab-list"] {
        gap: 2px;
    }
    
    .stTabs [data-baseweb="tab"] {
        padding: 10px 20px;
        background-color: #f0f2f6;
        border-radius: 5px 5px 0 0;
    }
    
    .stTabs [aria-selected="true"] {
        background-color: #1f77b4;
        color: white;
    }
    </style>
""", unsafe_allow_html=True)


def show_login_page():
    """로그인 페이지 표시"""
    st.markdown("""
        <div class="header-container">
            <div class="header-title">🚀 MONSTA Trading Platform</div>
            <div class="header-subtitle">AI 기반 암호화폐 트레이딩 플랫폼</div>
        </div>
    """, unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col2:
        st.markdown("### 🔐 로그인")
        
        with st.form("login_form"):
            email = st.text_input("이메일", placeholder="email@example.com")
            password = st.text_input("비밀번호", type="password")
            role = st.selectbox("역할 선택 (데모)", [
                "구독자 (Subscriber)",
                "대리점 (Agency)",
                "총판 (Distributor)",
                "본사 (Headquarters)"
            ])
            
            submitted = st.form_submit_button("로그인", use_container_width=True)
            
            if submitted:
                # 데모를 위한 임시 로그인 처리
                # 실제로는 데이터베이스에서 인증 처리
                role_map = {
                    "구독자 (Subscriber)": "subscriber",
                    "대리점 (Agency)": "agency",
                    "총판 (Distributor)": "distributor",
                    "본사 (Headquarters)": "headquarters"
                }
                
                st.session_state['logged_in'] = True
                st.session_state['user_role'] = role_map[role]
                st.session_state['user_email'] = email
                st.session_state['user_id'] = 1  # 데모용 ID
                st.rerun()
        
        st.markdown("---")
        
        col1, col2 = st.columns(2)
        with col1:
            st.button("회원가입", use_container_width=True)
        with col2:
            st.button("비밀번호 찾기", use_container_width=True)
        
        # 플랫폼 특징 소개
        st.markdown("### ✨ 주요 특징")
        
        features = {
            "🤖 11개 AI 모델": "LSTM, GRU, XGBoost 등 최신 AI 모델 통합",
            "📊 실시간 데이터": "바이낸스 실시간 데이터 연동",
            "💎 6단계 구독": "Basic부터 Enterprise까지 다양한 플랜",
            "🔄 자동매매": "AI 기반 자동매매 시스템",
            "📈 30+ 지표": "다양한 기술적 분석 지표 제공",
            "💰 리퍼럴 시스템": "최대 3단계 추천 수수료"
        }
        
        for title, desc in features.items():
            st.markdown(f"**{title}**")
            st.caption(desc)


def show_main_page():
    """메인 페이지 표시"""
    # 사이드바
    with st.sidebar:
        # 사용자 정보 표시
        st.markdown(f"""
            <div style='padding: 1rem; background-color: #f0f2f6; border-radius: 10px; margin-bottom: 1rem;'>
                <div style='font-weight: bold; color: #1f77b4;'>👤 {st.session_state['user_email']}</div>
                <div style='color: #666; font-size: 0.9rem;'>역할: {st.session_state['user_role'].upper()}</div>
            </div>
        """, unsafe_allow_html=True)
        
        # 메뉴 렌더링
        selected_page = render_sidebar_menu(st.session_state['user_role'])
        
        # 로그아웃 버튼
        st.markdown("---")
        if st.button("🚪 로그아웃", use_container_width=True):
            for key in ['logged_in', 'user_role', 'user_id', 'user_email', 'current_page']:
                if key in st.session_state:
                    del st.session_state[key]
            st.rerun()
    
    # 메인 컨텐츠
    page_title = get_page_title(selected_page, st.session_state['user_role'])
    
    # 페이지 헤더
    st.markdown(f"""
        <div style='padding: 1rem 0; border-bottom: 2px solid #e0e0e0; margin-bottom: 2rem;'>
            <h1 style='color: #1f77b4; margin: 0;'>{page_title}</h1>
        </div>
    """, unsafe_allow_html=True)
    
    # 페이지 라우팅
    if selected_page == 'dashboard':
        show_dashboard()
    elif selected_page.startswith('trading_'):
        pages.trading.show_page(selected_page)
    elif selected_page.startswith('ai_'):
        pages.ai_analysis.show_page(selected_page)
    elif selected_page.startswith('ta_'):
        pages.technical_analysis.show_page(selected_page)
    elif selected_page.startswith('bot_'):
        pages.auto_trading.show_page(selected_page)
    elif selected_page.startswith('edu_'):
        pages.education.show_page(selected_page)
    elif selected_page.startswith('account_'):
        pages.account.show_page(selected_page)
    elif selected_page.startswith('members_'):
        pages.members_management.show_page(selected_page)
    elif selected_page.startswith('revenue_'):
        pages.revenue_management.show_page(selected_page)
    elif selected_page.startswith('org_'):
        pages.organization_management.show_page(selected_page)
    elif selected_page.startswith('stats_'):
        pages.statistics.show_page(selected_page)
    elif selected_page.startswith('system_'):
        pages.system_settings.show_page(selected_page)
    elif selected_page.startswith('agency_'):
        pages.agency_management.show_page(selected_page)
    elif selected_page.startswith('subscriber_'):
        pages.subscriber_management.show_page(selected_page)
    elif selected_page.startswith('income_'):
        pages.income_management.show_page(selected_page)
    elif selected_page.startswith('marketing_'):
        pages.marketing.show_page(selected_page)
    elif selected_page.startswith('member_'):
        pages.member_management.show_page(selected_page)
    elif selected_page.startswith('earning_'):
        pages.earning_management.show_page(selected_page)
    elif selected_page.startswith('promo_'):
        pages.promotion.show_page(selected_page)
    else:
        st.info(f"페이지 '{selected_page}'는 개발 중입니다.")


def show_dashboard():
    """대시보드 페이지"""
    role = st.session_state['user_role']
    
    # 역할별 대시보드 표시
    if role == 'headquarters':
        show_headquarters_dashboard()
    elif role == 'distributor':
        show_distributor_dashboard()
    elif role == 'agency':
        show_agency_dashboard()
    else:  # subscriber
        show_subscriber_dashboard()


def show_headquarters_dashboard():
    """본사 대시보드"""
    # 주요 지표
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.markdown("""
            <div class='stat-card'>
                <div class='stat-value'>15,234</div>
                <div class='stat-label'>전체 회원</div>
                <div class='positive'>+12.5% ↑</div>
            </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("""
            <div class='stat-card'>
                <div class='stat-value'>₩1.2B</div>
                <div class='stat-label'>월 매출</div>
                <div class='positive'>+18.3% ↑</div>
            </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown("""
            <div class='stat-card'>
                <div class='stat-value'>8,543</div>
                <div class='stat-label'>활성 구독</div>
                <div class='negative'>-2.1% ↓</div>
            </div>
        """, unsafe_allow_html=True)
    
    with col4:
        st.markdown("""
            <div class='stat-card'>
                <div class='stat-value'>92.3%</div>
                <div class='stat-label'>AI 정확도</div>
                <div class='positive'>+0.8% ↑</div>
            </div>
        """, unsafe_allow_html=True)
    
    # 차트 영역
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("📈 매출 추이")
        st.line_chart(data={"매출": [100, 120, 115, 130, 125, 140, 135, 150, 145, 160]})
    
    with col2:
        st.subheader("👥 회원 증가 추이")
        st.area_chart(data={"신규": [50, 60, 55, 70, 65, 80, 75, 90, 85, 100],
                           "탈퇴": [10, 12, 11, 15, 13, 18, 16, 20, 17, 22]})
    
    # 실시간 시장 현황
    st.subheader("📊 실시간 시장 현황")
    tab1, tab2, tab3 = st.tabs(["🔥 상승 TOP", "💧 하락 TOP", "📊 거래량 TOP"])
    
    with tab1:
        st.info("바이낸스 API 연결 후 실시간 데이터가 표시됩니다")
    
    with tab2:
        st.info("바이낸스 API 연결 후 실시간 데이터가 표시됩니다")
    
    with tab3:
        st.info("바이낸스 API 연결 후 실시간 데이터가 표시됩니다")


def show_distributor_dashboard():
    """총판 대시보드"""
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("산하 대리점", "24개", "+2")
    with col2:
        st.metric("전체 구독자", "1,234명", "+56")
    with col3:
        st.metric("월 수수료", "₩45.6M", "+₩5.2M")
    with col4:
        st.metric("실적 달성률", "87%", "+12%")
    
    st.subheader("📊 대리점 실적 현황")
    st.bar_chart(data={"대리점A": 120, "대리점B": 95, "대리점C": 87, "대리점D": 76})


def show_agency_dashboard():
    """대리점 대시보드"""
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("가입자", "156명", "+8")
    with col2:
        st.metric("활성 구독", "142명", "+5")
    with col3:
        st.metric("월 수수료", "₩8.2M", "+₩1.1M")
    with col4:
        st.metric("갱신율", "91%", "+3%")
    
    st.subheader("📈 월별 실적")
    st.line_chart(data={"가입": [10, 12, 15, 14, 18, 20],
                       "갱신": [8, 10, 12, 11, 15, 18]})


def show_subscriber_dashboard():
    """구독자 대시보드"""
    # 포트폴리오 요약
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("포트폴리오 가치", "$45,678", "+12.3%")
    with col2:
        st.metric("오늘 수익", "$1,234", "+2.7%")
    with col3:
        st.metric("승률", "68%", "+5%")
    with col4:
        st.metric("AI 신호", "8개", "Strong Buy")
    
    # 보유 자산
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.subheader("💼 보유 자산")
        portfolio_data = {
            "자산": ["BTC", "ETH", "BNB", "SOL", "ADA"],
            "수량": [0.5, 5.2, 12.5, 45.0, 1500.0],
            "현재가": ["$42,000", "$2,200", "$320", "$98", "$0.45"],
            "평가액": ["$21,000", "$11,440", "$4,000", "$4,410", "$675"],
            "수익률": ["+15.2%", "+8.5%", "-2.3%", "+22.1%", "+5.7%"]
        }
        st.dataframe(portfolio_data, use_container_width=True)
    
    with col2:
        st.subheader("🤖 AI 예측")
        st.success("BTC: 강한 매수")
        st.info("ETH: 매수")
        st.warning("BNB: 중립")
        st.error("SOL: 매도")
    
    # 실시간 차트 (플레이스홀더)
    st.subheader("📊 BTC/USDT 실시간 차트")
    st.info("TradingView 차트 위젯이 여기에 표시됩니다")


# 메인 앱 실행
def main():
    if not st.session_state['logged_in']:
        show_login_page()
    else:
        show_main_page()


if __name__ == "__main__":
    main()