import { getCubeEventList } from "@/entities/cubeEvent";

export const getRankingEventNames = async (): Promise<string[]> => {
  const events = await getCubeEventList();
  return Array.from(new Set(events.map((event) => event.eventName)));
};
