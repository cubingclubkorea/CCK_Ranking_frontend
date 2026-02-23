import { ssoClient } from "@/shared";
import type { AuthInfoResponse } from "./getAuthInfo";

export const getAuthInfoByRfid = async (rfid: string): Promise<AuthInfoResponse> => {
  const normalizedRfid = rfid.trim();
  if (!normalizedRfid) {
    throw new Error("RFID가 없습니다.");
  }

  const encoded = encodeURIComponent(normalizedRfid);
  return await ssoClient.get<AuthInfoResponse>(`/api/rfid/info/${encoded}`);
};
