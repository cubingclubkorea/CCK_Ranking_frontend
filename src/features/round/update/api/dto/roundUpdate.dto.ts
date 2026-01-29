export interface RoundUpdateDTO {
  idx: number;
  comp: number;
  cubeEvent: string;
  roundName: string;
  eventStart: string;      // LocalDateTime
  eventEnd: string;        // LocalDateTime
  groupList?: string[];
  cutoff?: number;
  timeLimit?: number;
  advance?: number;
}
