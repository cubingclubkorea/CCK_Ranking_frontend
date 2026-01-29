import type { EventFeeDTO } from '@/entities/competition/api/dto/eventFee.dto';

export interface CompetitionUpdateDTO {
  idx: number;
  compName: string;
  compDateStart: string;      // LocalDate
  compDateEnd: string;        // LocalDate
  joinDateStart: string;      // LocalDateTime
  joinDateEnd: string;        // LocalDateTime
  baseFee?: number;
  location?: string;
  maxParticipate?: number;
  eventFeeList?: EventFeeDTO[];
}
