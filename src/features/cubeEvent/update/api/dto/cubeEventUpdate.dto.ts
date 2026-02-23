import type { ColorType } from "@/entities/cubeEvent/model/cubeEvent";

export interface UpdateCubeEventParams {
  eventName: string;
  avgCalc: string;
  colorType: ColorType;
  file?: File;
}

