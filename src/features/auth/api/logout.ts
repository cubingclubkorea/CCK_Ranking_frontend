import { apiClient } from '@/shared/api/base';
import { removeAccessToken } from '../utils/tokenStorage';
import { refreshTokenOnUnauthorized, getCsrfToken } from './refresh';

/**
 * 로그아웃
 * - CSRF 토큰을 받아서 요청
 * - Access Token이 만료된 경우 자동으로 갱신 후 로그아웃
 * - 로그아웃 성공 시 localStorage의 토큰 제거
 */
export const logout = async (): Promise<void> => {
  try {
    // 401 에러 발생 시 자동으로 토큰 갱신 후 재시도
    await refreshTokenOnUnauthorized(async () => {
      // CSRF 토큰 받기
      const csrfToken = await getCsrfToken();

      // 로그아웃 요청 (CSRF 토큰 포함)
      return await apiClient.post<void>('/auth/logout', {}, {
        headers: {
          'X-XSRF-TOKEN': csrfToken,
        },
      });
    });

    // 로그아웃 성공 시 토큰 제거
    removeAccessToken();
  } catch (error) {
    // 에러가 발생해도 로컬 토큰은 제거
    removeAccessToken();
    throw error;
  }
};