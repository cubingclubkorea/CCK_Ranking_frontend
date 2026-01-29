import type { RoundDTO } from '../dto/round.dto';
import type { Round } from '../../model/round';

export const RoundMapper = (dto: RoundDTO): Round => ({
  idx: dto.idx,
  compIdx: dto.compIdx,
  compName: dto.compName,
  cubeEventName: dto.cubeEventName,
  roundName: dto.roundName,
  eventStart: new Date(dto.eventStart),
  eventEnd: new Date(dto.eventEnd),
  cutoff: dto.cutoff,
  timeLimit: dto.timeLimit,
  advance: dto.advance,
  roundGroupList: dto.roundGroupList,
});
