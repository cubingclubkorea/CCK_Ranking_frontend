import { apiClient } from '@/shared/api/base';

const BASE_URL = '/round';

/**
 * 라운드 삭제
 */
export const deleteRound = async (roundIdx: number): Promise<void> => {
  await apiClient.delete<void>(`${BASE_URL}/${roundIdx}`);
};
