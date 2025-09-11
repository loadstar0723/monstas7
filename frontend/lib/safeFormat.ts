/**
 * 안전한 숫자 포맷팅 함수들
 * toFixed 에러를 방지하기 위한 래퍼 함수
 */

export const safe = (value: any): number => {
  if (value === null || value === undefined || value === '' || isNaN(value)) {
    return 0;
  }
  const num = Number(value);
  return isFinite(num) ? num : 0;
};

export const safeFixed = (value: any, decimals: number = 2): string => {
  const num = safe(value);
  return num.toFixed(decimals);
};

export const safePrice = (value: any, decimals: number = 2): string => {
  return safeFixed(value, decimals);
};

export const safeAmount = (value: any, decimals: number = 4): string => {
  return safeFixed(value, decimals);
};

export const safePercent = (value: any, decimals: number = 1): string => {
  return safeFixed(value, decimals);
};

export const safeMillion = (value: any, decimals: number = 2): string => {
  const num = safe(value);
  return (num / 1000000).toFixed(decimals);
};

export const safeThousand = (value: any, decimals: number = 1): string => {
  const num = safe(value);
  return (num / 1000).toFixed(decimals);
};