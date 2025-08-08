/**
 * 로컬스토리지 유틸리티 함수들
 */

type LocalStorageKey = 
  | 'productManagement_itemsPerPage'
  | 'orderManagement_itemsPerPage'
  | 'userManagement_itemsPerPage'
  | 'brandManagement_itemsPerPage';

/**
 * 로컬스토리지에서 값을 가져오는 함수
 * @param key 로컬스토리지 키
 * @param defaultValue 기본값
 * @returns 저장된 값 또는 기본값
 */
export function getLocalStorage<T>(key: LocalStorageKey, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  try {
    const saved = localStorage.getItem(key);
    if (saved === null) {
      return defaultValue;
    }
    
    // JSON 파싱 시도
    try {
      return JSON.parse(saved) as T;
    } catch {
      // JSON이 아닌 경우 문자열로 반환
      return saved as unknown as T;
    }
  } catch (error) {
    console.error(`Error reading from localStorage for key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * 로컬스토리지에 값을 저장하는 함수
 * @param key 로컬스토리지 키
 * @param value 저장할 값
 */
export function setLocalStorage<T>(key: LocalStorageKey, value: T): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const valueToStore = typeof value === 'string' 
      ? value 
      : JSON.stringify(value);
    
    localStorage.setItem(key, valueToStore);
  } catch (error) {
    console.error(`Error writing to localStorage for key "${key}":`, error);
  }
}

/**
 * 로컬스토리지에서 값을 삭제하는 함수
 * @param key 로컬스토리지 키
 */
export function removeLocalStorage(key: LocalStorageKey): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage for key "${key}":`, error);
  }
}

/**
 * 페이지당 아이템 개수를 관리하는 훅
 */
export function useItemsPerPage(storageKey: LocalStorageKey, defaultValue = 20) {
  const getItemsPerPage = (): number => {
    const saved = getLocalStorage(storageKey, defaultValue);
    return typeof saved === 'number' ? saved : Number(saved);
  };

  const setItemsPerPage = (value: number): void => {
    setLocalStorage(storageKey, value);
  };

  return { getItemsPerPage, setItemsPerPage };
}