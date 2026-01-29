import { apiClient } from '@/shared/api/base';

const BASE_URL = '/record';

/**
 * 기록 삭제
 */
export const deleteRecord = async (idx: number): Promise<void> => {
  await apiClient.delete<void>(`${BASE_URL}/${idx}`);
};
