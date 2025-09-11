/**
 * 안전한 숫자 처리를 위한 유틸리티
 * Number 프로토타입을 확장하지 않고 안전한 래퍼 함수 제공
 */

export const safeNumber = (value: any): number => {
  if (value === null || value === undefined || value === '' || isNaN(value)) {
    return 0
  }
  return Number(value)
}

export const safePrice = (value: any): number => {
  const num = safeNumber(value)
  return Math.max(0, num)
}

export const safeVolume = (value: any): number => {
  const num = safeNumber(value)
  return Math.max(0, num)
}

export const safePercentage = (value: any): number => {
  const num = safeNumber(value)
  return num
}

// 안전한 toFixed 래퍼
export const toFixedSafe = (value: any, decimals: number = 2): string => {
  const num = safeNumber(value)
  return num.toFixed(decimals)
}

// 가격 포맷팅
export const formatPriceSafe = (value: any, decimals: number = 2): string => {
  const num = safePrice(value)
  return num.toFixed(decimals)
}

// 볼륨 포맷팅
export const formatVolumeSafe = (value: any): string => {
  const num = safeVolume(value)
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B'
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toFixed(0)
}