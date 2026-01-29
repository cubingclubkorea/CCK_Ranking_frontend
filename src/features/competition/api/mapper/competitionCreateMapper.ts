import type { CompetitionCreateDTO } from '../dto/competitionCreate.dto';

export const CompetitionCreateMapper = (data: {
  compName: string;
  compDateStart: Date;
  compDateEnd: Date;
  joinDateStart: Date;
  joinDateEnd: Date;
  baseFee?: number;
  location?: string;
  maxParticipate?: number;
  eventFeeList?: Array<{
    eventName: string;
    eventFee: number;
  }>;
}): CompetitionCreateDTO => ({
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
