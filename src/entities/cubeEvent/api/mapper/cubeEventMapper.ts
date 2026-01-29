import type { CubeEventDTO } from '../dto/cubeEvent.dto';
import type { CubeEvent } from '../../model/cubeEvent';

export const CubeEventMapper = (dto: CubeEventDTO): CubeEvent => ({
  eventName: dto.eventName,
  avgCalc: dto.avgCalc,
  colorType: dto.colorType,
});
