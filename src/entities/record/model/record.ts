import type { Attempt } from './attempt';
import type { BestType } from './bestType';

export interface Record {
  idx: number;
  pdx: number;
  name: string;
  enName?: string;
  state: string;
  cckId: string;
  roundIdx: number;
  roundName: string;
  roundGroup: string;
  roundAdvance?: number;
  compIdx: number;
  compName: string;
  eventName: string;
  avgCalc: string;
  attempts: Attempt[];
  single?: number;
  average?: number;
  ranking?: number;
  stateRanking?: number;
  singleBestType?: BestType;
  averageBestType?: BestType;
  note?: string;
}
