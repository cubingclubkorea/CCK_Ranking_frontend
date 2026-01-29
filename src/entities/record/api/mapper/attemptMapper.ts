import type { AttemptDTO } from '../dto/attempt.dto';
import type { Attempt } from '../../model/attempt';

export const AttemptMapper = (dto: AttemptDTO): Attempt => ({
  idx: dto.idx,
  recordIdx: dto.recordIdx,
  attemptTry: dto.attemptTry,
  time: dto.time,
  scramblerName: dto.scramblerName,
  scramblerCckId: dto.scramblerCckId,
  judgeName: dto.judgeName,
  judgeCckId: dto.judgeCckId,
  extra: dto.extra,
  exReason: dto.exReason,
  delegateName: dto.delegateName,
  delegateCckId: dto.delegateCckId,
  exScramblerName: dto.exScramblerName,
  exScramblerCckId: dto.exScramblerCckId,
});
