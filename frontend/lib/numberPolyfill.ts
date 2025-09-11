/**
 * Number.prototype.toFixed의 안전한 폴리필
 * undefined나 null 값에 대해 안전하게 처리
 */

// 원래의 toFixed를 저장
const originalToFixed = Number.prototype.toFixed;

// 안전한 toFixed로 오버라이드
Number.prototype.toFixed = function(fractionDigits?: number): string {
  try {
    // this가 null이나 undefined인 경우
    if (this == null || this == undefined) {
      console.warn('toFixed called on null or undefined');
      return '0';
    }
    
    // NaN인 경우
    if (isNaN(Number(this))) {
      console.warn('toFixed called on NaN');
      return '0';
    }
    
    // 정상적인 경우 원래의 toFixed 호출
    return originalToFixed.call(Number(this), fractionDigits);
  } catch (error) {
    console.error('Error in toFixed polyfill:', error);
    return '0';
  }
};

// 전역으로 export
export {};