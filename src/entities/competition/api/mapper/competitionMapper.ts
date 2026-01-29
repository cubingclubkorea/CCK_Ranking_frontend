import type { CompetitionDTO } from '../dto/competition.dto';
import type { Competition } from '../../model/competition';
import { EventFeeMapper } from './eventFeeMapper';

export const CompetitionMapper = (dto: CompetitionDTO): Competition => ({
  idx: dto.idx,
  compName: dto.compName,
  compDateStart: new Date(dto.compDateStart),
  compDateEnd: new Date(dto.compDateEnd),
  joinDateStart: new Date(dto.joinDateStart),
  joinDateEnd: new Date(dto.joinDateEnd),
  baseFee: dto.baseFee,
  location: dto.location,
  maxParticipate: dto.maxParticipate,
  createdAt: new Date(dto.createdAt),
  updatedAt: new Date(dto.updatedAt),
  eventFeeList: dto.eventFeeList.map(EventFeeMapper),
});