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
