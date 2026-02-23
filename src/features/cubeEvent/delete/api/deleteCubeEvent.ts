import { apiClient } from "@/shared/api/base";

const BASE_URL = "/event";

export const deleteCubeEvent = async (eventName: string): Promise<void> => {
  await apiClient.delete<void>(`${BASE_URL}/${encodeURIComponent(eventName)}`);
};

