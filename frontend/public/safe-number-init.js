/**
 * 즉시 실행되는 안전한 숫자 처리 스크립트
 * HTML에 직접 삽입되어 모든 JS 실행 전에 초기화
 */
(function() {
  'use strict';
  
  // 원래 toFixed 저장
  var originalToFixed = Number.prototype.toFixed;
  
  // toFixed 안전하게 오버라이드
  Number.prototype.toFixed = function(fractionDigits) {
    try {
      if (this == null || this == undefined) {
        console.warn('[SafeNumber] toFixed called on null/undefined');
        return '0';
      }
      
      var num = Number(this);
      
      if (isNaN(num)) {
        console.warn('[SafeNumber] toFixed called on NaN');
        return '0';
      }
      
      if (!isFinite(num)) {
        console.warn('[SafeNumber] toFixed called on Infinity');
        return '0';
      }
      
      return originalToFixed.call(num, fractionDigits);
    } catch (error) {
      console.error('[SafeNumber] toFixed error:', error);
      return '0';
    }
  };
  
  // 전역 헬퍼 함수
  window.safeNumber = function(value) {
    if (value == null || value === '' || isNaN(value)) {
      return 0;
    }
    var num = Number(value);
    return isFinite(num) ? num : 0;
  };
  
  window.safeToFixed = function(value, decimals) {
    decimals = decimals || 2;
    var num = window.safeNumber(value);
    return num.toFixed(decimals);
  };
  
  console.log('[SafeNumber] Initialized before all scripts');
})();