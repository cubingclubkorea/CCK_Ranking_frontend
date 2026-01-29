import { apiClient } from '@/shared/api/base';
import type { ScramblerUpdateDTO } from './dto/scramblerUpdate.dto';
import type { ScrambleResponseDTO } from '@/entities/scramble/api/dto/scramble.dto';
import type { ScrambleResponse } from '@/entities/scramble/model/scramble';
import { ScrambleResponseMapper } from '@/entities/scramble/api/mapper/scrambleMapper';

const BASE_URL = '/scramble';

/**
 * 스크램블러 업데이트 (스크램블 발급)
 */
export const updateScrambler = async (dto: ScramblerUpdateDTO): Promise<ScrambleResponse> => {
  const data = await apiClient.patch<ScrambleResponseDTO, ScramblerUpdateDTO>(BASE_URL, dto);
  
  return ScrambleResponseMapper(data);
};
