import type { CompetitionDTO } from '../dto/competition.dto';
import type { Competition } from '../../model/competition';
import { EventFeeMapper } from './eventFeeMapper';
import { mapRegionName } from '@/shared';

const parseLocalDate = (value: string): Date => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const CompetitionMapper = (dto: CompetitionDTO): Competition => ({
  idx: dto.idx,
  compName: dto.compName,
  compDateStart: parseLocalDate(dto.compDateStart),
  compDateEnd: parseLocalDate(dto.compDateEnd),
  joinDateStart: new Date(dto.joinDateStart),
  joinDateEnd: new Date(dto.joinDateEnd),
  baseFee: dto.baseFee,
  location: mapRegionName(dto.location) ?? dto.location,
  maxParticipate: dto.maxParticipate,
  createdAt: new Date(dto.createdAt),
  updatedAt: new Date(dto.updatedAt),
  eventFeeList: dto.eventFeeList.map(EventFeeMapper),
});
