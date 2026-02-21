import { ssoClient } from "@/shared";

export type AuthInfoResponse = {
  name: string;
  state: string;
  cckId: string;
};

export const getAuthInfo = async (cckId: string): Promise<AuthInfoResponse> => {
  const normalizedCckId = cckId.trim();
  if (!normalizedCckId) {
    throw new Error("CCK ID가 없습니다.");
  }

  const encoded = encodeURIComponent(normalizedCckId);
  return await ssoClient.get<AuthInfoResponse>(`/api/auth/info/${encoded}`);
};
