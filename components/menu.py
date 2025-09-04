"""
메뉴 시스템 컴포넌트
역할별 메뉴 구조 관리
"""

import streamlit as st
from config import USER_ROLES


def get_menu_items(role: str) -> dict:
    """역할에 따른 메뉴 항목 반환"""
    
    # 본사 메뉴
    if role == USER_ROLES['HEADQUARTERS']:
        return {
            "📌 대시보드": "dashboard",
            "💼 회원 관리": {
                "전체 회원 조회": "members_all",
                "역할 변경": "members_role",
                "권한 관리": "members_permission",
                "블랙리스트": "members_blacklist",
                "활동 로그": "members_log",
                "대량 메시지": "members_message"
            },
            "💰 수익 관리": {
                "매출 현황": "revenue_status",
                "정산 관리": "revenue_settlement",
                "수수료 설정": "revenue_commission",
                "결제 내역": "revenue_payment",
                "환불 처리": "revenue_refund",
                "세금계산서": "revenue_tax"
            },
            "🏢 조직 관리": {
                "총판 관리": "org_distributor",
                "대리점 관리": "org_agency",
                "실적 순위": "org_ranking",
                "인센티브 설정": "org_incentive",
                "계약 관리": "org_contract"
            },
            "📊 통계 분석": {
                "가입 통계": "stats_signup",
                "이탈률 분석": "stats_churn",
                "LTV 분석": "stats_ltv",
                "코호트 분석": "stats_cohort",
                "예측 모델링": "stats_prediction"
            },
            "⚙️ 시스템 설정": {
                "AI 모델 설정": "system_ai",
                "API 한도 관리": "system_api",
                "서버 모니터링": "system_server",
                "백업 관리": "system_backup",
                "보안 설정": "system_security"
            }
        }
    
    # 총판 메뉴
    elif role == USER_ROLES['DISTRIBUTOR']:
        return {
            "📌 대시보드": "dashboard",
            "👥 대리점 관리": {
                "대리점 목록": "agency_list",
                "신규 등록": "agency_register",
                "실적 관리": "agency_performance",
                "정산 관리": "agency_settlement",
                "교육 자료": "agency_education"
            },
            "💼 구독자 관리": {
                "직접 가입자": "subscriber_direct",
                "구독 현황": "subscriber_status",
                "만료 예정": "subscriber_expiring",
                "재가입 유도": "subscriber_retention"
            },
            "💰 수익 관리": {
                "수수료 내역": "income_commission",
                "정산 요청": "income_settlement",
                "인센티브": "income_incentive",
                "세금계산서": "income_tax"
            },
            "📈 마케팅": {
                "프로모션 생성": "marketing_promotion",
                "쿠폰 발행": "marketing_coupon",
                "이벤트 관리": "marketing_event",
                "홍보 자료": "marketing_material"
            }
        }
    
    # 대리점 메뉴
    elif role == USER_ROLES['AGENCY']:
        return {
            "📌 대시보드": "dashboard",
            "👥 구독자 관리": {
                "회원 목록": "member_list",
                "신규 가입": "member_register",
                "구독 갱신": "member_renewal",
                "1:1 상담": "member_support",
                "만족도 조사": "member_satisfaction"
            },
            "💰 수익 관리": {
                "수수료 내역": "earning_commission",
                "정산 현황": "earning_settlement",
                "보너스": "earning_bonus",
                "출금 신청": "earning_withdrawal"
            },
            "📢 마케팅": {
                "추천 링크": "promo_referral",
                "쿠폰 관리": "promo_coupon",
                "SNS 공유": "promo_social",
                "이메일 캠페인": "promo_email"
            }
        }
    
    # 구독자 메뉴
    else:  # SUBSCRIBER
        return {
            "📌 대시보드": "dashboard",
            "💹 트레이딩": {
                "실시간 차트": "trading_chart",
                "주문 실행": "trading_order",
                "보유 자산": "trading_portfolio",
                "거래 내역": "trading_history",
                "손익 분석": "trading_pnl"
            },
            "🤖 AI 분석": {
                "11개 모델 예측": "ai_predictions",
                "신뢰도 점수": "ai_confidence",
                "백테스팅": "ai_backtesting",
                "성과 분석": "ai_performance",
                "커스텀 전략": "ai_custom"
            },
            "📊 기술적 분석": {
                "30+ 지표": "ta_indicators",
                "패턴 인식": "ta_patterns",
                "지지/저항": "ta_support_resistance",
                "볼륨 분석": "ta_volume",
                "오더플로우": "ta_orderflow"
            },
            "🔄 자동매매": {
                "전략 생성": "bot_create",
                "실시간 모니터링": "bot_monitoring",
                "성과 리포트": "bot_report",
                "리스크 관리": "bot_risk",
                "알림 설정": "bot_alerts"
            },
            "📚 교육": {
                "트레이딩 강좌": "edu_courses",
                "전략 가이드": "edu_strategy",
                "웨비나": "edu_webinar",
                "1:1 컨설팅": "edu_consulting",
                "커뮤니티": "edu_community"
            },
            "💼 내 계정": {
                "구독 관리": "account_subscription",
                "API 설정": "account_api",
                "추천인 관리": "account_referral",
                "결제 정보": "account_payment",
                "보안 설정": "account_security"
            }
        }


def render_sidebar_menu(role: str) -> str:
    """사이드바 메뉴 렌더링"""
    menu_items = get_menu_items(role)
    selected_page = None
    
    # 메뉴 스타일링
    st.markdown("""
        <style>
        .sidebar-menu {
            padding: 0.5rem 0;
        }
        .menu-header {
            font-size: 1.1rem;
            font-weight: bold;
            margin: 0.5rem 0;
            color: #1f77b4;
        }
        .menu-item {
            padding: 0.3rem 0;
            cursor: pointer;
        }
        .menu-item:hover {
            background-color: #f0f2f6;
            border-radius: 0.3rem;
        }
        </style>
    """, unsafe_allow_html=True)
    
    # 메뉴 렌더링
    for menu_name, menu_value in menu_items.items():
        if isinstance(menu_value, dict):
            # 서브메뉴가 있는 경우
            with st.expander(menu_name, expanded=False):
                for submenu_name, submenu_value in menu_value.items():
                    if st.button(submenu_name, key=f"menu_{submenu_value}", 
                               use_container_width=True):
                        selected_page = submenu_value
        else:
            # 단일 메뉴인 경우
            if st.button(menu_name, key=f"menu_{menu_value}", 
                        use_container_width=True):
                selected_page = menu_value
    
    # 선택된 페이지 세션에 저장
    if selected_page:
        st.session_state['current_page'] = selected_page
    
    return st.session_state.get('current_page', 'dashboard')


def get_page_title(page_id: str, role: str) -> str:
    """페이지 ID로 페이지 제목 가져오기"""
    menu_items = get_menu_items(role)
    
    for menu_name, menu_value in menu_items.items():
        if isinstance(menu_value, dict):
            for submenu_name, submenu_value in menu_value.items():
                if submenu_value == page_id:
                    return submenu_name
        else:
            if menu_value == page_id:
                return menu_name.split(" ", 1)[1] if " " in menu_name else menu_name
    
    return "페이지"


def check_permission(user_role: str, page_id: str) -> bool:
    """사용자가 해당 페이지에 접근 권한이 있는지 확인"""
    menu_items = get_menu_items(user_role)
    
    def check_in_menu(items):
        for _, value in items.items():
            if isinstance(value, dict):
                if page_id in value.values():
                    return True
            else:
                if value == page_id:
                    return True
        return False
    
    return check_in_menu(menu_items)