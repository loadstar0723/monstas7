/**
 * 안전한 숫자 포맷팅 함수들
 */

export const safeToFixed = (value: any, decimals: number = 2): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0'
  }
  return Number(value).toFixed(decimals)
}

export const formatPrice = (price: any): string => {
  if (price === null || price === undefined || isNaN(price)) {
    return '$0.00'
  }
  return `$${Number(price).toFixed(2)}`
}

export const formatPercentage = (value: any): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00%'
  }
  return `${Number(value).toFixed(2)}%`
}

export const formatVolume = (volume: any): string => {
  if (volume === null || volume === undefined || isNaN(volume)) {
    return '0M'
  }
  const vol = Number(volume)
  if (vol >= 1000000000) {
    return `${(vol / 1000000000).toFixed(1)}B`
  } else if (vol >= 1000000) {
    return `${(vol / 1000000).toFixed(1)}M`
  } else if (vol >= 1000) {
    return `${(vol / 1000).toFixed(1)}K`
  }
  return vol.toFixed(0)
}

export const formatNumber = (value: any, decimals: number = 0): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0'
  }
  return Number(value).toLocaleString(undefined, { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  })
}