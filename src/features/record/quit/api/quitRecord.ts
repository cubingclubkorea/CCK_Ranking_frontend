import { apiClient } from '@/shared/api/base';

const BASE_URL = '/record';

/**
 * 여러 기록 기권 처리
 */
export const quitRecord = async (partList: number[]): Promise<void> => {
  await apiClient.delete<void, number[]>(`${BASE_URL}/quit`, partList);
};
