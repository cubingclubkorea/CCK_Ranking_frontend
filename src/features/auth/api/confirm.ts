import type { TokenResponse } from '../model/tokenResponse';
import { apiClient } from '@/shared/api/base';

const TOKEN_EXCHANGE_ENDPOINT = '/auth/token';

export const getToken = async (code: string): Promise<TokenResponse> => {
  return await apiClient.post<TokenResponse, Record<string, never>>(TOKEN_EXCHANGE_ENDPOINT, {}, {
    params: { code },
  });
};
