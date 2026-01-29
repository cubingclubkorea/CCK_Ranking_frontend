export interface AttemptDTO {
  idx: number;
  recordIdx: number;
  attemptTry: number;
  time: number;
  scramblerName: string;
  scramblerCckId: string;
  judgeName: string;
  judgeCckId: string;
  extra?: number;
  exReason?: string;
  delegateName?: string;
  delegateCckId?: string;
  exScramblerName?: string;
  exScramblerCckId?: string;
}
