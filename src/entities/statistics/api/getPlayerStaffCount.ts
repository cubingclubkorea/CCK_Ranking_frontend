import { apiClient } from "@/shared/api/base";
import type { PlayerStaffCountResponse } from "../model/playerStats";

const BASE_URL = "/statistics/player";

const parseCount = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return 0;
};

const parseStaffCounts = (data: unknown): { judgeCount: number; scramblerCount: number; totalCount: number } => {
  if (!data || typeof data !== "object") {
    return { judgeCount: 0, scramblerCount: 0, totalCount: 0 };
  }

  const source = data as Record<string, unknown>;
  const judgeCount = parseCount(source.judgeCount ?? source.judge_count ?? source.judge);
  const scramblerCount = parseCount(source.scramblerCount ?? source.scrambler_count ?? source.scrambler);
  const fallbackTotal = parseCount(source.staffCount ?? source.staff_count ?? source.count ?? source.total);
  const calculatedTotal = judgeCount + scramblerCount;

  return {
    judgeCount,
    scramblerCount,
    totalCount: calculatedTotal > 0 ? calculatedTotal : fallbackTotal,
  };
};

const parseRole = (data: unknown): string | undefined => {
  if (!data || typeof data !== "object") return undefined;
  const source = data as Record<string, unknown>;

  const directCandidates = [source.role, source.userRole, source.memberRole];
  for (const value of directCandidates) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  const roles = source.roles;
  if (Array.isArray(roles)) {
    const firstStringRole = roles.find((item) => typeof item === "string" && item.trim());
    if (typeof firstStringRole === "string") {
      return firstStringRole.trim();
    }
  }

  return undefined;
};

const parseOrganizer = (data: unknown, role?: string) => {
  const organizerPattern = /ADMIN|ORGANIZER|ROOT|관리자|운영/i;
  if (!data || typeof data !== "object") {
    return role ? organizerPattern.test(role) : false;
  }
  const source = data as Record<string, unknown>;
  if (source.admin === true || source.isAdmin === true || source.organizer === true || source.isOrganizer === true) {
    return true;
  }
  if (role) {
    return organizerPattern.test(role);
  }
  const roles = source.roles;
  if (Array.isArray(roles)) {
    return roles.some((item) => typeof item === "string" && organizerPattern.test(item));
  }
  return false;
};

export const getPlayerStaffCount = async (cckId: string): Promise<PlayerStaffCountResponse> => {
  const encoded = encodeURIComponent(cckId);
  const data = await apiClient.get<unknown>(`${BASE_URL}/${encoded}/staff-count`);
  const role = parseRole(data);
  const counts = parseStaffCounts(data);
  return {
    ...counts,
    role,
    isOrganizer: parseOrganizer(data, role),
  };
};
