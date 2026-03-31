import { GROUPS_API_URL } from '@/shared';

export type RoundGroupAssignment = {
  cckId: string;
  group: string;
};

const getNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const pickString = (source: Record<string, unknown>, keys: string[]): string | null => {
  for (const key of keys) {
    const value = getNonEmptyString(source[key]);
    if (value) return value;
  }
  return null;
};

const fetchGroupsApi = async (path: string): Promise<unknown> => {
  const baseUrl = GROUPS_API_URL.trim();
  if (!baseUrl) {
    throw new Error('VITE_GROUPS_API_URL이 설정되지 않았습니다.');
  }

  const endpoint = `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
  const accessToken = localStorage.getItem('access_token');
  const response = await fetch(endpoint, {
    method: 'GET',
    credentials: 'include',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  });

  if (!response.ok) {
    const detail = (await response.text().catch(() => '')).trim();
    const suffix = detail ? `: ${detail}` : '';
    throw new Error(`Groups API 요청에 실패했습니다. (${response.status})${suffix}`);
  }

  return await response.json();
};

const extractGroupsFromPayload = (payload: unknown): string[] => {
  const groups: string[] = [];
  const seen = new Set<string>();

  const append = (value: unknown) => {
    const normalized = getNonEmptyString(value);
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    groups.push(normalized);
  };

  const visit = (value: unknown, depth: number) => {
    if (depth > 6 || value === null || value === undefined) return;

    if (Array.isArray(value)) {
      value.forEach((item) => visit(item, depth + 1));
      return;
    }

    if (typeof value === 'string') {
      append(value);
      return;
    }

    if (typeof value !== 'object') return;
    const source = value as Record<string, unknown>;

    const directGroup = pickString(source, ['group', 'groupName', 'roundGroup']);
    if (directGroup) append(directGroup);

    [
      'groups',
      'groupList',
      'roundGroupList',
      'data',
      'result',
      'rows',
      'items',
      'content',
      'competitor',
      'competitors',
      'round',
    ].forEach((key) => {
      if (key in source) {
        visit(source[key], depth + 1);
      }
    });
  };

  visit(payload, 0);
  return groups;
};

const parseRoundGroupAssignments = (payload: unknown): RoundGroupAssignment[] => {
  const merged = new Map<string, RoundGroupAssignment>();

  const upsert = (cckId: string, group: string) => {
    const existing = merged.get(cckId);
    if (!existing) {
      merged.set(cckId, { cckId, group });
      return;
    }
    if (!existing.group && group) {
      merged.set(cckId, { cckId, group });
    }
  };

  const visit = (value: unknown, depth: number) => {
    if (depth > 6 || !value) return;

    if (Array.isArray(value)) {
      value.forEach((item) => visit(item, depth + 1));
      return;
    }

    if (typeof value !== 'object') return;
    const source = value as Record<string, unknown>;

    const cckId = pickString(source, ['cckId', 'cck_id', 'memberCckId', 'playerCckId']);
    if (cckId) {
      const group = pickString(source, ['group', 'roundGroup', 'round_group']) ?? '';
      upsert(cckId, group);
    }

    [
      'competitor',
      'competitors',
      'rows',
      'items',
      'data',
      'result',
      'content',
      'participants',
      'playerList',
    ].forEach((key) => {
      if (key in source) {
        visit(source[key], depth + 1);
      }
    });
  };

  visit(payload, 0);
  return Array.from(merged.values());
};

export const getRoundGroups = async (roundIdx: number): Promise<string[]> => {
  const payload = await fetchGroupsApi(`/round/${roundIdx}/groups`);
  const parsed = extractGroupsFromPayload(payload);
  if (parsed.length > 0) return parsed;

  const fallbackPayload = await fetchGroupsApi(`/round/${roundIdx}`).catch(() => null);
  if (!fallbackPayload) return [];
  const fallbackGroups = parseRoundGroupAssignments(fallbackPayload)
    .map((item) => item.group)
    .filter((group) => group.trim().length > 0);
  return Array.from(new Set(fallbackGroups));
};

export const getRoundGroupAssignments = async (roundIdx: number): Promise<RoundGroupAssignment[]> => {
  const payload = await fetchGroupsApi(`/round/${roundIdx}`);
  return parseRoundGroupAssignments(payload);
};

