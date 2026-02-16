export interface RankingAttempt {
  idx: number;
  recordIdx: number;
  attemptTry: number;
  time: number | null;
}

export interface GlobalSingleRankingRecord {
  idx: number;
  pdx: number | null;
  name: string;
  state: string | null;
  cckId: string;
  roundIdx: number;
  roundName: string;
  roundGroup: string | null;
  roundAdvance: number | null;
  compIdx: number;
  compName: string;
  eventName: string;
  avgCalc: string;
  attempts: RankingAttempt[];
  single: number | null;
  average: number | null;
  ranking: number;
  stateRanking: number | null;
  singleBestType: string | null;
  averageBestType: string | null;
  note: string | null;
}
