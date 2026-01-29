import type { CompetitionUpdateDTO } from '../dto/competitionUpdate.dto';

export const CompetitionUpdateMapper = (data: {
  idx: number;
  compName: string;
  compDateStart: Date;
  compDateEnd: Date;
  joinDateStart: Date;
  joinDateEnd: Date;
  baseFee?: number;
  location?: string;
  maxParticipate?: number;
  eventFeeList?: Array<{
    idx?: number;
    eventName: string;
    eventFee: number;
  }>;
}): CompetitionUpdateDTO => ({
  idx: data.idx,
  compName: data.compName,
  compDateStart: data.compDateStart.toISOString().split('T')[0], // LocalDate format: yyyy-MM-dd
  compDateEnd: data.compDateEnd.toISOString().split('T')[0],
  joinDateStart: data.joinDateStart.toISOString(), // LocalDateTime format: yyyy-MM-ddTHH:mm:ss
  joinDateEnd: data.joinDateEnd.toISOString(),
  baseFee: data.baseFee,
  location: data.location,
  maxParticipate: data.maxParticipate,
  eventFeeList: data.eventFeeList,
});
