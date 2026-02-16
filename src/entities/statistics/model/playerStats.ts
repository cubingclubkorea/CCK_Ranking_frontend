export interface PlayerEventRanking {
  eventName: string;
  bestSingle: number | null;
  bestAverage: number | null;
  rankSingle: number | null;
  rankAverage: number | null;
  total: number | null;
}

export interface PlayerStaffCountResponse {
  judgeCount: number;
  scramblerCount: number;
  totalCount: number;
  role?: string;
  isOrganizer?: boolean;
}

export interface PlayerCountResponse {
  competitionCount: number;
  completeCount: number;
}
