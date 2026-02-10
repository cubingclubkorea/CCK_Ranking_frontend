import type { RecordDTO } from '../dto/record.dto';
import type { Record } from '../../model/record';
import { BestType } from '../../model/bestType';
import { AttemptMapper } from './attemptMapper';

export const RecordMapper = (dto: RecordDTO): Record => ({
  idx: dto.idx,
  pdx: dto.pdx,
  name: dto.name ?? dto.account?.name ?? '',
  enName: dto.enName || dto.account?.enName,
  state: dto.state,
  cckId: dto.cckId,
  roundIdx: dto.roundIdx,
  roundName: dto.roundName,
  roundGroup: dto.roundGroup,
  roundAdvance: dto.roundAdvance,
  compIdx: dto.compIdx,
  compName: dto.compName,
  eventName: dto.eventName,
  avgCalc: dto.avgCalc,
  attempts: dto.attempts.map(AttemptMapper),
  single: dto.single,
  average: dto.average,
  ranking: dto.ranking,
  stateRanking: dto.stateRanking,
  singleBestType: dto.singleBestType ? BestType[dto.singleBestType as keyof typeof BestType] : undefined,
  averageBestType: dto.averageBestType ? BestType[dto.averageBestType as keyof typeof BestType] : undefined,
  note: dto.note,
});
