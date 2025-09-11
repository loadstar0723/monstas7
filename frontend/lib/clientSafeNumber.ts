/**
 * 클라이언트 사이드 안전한 숫자 처리
 * 전역적으로 toFixed 에러 방지
 */

// 브라우저 환경에서만 실행
if (typeof window !== 'undefined') {
  // 원래 toFixed 저장
  const originalToFixed = Number.prototype.toFixed;
  
  // toFixed 오버라이드
  Number.prototype.toFixed = function(fractionDigits?: number): string {
    try {
      // null/undefined 체크
      if (this == null || this == undefined) {
        console.warn('[SafeNumber] toFixed called on null/undefined:', new Error().stack);
        return '0';
      }
      
      // 숫자로 변환
      const num = Number(this);
      
      // NaN 체크
      if (isNaN(num)) {
        console.warn('[SafeNumber] toFixed called on NaN:', this);
        return '0';
      }
      
      // Infinity 체크
      if (!isFinite(num)) {
        console.warn('[SafeNumber] toFixed called on Infinity:', this);
        return '0';
      }
      
      // 정상 실행
      return originalToFixed.call(num, fractionDigits);
    } catch (error) {
      console.error('[SafeNumber] toFixed error:', error);
      return '0';
    }
  };

  // 안전한 숫자 변환 헬퍼
  (window as any).safeNumber = (value: any): number => {
    if (value == null || value === '' || isNaN(value)) {
      return 0;
    }
    const num = Number(value);
    return isFinite(num) ? num : 0;
  };

  // 안전한 toFixed 헬퍼
  (window as any).safeToFixed = (value: any, decimals: number = 2): string => {
    const num = (window as any).safeNumber(value);
    return num.toFixed(decimals);
  };
  
  console.log('[SafeNumber] Client-side number safety initialized');
}