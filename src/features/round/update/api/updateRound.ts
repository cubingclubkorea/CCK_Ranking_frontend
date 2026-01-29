import { apiClient } from '@/shared/api/base';
import type { RoundUpdateDTO } from './dto/roundUpdate.dto';

const BASE_URL = '/round';

/**
 * 라운드 수정 (리스트)
 */
export const updateRound = async (roundList: RoundUpdateDTO[]): Promise<void> => {
  await apiClient.put<void, RoundUpdateDTO[]>(BASE_URL, roundList);
};
