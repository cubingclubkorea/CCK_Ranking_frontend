import { apiClient } from '@/shared/api/base';
import type { RecordUpdateDTO } from './dto/recordUpdate.dto';

const BASE_URL = '/record';

/**
 * 기록 업데이트
 */
export const updateRecord = async (dto: RecordUpdateDTO): Promise<void> => {
  await apiClient.patch<void, RecordUpdateDTO>(BASE_URL, dto);
};
