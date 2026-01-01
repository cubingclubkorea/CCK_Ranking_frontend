import { apiClient } from '@/shared';
import type { CompetitionCreateDTO, CompsResponse, CompetitionDTO } from '@/entities/competition';

// ApiClient already has the base URL configured via shared config.

export const getComps = async (): Promise<CompsResponse> => {
  const data = await apiClient.get<CompsResponse>(`/comps`);
  return data;
};

export const getComp = async (compIdx: number): Promise<CompetitionDTO> => {
  const data = await apiClient.get<CompetitionDTO>(`/comp/${compIdx}`);
  return data;
};

export const createComp = async (dto: CompetitionCreateDTO): Promise<void> => {
  await apiClient.post<void, CompetitionCreateDTO>(`/comp`, dto);
};

export const deleteComp = async (compIdx: number): Promise<void> => {
  await apiClient.delete<void>(`/comp/${compIdx}`);
};

export default {
  getComps,
  getComp,
  createComp,
  deleteComp,
};
