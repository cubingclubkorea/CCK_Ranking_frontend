import type { EventFee } from './eventFee';

export interface Competition {
  idx: number;
  compName: string;
  compDateStart: Date;
  compDateEnd: Date;
  joinDateStart: Date;
  joinDateEnd: Date;
  baseFee: number;
  location: string;
  maxParticipate: number;
  createdAt: Date;
  updatedAt: Date;
  eventFeeList: EventFee[];
}
