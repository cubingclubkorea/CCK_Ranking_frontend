import type { ColorType } from '@/entities/cubeEvent/model/cubeEvent';

export interface CreateCubeEventParams {
  eventName: string;
  avgCalc: string;
  colorType: ColorType;
  file?: File;
}