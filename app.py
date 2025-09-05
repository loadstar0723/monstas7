"""
MONSTA Trading Platform - 메인 애플리케이션
퀀텀 AI 크립토 트레이딩 플랫폼
"""

import streamlit as st
import os
import sys
from datetime import datetime
from pathlib import Path

# 프로젝트 경로 추가
sys.path.append(str(Path(__file__).parent))

# 페이지 설정
st.set_page_config(
    page_title="MONSTA - 퀀텀 AI 크립토 트레이딩",
    page_icon="🚀",
    layout="wide",
    initial_sidebar_state="expanded"
)

# 세션 상태 초기화
if 'logged_in' not in st.session_state:
    st.session_state['logged_in'] = False
    st.session_state['user_role'] = None
    st.session_state['user_id'] = None
    st.session_state['user_email'] = None
    st.session_state['current_page'] = 'main'

# 사이드바 네비게이션
with st.sidebar:
    st.image("https://via.placeholder.com/300x100/9333ea/ffffff?text=MONSTA", use_column_width=True)
    st.markdown("---")
    
    # 로그인 상태 표시
    if st.session_state.logged_in:
        st.success(f"👤 {st.session_state.user_email}")
        st.info(f"역할: {st.session_state.user_role}")
        st.markdown("---")
    
    # 메뉴 옵션
    st.markdown("### 🧭 네비게이션")
    
    menu_options = {
        "메인": "main",
        "실시간 트레이딩": "trading",
        "AI 분석": "ai_analysis",
        "포트폴리오": "portfolio",
        "백테스팅": "backtesting",
        "텔레그램 봇": "telegram",
        "소셜 트레이딩": "social",
        "교육센터": "education",
        "뉴스 & 분석": "news"
    }
    
    # 사용자 역할별 추가 메뉴
    if st.session_state.logged_in:
        if st.session_state.user_role == 'admin':
            menu_options.update({
                "관리자 대시보드": "admin",
                "회원 관리": "members_management",
                "시스템 설정": "settings"
            })
        elif st.session_state.user_role == 'headquarters':
            menu_options.update({
                "본사 대시보드": "headquarters",
                "대리점 관리": "branch_management"
            })
        elif st.session_state.user_role == 'branch':
            menu_options.update({
                "대리점 대시보드": "branch",
                "회원 관리": "member_management"
            })
    else:
        menu_options.update({
            "로그인": "login",
            "회원가입": "signup"
        })
    
    # 메뉴 선택
    selected_page = None
    for label, page in menu_options.items():
        if st.button(label, use_container_width=True):
            st.session_state.current_page = page
            st.rerun()
    
    # 로그아웃 버튼
    if st.session_state.logged_in:
        st.markdown("---")
        if st.button("🚪 로그아웃", use_container_width=True):
            st.session_state.logged_in = False
            st.session_state.user_role = None
            st.session_state.user_id = None
            st.session_state.user_email = None
            st.session_state.current_page = 'main'
            st.rerun()
    
    # 푸터
    st.markdown("---")
    st.caption("© 2024 MONSTA")
    st.caption("Version 2.0.0")

# 페이지 라우팅
current_page = st.session_state.current_page

# 메인 페이지
if current_page == 'main':
    import main
    main.main()

# 트레이딩 페이지
elif current_page == 'trading':
    try:
        from pages import trading
        trading.show_page('trade_view')
    except ImportError:
        st.error("트레이딩 페이지 모듈을 찾을 수 없습니다.")
        st.info("개발 중인 기능입니다.")

# AI 분석 페이지
elif current_page == 'ai_analysis':
    try:
        from pages import ai_analysis
        ai_analysis.show_page('ai_predict')
    except ImportError:
        st.error("AI 분석 페이지 모듈을 찾을 수 없습니다.")
        st.info("개발 중인 기능입니다.")

# 포트폴리오 페이지
elif current_page == 'portfolio':
    try:
        from pages import portfolio
        portfolio.show_page('portfolio_overview')
    except ImportError:
        st.error("포트폴리오 페이지 모듈을 찾을 수 없습니다.")
        st.info("개발 중인 기능입니다.")

# 백테스팅 페이지
elif current_page == 'backtesting':
    try:
        from pages import backtesting
        backtesting.show_page('backtest_setup')
    except ImportError:
        st.error("백테스팅 페이지 모듈을 찾을 수 없습니다.")
        st.info("개발 중인 기능입니다.")

