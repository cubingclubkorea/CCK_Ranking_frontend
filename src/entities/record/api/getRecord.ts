import { apiClient } from '@/shared/api/base';
import type { RecordDTO } from './dto/record.dto';
import type { Record } from '../model/record';
import { RecordMapper } from './mapper/recordMapper';

const BASE_URL = '/record';

/**
 * 라운드별 기록 목록 조회
 */
export const getRecordList = async (roundIdx: number): Promise<Record[]> => {
  const data = await apiClient.get<RecordDTO[]>(`${BASE_URL}/${roundIdx}`);
  
  return data.map(RecordMapper);
};
