const ACCESS_TOKEN_KEY = 'access_token';

/**
 * Access Token 저장
 */
export const setAccessToken = (token: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

/**
 * Access Token 조회
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Access Token 삭제
 */
export const removeAccessToken = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

/**
 * Access Token 존재 여부 확인
 */
export const hasAccessToken = (): boolean => {
  return !!getAccessToken();
};
