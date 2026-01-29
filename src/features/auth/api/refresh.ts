import type { TokenResponse } from '../model/tokenResponse';
import { apiClient } from '@/shared/api/base';
import { setAccessToken, removeAccessToken } from '../utils/tokenStorage';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

/**
 * CSRF 토큰 가져오기
 * refresh, logout 등에서 공통으로 사용
 */
export const getCsrfToken = async (): Promise<string> => {
  const response = await apiClient.getAxiosInstance().get('/auth/csrf');
  return response.headers['x-csrf-token'] || '';
};

export const refreshAccessToken = async (): Promise<TokenResponse> => {
  try {
    // CSRF 토큰 받기
    const csrfToken = await getCsrfToken();

    // 토큰 갱신
    const data = await apiClient.post<TokenResponse>(
      '/auth/refresh',
      {},
      {
        headers: {
          'X-XSRF-TOKEN': csrfToken,
        },
      }
    );

    // 새 토큰 저장
    setAccessToken(data.access_token);

    return data;
  } catch (error) {
    // 토큰 갱신 실패 시 로그아웃 처리
    removeAccessToken();
    throw error;
  }
};

export const refreshTokenOnUnauthorized = async <T>(
  apiCall: () => Promise<T>
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error: any) {
    // 401 에러가 아니면 그대로 throw
    if (error.response?.status !== 401) {
      throw error;
    }

    // 이미 갱신 중이면 대기
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshSubscribers.push(async () => {
          try {
            const result = await apiCall();
            resolve(result);
          } catch (err) {
            reject(err);
          }
        });
      });
    }

    // 토큰 갱신 시작
    isRefreshing = true;

    try {
      const tokenResponse = await refreshAccessToken();

      // 대기 중인 요청들에게 새 토큰 알림
      refreshSubscribers.forEach((callback) => callback(tokenResponse.access_token));
      refreshSubscribers = [];

      // 원래 요청 재시도
      return await apiCall();
    } catch (refreshError) {
      // 토큰 갱신 실패 시 로그인 페이지로 리다이렉트
      removeAccessToken();
      window.location.href = '/login';
      throw refreshError;
    } finally {
      isRefreshing = false;
    }
  }
};