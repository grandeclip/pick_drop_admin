/**
 * 숫자를 사람이 읽기 쉬운 형식으로 변환
 * @param value - 포맷팅할 숫자
 * @returns 콤마가 포함된 문자열
 */
export function formatNumber(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    return '0';
  }
  
  return num.toLocaleString('ko-KR');
}

/**
 * 큰 숫자를 축약형으로 변환 (예: 1.2K, 3.5M)
 * @param value - 포맷팅할 숫자
 * @param decimals - 소수점 자릿수 (기본값: 1)
 * @returns 축약된 문자열
 */
export function formatNumberShort(value: number, decimals: number = 1): string {
  if (value < 1000) {
    return value.toString();
  }
  
  const units = ['', 'K', 'M', 'B', 'T'];
  const unitIndex = Math.floor(Math.log10(value) / 3);
  const scaledValue = value / Math.pow(1000, unitIndex);
  
  return `${scaledValue.toFixed(decimals)}${units[unitIndex]}`;
}

/**
 * 통화 형식으로 변환
 * @param value - 포맷팅할 숫자
 * @param currency - 통화 단위 (기본값: '원')
 * @returns 통화 형식 문자열
 */
export function formatCurrency(value: number, currency: string = '원'): string {
  return `${formatNumber(value)}${currency}`;
}