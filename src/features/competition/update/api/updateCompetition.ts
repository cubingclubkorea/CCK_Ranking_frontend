import { apiClient } from '@/shared/api/base';
import type { CompetitionUpdateDTO } from './dto/competitionUpdate.dto';

const BASE_URL = '/comp';

/**
 * 대회 수정
 */
export const updateCompetition = async (dto: CompetitionUpdateDTO): Promise<void> => {
  await apiClient.put<void, CompetitionUpdateDTO>(BASE_URL, dto);
};
