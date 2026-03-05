import type { TokenResponse } from '../model/tokenResponse';
import { apiClient } from '@/shared/api/base';

const TOKEN_EXCHANGE_ENDPOINT = 'https://test.ranking.cubingclub.com/api/v1/auth/token';

/**
 * OAuth 인증 코드로 토큰 발급
 * @param code OAuth 인증 코드 (SSO에서 받은 값)
 * @returns TokenResponse (access_token, token_type, expires_in, scope)
 */
export const getToken = async (code: string): Promise<TokenResponse> => {
  const data = await apiClient.post<TokenResponse>(TOKEN_EXCHANGE_ENDPOINT, null, {
    params: { code },
  });
  return data;
};
