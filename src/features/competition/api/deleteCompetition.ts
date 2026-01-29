import { apiClient } from '@/shared/api/base';

const BASE_URL = '/comp';

/**
 * 대회 삭제
 */
export const deleteCompetition = async (compIdx: number): Promise<void> => {
  await apiClient.delete<void>(`${BASE_URL}/${compIdx}`);
};
