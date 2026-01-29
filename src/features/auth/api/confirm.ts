import type { TokenResponse } from '../model/tokenResponse';
import { apiClient } from '@/shared/api/base';

/**
 * OAuth 인증 코드로 토큰 발급
 * @param code OAuth 인증 코드 (SSO에서 받은 값)
 * @returns TokenResponse (access_token, token_type, expires_in, scope)
 */
export const getToken = async (code: string): Promise<TokenResponse> => {
  const data = await apiClient.post<TokenResponse>('/auth/token', null, {
    params: { code },
  });
  return data;
};