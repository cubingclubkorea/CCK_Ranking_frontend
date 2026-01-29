import { apiClient } from '@/shared/api/base';

const BASE_URL = '/record';

/**
 * 추가 시도 삭제
 */
export const deleteExtra = async (recordIdx: number, extraNum: number): Promise<void> => {
  await apiClient.delete<void>(`${BASE_URL}/${recordIdx}/extra/${extraNum}`);
};