# 텔레그램 봇 페이지
elif current_page == 'telegram':
    try:
        from pages import telegram
        telegram.show_page('telegram_setup')
    except ImportError:
        st.error("텔레그램 봇 페이지 모듈을 찾을 수 없습니다.")
        st.info("개발 중인 기능입니다.")

# 소셜 트레이딩 페이지
elif current_page == 'social':
    try:
        from pages import social_trading
        social_trading.show_page('social_feed')
    except ImportError:
        st.error("소셜 트레이딩 페이지 모듈을 찾을 수 없습니다.")
        st.info("개발 중인 기능입니다.")

# 교육센터 페이지
elif current_page == 'education':
    try:
        from pages import education
        education.show_page('edu_courses')
    except ImportError:
        st.error("교육센터 페이지 모듈을 찾을 수 없습니다.")
        st.info("개발 중인 기능입니다.")

# 뉴스 페이지
elif current_page == 'news':
    try:
        from pages import news
        news.show_page('news_feed')
    except ImportError:
        st.error("뉴스 페이지 모듈을 찾을 수 없습니다.")
        st.info("개발 중인 기능입니다.")

# 로그인 페이지
elif current_page == 'login':
    try:
        from pages import login
        login.show_page('login')
    except ImportError:
        st.error("로그인 페이지 모듈을 찾을 수 없습니다.")

# 회원가입 페이지
elif current_page == 'signup':
    try:
        from pages import signup
        signup.show_page('signup')
    except ImportError:
        st.error("회원가입 페이지 모듈을 찾을 수 없습니다.")

# 관리자 페이지
elif current_page == 'admin':
    if st.session_state.logged_in and st.session_state.user_role == 'admin':
        try:
            from pages import admin_dashboard
            admin_dashboard.show_page('admin_overview')
        except ImportError:
            st.error("관리자 대시보드 모듈을 찾을 수 없습니다.")
    else:
        st.error("관리자 권한이 필요합니다.")

# 회원 관리 페이지
elif current_page == 'members_management':
    if st.session_state.logged_in and st.session_state.user_role == 'admin':
        try:
            from pages import members_management
            members_management.show_page('member_list')
        except ImportError:
            st.error("회원 관리 모듈을 찾을 수 없습니다.")
    else:
        st.error("관리자 권한이 필요합니다.")

# 본사 대시보드
elif current_page == 'headquarters':
    if st.session_state.logged_in and st.session_state.user_role == 'headquarters':
        try:
            from pages import headquarters_dashboard
            headquarters_dashboard.show_page('hq_overview')
        except ImportError:
            st.error("본사 대시보드 모듈을 찾을 수 없습니다.")
    else:
        st.error("본사 권한이 필요합니다.")

# 대리점 관리
elif current_page == 'branch_management':
    if st.session_state.logged_in and st.session_state.user_role == 'headquarters':
        try:
            from pages import branch_management
            branch_management.show_page('branch_list')
        except ImportError:
            st.error("대리점 관리 모듈을 찾을 수 없습니다.")
    else:
        st.error("본사 권한이 필요합니다.")

# 대리점 대시보드
elif current_page == 'branch':
    if st.session_state.logged_in and st.session_state.user_role == 'branch':
        try:
            from pages import branch_dashboard
            branch_dashboard.show_page('branch_overview')
        except ImportError:
            st.error("대리점 대시보드 모듈을 찾을 수 없습니다.")
    else:
        st.error("대리점 권한이 필요합니다.")

# 대리점 회원 관리
elif current_page == 'member_management':
    if st.session_state.logged_in and st.session_state.user_role == 'branch':
        try:
            from pages import member_management
            member_management.show_page('member_list')
        except ImportError:
            st.error("회원 관리 모듈을 찾을 수 없습니다.")
    else:
        st.error("대리점 권한이 필요합니다.")

# 시스템 설정
elif current_page == 'settings':
    if st.session_state.logged_in and st.session_state.user_role == 'admin':
        try:
            from pages import settings
            settings.show_page('system_settings')
        except ImportError:
            st.error("시스템 설정 모듈을 찾을 수 없습니다.")
    else:
        st.error("관리자 권한이 필요합니다.")

else:
    # 기본 페이지 (메인으로 리디렉션)
    st.session_state.current_page = 'main'
    st.rerun()