import { apiClient } from '@/shared/api/base';
import type { RoundDTO } from './dto/round.dto';
import type { RoundDayCountDTO } from './dto/roundDayCount.dto';
import type { Page } from '@/shared/model/page';
import type { PageQuery } from '@/shared/query/pageQuery';
import { mapPageableToParams } from '@/shared/query/pageQueryMapper';
import type { Round } from '../model/round';
import type { RoundDayCount } from '../model/roundDayCount';
import { RoundMapper } from './mapper/roundMapper';

const BASE_URL = '/round';
type RoundPhase = 'past' | 'now' | 'future';

const roundPhaseEndpointCache: Partial<Record<RoundPhase, (compIdx: number) => string>> = {};

const roundPhaseCandidates: Array<(phase: RoundPhase, compIdx: number) => string> = [
  (phase, compIdx) => `${BASE_URL}/${phase}/${compIdx}`,
  (phase, compIdx) => `${BASE_URL}/${compIdx}/${phase}`,
  (phase, compIdx) => `${BASE_URL}/${compIdx}?status=${phase}`,
];

const getRoundByPhase = async (phase: RoundPhase, compIdx: number, params?: PageQuery): Promise<Page<Round>> => {
  const mappedParams = mapPageableToParams(params);
  const cachedBuilder = roundPhaseEndpointCache[phase];

  if (cachedBuilder) {
    const data = await apiClient.get<Page<RoundDTO>>(cachedBuilder(compIdx), mappedParams);
    return {
      content: data.content.map(RoundMapper),
      page: data.page,
    };
  }

  let lastError: unknown;
  for (const buildEndpoint of roundPhaseCandidates) {
    try {
      const endpoint = buildEndpoint(phase, compIdx);
      const data = await apiClient.get<Page<RoundDTO>>(endpoint, mappedParams);
      roundPhaseEndpointCache[phase] = (idx: number) => buildEndpoint(phase, idx);
      return {
        content: data.content.map(RoundMapper),
        page: data.page,
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('라운드 목록 조회에 실패했습니다.');
};

/**
 * 종료된 라운드 목록 조회
 */
export const getRoundPast = async (compIdx: number, params?: PageQuery): Promise<Page<Round>> => {
  return getRoundByPhase('past', compIdx, params);
};

/**
 * 진행중인 라운드 목록 조회
 */
export const getRoundNow = async (compIdx: number, params?: PageQuery): Promise<Page<Round>> => {
  return getRoundByPhase('now', compIdx, params);
};

/**
 * 예정된 라운드 목록 조회
 */
export const getRoundFuture = async (compIdx: number, params?: PageQuery): Promise<Page<Round>> => {
  return getRoundByPhase('future', compIdx, params);
};

/**
 * 단일 라운드 조회
 */
export const getRound = async (roundIdx: number): Promise<Round> => {
  const data = await apiClient.get<RoundDTO>(`${BASE_URL}/${roundIdx}`);
  
  return RoundMapper(data);
};

/**
 * 대회 일자별 라운드 조회
 */
export const getRoundByDayCount = async (compIdx: number, dayCount: number): Promise<RoundDayCount> => {
  const data = await apiClient.get<RoundDayCountDTO>(`${BASE_URL}/${compIdx}/day-count/${dayCount}`);

  return {
    past: data.past.map(RoundMapper),
    now: data.now.map(RoundMapper),
    future: data.future.map(RoundMapper),
  };
};
