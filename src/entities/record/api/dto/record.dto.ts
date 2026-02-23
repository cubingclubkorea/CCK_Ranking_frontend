import type { AttemptDTO } from './attempt.dto';

export interface RecordDTO {
  idx: number;
  pdx: number;
  name: string;
  enName?: string;
  state: string;
  cckId: string;
  account?: {
    name?: string;
    enName?: string;
  };
  roundIdx: number;
  roundName: string;
  roundGroup: string;
  roundAdvance?: number;
  compIdx: number;
  compName: string;
  eventName: string;
  avgCalc: string;
  attempts: AttemptDTO[];
  single?: number;
  average?: number;
  ranking?: number;
  stateRanking?: number;
  singleBestType?: string;
  averageBestType?: string;
  note?: string;
}
