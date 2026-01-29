import { apiClient } from '@/shared/api/base';
import type { ExtraDTO } from './dto/extra.dto';

const BASE_URL = '/record';

/**
 * 추가 시도 추가
 */
export const addExtra = async (dto: ExtraDTO): Promise<void> => {
  await apiClient.patch<void, ExtraDTO>(`${BASE_URL}/extra`, dto);
};
