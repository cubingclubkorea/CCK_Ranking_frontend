export interface RoundGlobalSingleAverage {
  singleAvg: number;
  averageAvg: number;
  count: number;
}

export interface RoundStateSingleAverage {
  state: string;
  singleAvg: number;
  averageAvg: number;
  count: number;
}

export interface RoundDnfCount {
  dnfCount: number;
  successCount: number;
  totalCount: number;
}
