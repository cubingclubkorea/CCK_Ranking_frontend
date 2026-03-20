import { apiClient } from "@/shared/api/base";
import { getRoundGroupAssignments } from "@/entities/round";

export type CompetitionParticipantHint = {
  cckId: string;
  state?: string;
  confirmedGroup?: string;
  paymentConfirmed?: boolean | null;
  compIdx?: number;
};

const getString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const getNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const pickString = (source: Record<string, unknown>, keys: string[]): string | null => {
  for (const key of keys) {
    const value = getString(source[key]);
    if (value) return value;
  }
  return null;
};

const pickNumber = (source: Record<string, unknown>, keys: string[]): number | null => {
  for (const key of keys) {
    const value = getNumber(source[key]);
    if (value !== null) return value;
  }
  return null;
};

const parsePaymentConfirmed = (source: Record<string, unknown>): boolean | null => {
  const booleanKeys = ["paid", "isPaid", "paymentConfirmed", "confirmed", "paymentDone"];
  for (const key of booleanKeys) {
    const value = source[key];
    if (typeof value === "boolean") return value;
  }

  const status = pickString(source, [
    "paymentStatus",
    "payStatus",
    "status",
    "state",
    "paymentState",
  ]);
  if (!status) return null;

  const normalized = status.toLowerCase();
  if (
    normalized.includes("paid") ||
    normalized.includes("complete") ||
    normalized.includes("approved") ||
    normalized.includes("confirmed")
  ) {
    return true;
  }
  if (
    normalized.includes("unpaid") ||
    normalized.includes("pending") ||
    normalized.includes("cancel") ||
    normalized.includes("failed")
  ) {
    return false;
  }

  return null;
};

const normalizeRows = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const source = payload as Record<string, unknown>;
  const listKeys = ["content", "items", "rows", "data", "result", "participants", "playerList"];
  for (const key of listKeys) {
    const value = source[key];
    if (Array.isArray(value)) return value;
  }

  return [];
};

const parseHints = (payload: unknown): CompetitionParticipantHint[] => {
  const rows = normalizeRows(payload);
  return rows.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const source = row as Record<string, unknown>;

    const cckId = pickString(source, [
      "cckId",
      "cck_id",
      "memberCckId",
      "member_cck_id",
      "playerCckId",
      "player_cck_id",
    ]);
    if (!cckId) return [];

    const state = pickString(source, ["state", "region", "location", "area"]);
    const confirmedGroup = pickString(source, [
      "roundGroup",
      "group",
      "groupName",
      "confirmedGroup",
      "round_group",
      "group_name",
    ]);
    const compIdx = pickNumber(source, ["compIdx", "competitionIdx", "comp_id", "competition_id"]);
    const paymentConfirmed = parsePaymentConfirmed(source);

    return [
      {
        cckId,
        state: state ?? undefined,
        confirmedGroup: confirmedGroup ?? undefined,
        paymentConfirmed,
        compIdx: compIdx ?? undefined,
      },
    ];
  });
};

const fetchFirstSuccess = async (endpoints: string[]): Promise<CompetitionParticipantHint[]> => {
  for (const endpoint of endpoints) {
    try {
      const payload = await apiClient.get<unknown>(endpoint);
      const parsed = parseHints(payload);
      if (parsed.length > 0) return parsed;
    } catch {
      continue;
    }
  }
  return [];
};

const buildPaymentCandidates = (compIdx: number): string[] => {
  const list = [
    `/payment/comp/${compIdx}`,
    `/payment/competition/${compIdx}`,
    `/payments/comp/${compIdx}`,
    `/payments/competition/${compIdx}`,
    `/comp/${compIdx}/payment`,
    `/comp/${compIdx}/payments`,
    `/competition/${compIdx}/payment`,
    `/competition/${compIdx}/payments`,
  ];
  return Array.from(new Set(list));
};

export const getCompetitionParticipantHints = async (
  compIdx: number,
  roundIdx: number
): Promise<CompetitionParticipantHint[]> => {
  const [groupHints, paymentHints] = await Promise.all([
    getRoundGroupAssignments(roundIdx)
      .then((rows) =>
        rows.map((row) => ({
          cckId: row.cckId,
          confirmedGroup: row.group || undefined,
        }))
      )
      .catch(() => []),
    fetchFirstSuccess(buildPaymentCandidates(compIdx)),
  ]);

  const merged = new Map<string, CompetitionParticipantHint>();

  const upsert = (hint: CompetitionParticipantHint) => {
    const existing = merged.get(hint.cckId);
    if (!existing) {
      merged.set(hint.cckId, hint);
      return;
    }
    merged.set(hint.cckId, {
      cckId: hint.cckId,
      state: existing.state ?? hint.state,
      confirmedGroup: existing.confirmedGroup ?? hint.confirmedGroup,
      paymentConfirmed: existing.paymentConfirmed ?? hint.paymentConfirmed ?? null,
      compIdx: existing.compIdx ?? hint.compIdx,
    });
  };

  groupHints.forEach(upsert);
  paymentHints.forEach(upsert);

  return Array.from(merged.values());
};
