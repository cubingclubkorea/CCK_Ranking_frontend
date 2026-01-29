import { apiClient } from '@/shared/api/base';
import type { RoundCreateDTO } from './dto/roundCreate.dto';

const BASE_URL = '/round';

/**
 * 라운드 생성 (리스트)
 */
export const createRound = async (roundList: RoundCreateDTO[]): Promise<void> => {
  await apiClient.post<void, RoundCreateDTO[]>(BASE_URL, roundList);
};
