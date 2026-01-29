import { apiClient } from '@/shared/api/base';
import type { CubeEventDTO } from './dto/cubeEvent.dto';
import type { CubeEvent } from '../model/cubeEvent';
import { CubeEventMapper } from './mapper/cubeEventMapper';

const BASE_URL = '/event';

/**
 * 큐브 이벤트 목록 조회
 */
export const getCubeEventList = async (): Promise<CubeEvent[]> => {
  const data = await apiClient.get<CubeEventDTO[]>(BASE_URL);
  
  return data.map(CubeEventMapper);
};
