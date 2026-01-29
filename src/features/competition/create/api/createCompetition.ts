import { apiClient } from '@/shared/api/base';
import type { CompetitionCreateDTO } from './dto/competitionCreate.dto';

const BASE_URL = '/comp';

/**
 * 대회 생성
 */
export const createCompetition = async (dto: CompetitionCreateDTO): Promise<void> => {
  await apiClient.post<void, CompetitionCreateDTO>(BASE_URL, dto);
};
