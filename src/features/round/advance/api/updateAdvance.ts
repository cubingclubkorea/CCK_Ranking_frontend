import { apiClient } from '@/shared/api/base';

const BASE_URL = '/round';

/**
 * 라운드 어드밴스 인원 조정
 */
export const updateAdvance = async (roundIdx: number, advance: number): Promise<void> => {
  await apiClient.patch<void, null>(`${BASE_URL}/${roundIdx}/advance/${advance}`, null);
};
