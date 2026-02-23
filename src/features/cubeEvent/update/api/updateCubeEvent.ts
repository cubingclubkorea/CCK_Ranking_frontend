import { apiClient } from "@/shared/api/base";
import type { UpdateCubeEventParams } from "./dto/cubeEventUpdate.dto";

const BASE_URL = "/event";

export const updateCubeEvent = async (params: UpdateCubeEventParams): Promise<void> => {
  const formData = new FormData();
  formData.append("eventName", params.eventName);
  formData.append("avgCalc", params.avgCalc);
  formData.append("colorType", params.colorType);

  if (params.file) {
    formData.append("file", params.file);
  }

  await apiClient.getAxiosInstance().put(BASE_URL, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

