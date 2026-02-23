export type TaggedCard = {
  uid: string;
  name?: string;
  cckId?: string;
};

const normalizeTag = (value: string) => value.replace(/\r?\n/g, "").trim();
export const hasKoreanChar = (value: string) => /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(value);

export const parseTaggedCard = (rawValue: string): TaggedCard | null => {
  const value = normalizeTag(rawValue);
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    const uid =
      parsed.uid ?? parsed.tagUid ?? parsed.playerUid ?? parsed.scramblerUid ?? parsed.rfid ?? parsed.cardUid;

    if (typeof uid === "string" && uid.trim()) {
      const name = typeof parsed.name === "string" ? parsed.name : undefined;
      const cckId =
        typeof parsed.cckId === "string"
          ? parsed.cckId
          : typeof parsed.cckID === "string"
            ? parsed.cckID
            : typeof parsed.cck_id === "string"
              ? parsed.cck_id
              : undefined;

      return { uid: uid.trim(), name, cckId };
    }
  } catch {
    // RFID 리더가 JSON이 아닌 문자열을 보낼 수 있어 문자열 파싱도 지원한다.
  }

  const tokens = value
    .split(/[|,;\t]/)
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.length >= 3) {
    return { uid: tokens[0], name: tokens[1], cckId: tokens[2] };
  }

  if (tokens.length === 2) {
    return { uid: tokens[0], name: tokens[1] };
  }

  return { uid: value };
};
