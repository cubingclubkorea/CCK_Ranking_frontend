import { apiClient } from "@/shared/api/base";
import type { RecordInfoUpdateDTO } from "./dto/recordInfoUpdate.dto";

const BASE_URL = "/record";

/**
 * 기록 기본 정보(PDX, 그룹) 업데이트
 */
export const updateRecordInfo = async (dto: RecordInfoUpdateDTO): Promise<void> => {
  const recordIdx = dto.recordIdx ?? dto.idx;
  if (!recordIdx) {
    throw new Error("recordIdx 또는 idx가 필요합니다.");
  }

  await apiClient.patch<void, { idx: number; pdx: number; roundGroup: string }>(BASE_URL, {
    idx: recordIdx,
    pdx: dto.pdx,
    roundGroup: dto.roundGroup,
  });
};
