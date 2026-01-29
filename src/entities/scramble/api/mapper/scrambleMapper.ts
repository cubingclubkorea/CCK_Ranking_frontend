import type { ScrambleResponseDTO } from '../dto/scramble.dto';
import type { ScrambleResponse } from '../../model/scramble';

export const ScrambleResponseMapper = (dto: ScrambleResponseDTO): ScrambleResponse => ({
  idx: dto.idx,
  attemptIdx: dto.attemptIdx,
  name: dto.name,
  cckId: dto.cckId,
  roundIdx: dto.roundIdx,
  compName: dto.compName,
  eventName: dto.eventName,
  roundName: dto.roundName,
  roundGroup: dto.roundGroup,
  seq: dto.seq,
  scramble: dto.scramble,
  svg: dto.svg,
});
