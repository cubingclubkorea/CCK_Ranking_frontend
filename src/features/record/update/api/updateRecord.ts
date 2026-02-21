import { apiClient } from '@/shared/api/base';
import type { RecordUpdateDTO } from './dto/recordUpdate.dto';

const BASE_URL = '/new-record';

/**
 * 기록 업데이트
 */
export const updateRecord = async (dto: RecordUpdateDTO): Promise<void> => {
  const recordIdx = dto.recordIdx ?? dto.idx;
  if (!recordIdx) {
    throw new Error('recordIdx 또는 idx가 필요합니다.');
  }

  await apiClient.patch<void, { idx: number; times: Array<number | null> }>(BASE_URL, {
    idx: recordIdx,
    times: dto.times,
  });
};
