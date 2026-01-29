import { apiClient } from '@/shared/api/base';
import type { RoundDTO } from './dto/round.dto';
import type { Page } from '@/shared/model/page';
import type { PageQuery } from '@/shared/query/pageQuery';
import { mapPageableToParams } from '@/shared/query/pageQueryMapper';
import type { Round } from '../model/round';
import { RoundMapper } from './mapper/roundMapper';

const BASE_URL = '/round';

/**
 * 종료된 라운드 목록 조회
 */
export const getRoundPast = async (compIdx: number, params?: PageQuery): Promise<Page<Round>> => {
  const data = await apiClient.get<Page<RoundDTO>>(`${BASE_URL}/past/${compIdx}`, mapPageableToParams(params));
  
  return {
    content: data.content.map(RoundMapper),
    page: data.page,
  };
};

/**
 * 진행중인 라운드 목록 조회
 */
export const getRoundNow = async (compIdx: number, params?: PageQuery): Promise<Page<Round>> => {
  const data = await apiClient.get<Page<RoundDTO>>(`${BASE_URL}/now/${compIdx}`, mapPageableToParams(params));
  
  return {
    content: data.content.map(RoundMapper),
    page: data.page,
  };
};

/**
 * 예정된 라운드 목록 조회
 */
export const getRoundFuture = async (compIdx: number, params?: PageQuery): Promise<Page<Round>> => {
  const data = await apiClient.get<Page<RoundDTO>>(`${BASE_URL}/future/${compIdx}`, mapPageableToParams(params));
  
  return {
    content: data.content.map(RoundMapper),
    page: data.page,
  };
};

/**
 * 단일 라운드 조회
 */
export const getRound = async (roundIdx: number): Promise<Round> => {
  const data = await apiClient.get<RoundDTO>(`${BASE_URL}/${roundIdx}`);
  
  return RoundMapper(data);
};
