import { apiClient } from '@/shared/api/base';
import type { CreateCubeEventParams } from './dto/cubeEventCreate.dto';
const BASE_URL = '/event';

/**
 * 큐브 이벤트 생성
 */
export const createCubeEvent = async (params: CreateCubeEventParams): Promise<void> => {
  const formData = new FormData();
  formData.append('eventName', params.eventName);
  formData.append('avgCalc', params.avgCalc);
  formData.append('colorType', params.colorType);
  
  if (params.file) {
    formData.append('file', params.file);
  }
  
  await apiClient.post<void, FormData>(BASE_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
