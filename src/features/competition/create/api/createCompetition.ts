import { apiClient } from '@/shared/api/base';
import type { CompetitionCreateDTO } from './dto/competitionCreate.dto';
import type { CompetitionDTO } from '@/entities/competition/api/dto/competition.dto';

const BASE_URL = '/comp';

/**
 * 대회 생성
 */
export const createCompetition = async (
  dto: CompetitionCreateDTO
): Promise<CompetitionDTO> => {
  return apiClient.post<CompetitionDTO, CompetitionCreateDTO>(BASE_URL, dto);
};
