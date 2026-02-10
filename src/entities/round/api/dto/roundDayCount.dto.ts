import type { RoundDTO } from "./round.dto";

export interface RoundDayCountDTO {
  past: RoundDTO[];
  now: RoundDTO[];
  future: RoundDTO[];
}
