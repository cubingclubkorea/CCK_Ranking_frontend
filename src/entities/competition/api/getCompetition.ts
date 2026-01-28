import { apiClient } from '@/shared/api/base';
import type { CompetitionDTO } from './dto/competition.dto';
import type { Page } from '@/shared/model/page';
import type { PageQuery } from '@/shared/query/pageQuery';
import { mapPageableToParams } from '@/shared/query/pageQueryMapper';
import type { Competition } from '../model/competition';
import { CompetitionMapper } from './mapper/competitionMapper';

const BASE_URL = '/comp';

/**
 * 종료된 대회 목록 조회
 */
export const getCompetitionPast = async (params?: PageQuery): Promise<Page<Competition>> => {
  const data = await apiClient.get<Page<CompetitionDTO>>(`${BASE_URL}/past`, mapPageableToParams(params));
  
  return {
    content: data.content.map(CompetitionMapper),
    page: data.page,
  };
};

/**
 * 진행중인 대회 목록 조회
 */
export const getCompetitionNow = async (params?: PageQuery): Promise<Page<Competition>> => {
  const data = await apiClient.get<Page<CompetitionDTO>>(`${BASE_URL}/now`, mapPageableToParams(params));
  
  return {
    content: data.content.map(CompetitionMapper),
    page: data.page,
  };
};

/**
 * 예정된 대회 목록 조회
 */
export const getCompetitionFuture = async (params?: PageQuery): Promise<Page<Competition>> => {
  const data = await apiClient.get<Page<CompetitionDTO>>(`${BASE_URL}/future`, mapPageableToParams(params));
  
  return {
    content: data.content.map(CompetitionMapper),
    page: data.page,
  };
};

/**
 * 단일 대회 조회
 */
export const getCompetition = async (compIdx: number): Promise<Competition> => {
  const data = await apiClient.get<CompetitionDTO>(`${BASE_URL}/${compIdx}`);
  
  return CompetitionMapper(data);
};