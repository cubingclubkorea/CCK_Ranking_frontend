import type { EventFeeDTO } from './eventFee.dto';

export interface CompetitionDTO {
  idx: number;
  compName: string;
  compDateStart: string;      // LocalDate
  compDateEnd: string;        // LocalDate
  joinDateStart: string;      // LocalDateTime
  joinDateEnd: string;        // LocalDateTime
  baseFee: number;
  location: string;
  maxParticipate: number;
  createdAt: string;          // LocalDateTime
  updatedAt: string;          // LocalDateTime
  eventFeeList: EventFeeDTO[];
}