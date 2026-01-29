import { apiClient } from '@/shared/api/base';
import type { PlayerAddDTO } from './dto/playerAdd.dto';

const BASE_URL = '/record';

/**
 * 플레이어 추가 (리스트)
 */
export const addPlayer = async (playerList: PlayerAddDTO[]): Promise<void> => {
  await apiClient.post<void, PlayerAddDTO[]>(BASE_URL, playerList);
};
