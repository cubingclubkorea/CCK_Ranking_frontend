import { apiClient } from '@/shared/api/base';
import type { AdvanceRequestDTO } from './dto/advanceRequest.dto';

const BASE_URL = '/record';

/**
 * 어드밴스 인원을 다음 라운드로 넘기기
 */
export const advancePlayer = async (dto: AdvanceRequestDTO): Promise<void> => {
  await apiClient.post<void, AdvanceRequestDTO>(`${BASE_URL}/advance`, dto);
};
