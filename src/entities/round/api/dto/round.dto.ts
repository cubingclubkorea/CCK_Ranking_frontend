export interface RoundDTO {
  idx: number;
  compIdx: number;
  compName: string;
  cubeEventName: string;
  roundName: string;
  eventStart: string;      // LocalDateTime
  eventEnd: string;        // LocalDateTime
  cutoff?: number;         // BigDecimal
  timeLimit?: number;      // BigDecimal
  advance?: number;
  roundGroupList?: string[];
}
