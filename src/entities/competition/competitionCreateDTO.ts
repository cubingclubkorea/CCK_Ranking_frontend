import type { EventFeeDTO } from './eventFeeDTO';

export interface CompetitionCreateDTO {
  idx?: number;
  compName: string;
  compDateStart: string; // YYYY-MM-DD
  compDateEnd: string; // YYYY-MM-DD
  joinDateStart?: string; // ISO datetime
  joinDateEnd?: string; // ISO datetime
  baseFee?: number;
  location?: string;
  maxParticipate?: number;
  createdAt?: string; // ISO datetime
  updatedAt?: string; // ISO datetime
  eventFeeList?: EventFeeDTO[];
}
