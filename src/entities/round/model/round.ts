export interface Round {
  idx: number;
  compIdx: number;
  compName: string;
  cubeEventName: string;
  roundName: string;
  eventStart: Date;
  eventEnd: Date;
  cutoff?: number;
  timeLimit?: number;
  advance?: number;
  roundGroupList?: string[];
}
