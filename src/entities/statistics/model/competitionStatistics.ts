export interface CompExtraItem {
  idx: number;
  recordIdx: number;
  attemptTry: number;
  time: number | null;
  scramblerName: string | null;
  scramblerCckId: string | null;
  judgeName: string | null;
  judgeCckId: string | null;
  extra: number;
  exReason: string | null;
  delegateName: string | null;
  delegateCckId: string | null;
  exScramblerName: string | null;
  exScramblerCckId: string | null;
}

export interface CompStaffCountItem {
  count: number;
  staffName: string;
  staffCckId: string | null;
}

export interface CompDnfCount {
  dnfCount: number;
  successCount: number;
  totalCount: number;
}

export type CompBreakBestType = "PR" | "SR" | "CCR" | null;

export interface CompBreakItem {
  idx: number;
  pdx: number | null;
  name: string;
  cckId: string;
  state: string | null;
  roundIdx: number;
  compName: string;
  compIdx: number;
  eventName: string;
  avgCalc: string;
  roundName: string;
  roundGroup: string | null;
  roundAdvance: number | null;
  attempts: Array<{
    idx: number;
    recordIdx: number;
    attemptTry: number;
    time: number | null;
    scramblerName: string | null;
    scramblerCckId: string | null;
    judgeName: string | null;
    judgeCckId: string | null;
    extra?: number;
    exReason?: string | null;
    delegateName?: string | null;
    delegateCckId?: string | null;
    exScramblerName?: string | null;
    exScramblerCckId?: string | null;
  }>;
  single: number | null;
  average: number | null;
  ranking: number | null;
  stateRanking: number | null;
  singleBestType: CompBreakBestType;
  averageBestType: CompBreakBestType;
  note: string | null;
}
