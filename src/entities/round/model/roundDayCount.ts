import type { Round } from "./round";

export interface RoundDayCount {
  past: Round[];
  now: Round[];
  future: Round[];
}
