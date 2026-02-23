import { mapRegionName } from "@/shared";
import type { GlobalSingleRankingRecord } from "../../types";

export const globalRankingMapper = (
  record: GlobalSingleRankingRecord
): GlobalSingleRankingRecord => ({
  ...record,
  state: mapRegionName(record.state) ?? record.state,
});
