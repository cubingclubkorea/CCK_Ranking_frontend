// entities/eventFee/model/mapper.ts
import type { EventFeeDTO } from '../dto/eventFee.dto';
import type { EventFee } from '../../model/eventFee';

export const EventFeeMapper = (dto: EventFeeDTO): EventFee => ({
  eventName: dto.eventName,
  eventFee: dto.eventFee,
});