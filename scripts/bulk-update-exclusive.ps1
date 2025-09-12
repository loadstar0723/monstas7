# PowerShell script for bulk updating pages to ExclusiveAccess

# 페이지 구성 정보
$pageConfigs = @{
    # Crypto 카테고리
    'crypto/altseason' = @{
        title = '알트시즌 분석'
        description = '알트코인 강세장을 예측하고 최적 진입 타이밍을 포착'
        tier = 'Signature'
        features = @(
            '비트코인 도미넌스 분석',
            '알트코인 상대 강도 측정',
            '섹터별 회전 분석',
            '자금 흐름 추적',
            '시장 심리 지표',
            '알트시즌 지수 계산'
        )
    }
    'crypto/defi' = @{
        title = 'DeFi 생태계 분석'
        description = '탈중앙화 금융 프로토콜 분석과 수익 기회 발굴'
        tier = 'Master'
        features = @(
            'TVL 변화 추적',
            '이자율 비교 분석',
            '임펄머넌트 로스 계산',
            '거버넌스 토큰 분석',
            '프로토콜 수익성 평가',
            '리스크 등급 산정'
        )
    }
    'crypto/dominance' = @{
        title = '도미넌스 분석'
        description = '비트코인과 주요 알트코인의 시장 지배력 변화 추적'
        tier = 'Platinum'
        features = @(
            '비트코인 도미넌스 차트',
            '이더리움 도미넌스 분석',
            '스테이블코인 비중 변화',
            '시가총액 순위 변동',
            '도미넌스 기반 매매 신호',
            '시장 단계별 전략'
        )
    }
    # Portfolio 카테고리 (overview 제외)
    'portfolio/allocation' = @{
        title = '자산 배분 최적화'
        description = '현대 포트폴리오 이론에 기반한 최적 자산 배분 전략'
        tier = 'Platinum'
        features = @(
            '효율적 프런티어 분석',
            '리밸런싱 전략',
            '리스크 패리티 모델',
            '블랙-리터만 모델',
            '동적 자산 배분',
            '세후 수익률 최적화'
        )
    }
    'portfolio/optimization' = @{
        title = '포트폴리오 최적화'
        description = '수학적 모델을 통한 포트폴리오 성과 극대화'
        tier = 'Master'
        features = @(
            '마코위츠 최적화',
            '제약 조건 설정',
            '거래 비용 고려',
            '다목적 최적화',
            '강건한 최적화',
            '베이지안 최적화'
        )
    }
    # Macro 카테고리
    'macro/bonds' = @{
        title = '채권 시장 분석'
        description = '글로벌 채권 시장 동향과 수익률 곡선 분석'
        tier = 'Signature'
        features = @(
            '국가별 채권 수익률 비교',
            '수익률 곡선 분석',
            '신용 스프레드 추적',
            '중앙은행 정책 영향',
            '인플레이션 연동채 분석',
            '채권 듀레이션 리스크'
        )
    }
    'macro/central-banks' = @{
        title = '중앙은행 정책 분석'
        description = '주요 중앙은행의 통화정책과 시장 영향 분석'
        tier = 'Master'
        features = @(
            'Fed 정책 실시간 추적',
            'ECB/BOJ 정책 비교',
            '금리 인상/인하 예측',
            'QE 정책 영향 분석',
            '중앙은행 발언 분석',
            '통화정책 일정 추적'
        )
    }
    # Education 카테고리
    'education/basics' = @{
        title = '트레이딩 기초'
        description = '암호화폐 트레이딩의 기본 개념과 용어 학습'
        tier = 'Free'
        features = @(
            '기초 용어 정리',
            '차트 읽는 방법',
            '주문 타입 설명',
            '기본 지표 활용',
            '리스크 관리 기초',
            '실전 예제 학습'
        )
    }
    'education/strategies' = @{
        title = '트레이딩 전략'
        description = '검증된 트레이딩 전략과 실전 적용 방법'
        tier = 'Platinum'
        features = @(
            'DCA 전략 심화',
            '스윙 트레이딩 기법',
            '스캘핑 전략',
            '아비트라지 기법',
            '포트폴리오 전략',
            '백테스팅 방법'
        )
    }
    # System 카테고리
    'system/api' = @{
        title = 'API 연동 설정'
        description = '거래소 API 연동 및 자동화 거래 설정'
        tier = 'Master'
        features = @(
            '거래소 API 키 설정',
            'REST API 연동',
            'WebSocket 실시간 데이터',
            'API 보안 설정',
            '자동 거래 봇 설정',
            'API 사용량 관리'
        )
    }
}

# ExclusiveAccess 컴포넌트 코드 생성 함수
function Generate-ExclusiveAccessCode {
    param(
        [string]$Title,
        [string]$Description,
        [string]$Tier,
        [array]$Features
    )
    
    $featuresString = ($Features | ForEach-Object { "'$_'" }) -join ",`n        "
    
    return @"
'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="$Title"
      description="$Description"
      requiredTier="$Tier"
      features={[
        $featuresString
      ]}
    />
  )
}
"@
}

# 메인 업데이트 함수
function Update-Pages {
    $frontendPath = "C:\monsta\monstas7\frontend\app"
    $updatedCount = 0
    $errorCount = 0
    
    Write-Host "🚀 ExclusiveAccess 컴포넌트로 페이지 일괄 업데이트 시작..." -ForegroundColor Green
    Write-Host ""
    
    foreach ($pagePath in $pageConfigs.Keys) {
        $config = $pageConfigs[$pagePath]
        $fullPath = Join-Path $frontendPath "$pagePath\page.tsx"
        
        if (Test-Path $fullPath) {
            try {
                $newContent = Generate-ExclusiveAccessCode -Title $config.title -Description $config.description -Tier $config.tier -Features $config.features
                Set-Content -Path $fullPath -Value $newContent -Encoding UTF8
                Write-Host "✅ 업데이트 완료: $pagePath" -ForegroundColor Green
                $updatedCount++
            }
            catch {
                Write-Host "❌ 업데이트 실패: $pagePath - $($_.Exception.Message)" -ForegroundColor Red
                $errorCount++
            }
        }
        else {
            Write-Host "⚠️  파일을 찾을 수 없음: $fullPath" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "🎉 일괄 업데이트 완료!" -ForegroundColor Green
    Write-Host "✅ 성공: $updatedCount 개" -ForegroundColor Green
    Write-Host "❌ 실패: $errorCount 개" -ForegroundColor Red
    Write-Host "📊 총 처리: $($updatedCount + $errorCount) 개" -ForegroundColor Cyan
}

# 스크립트 실행
Update-Pages