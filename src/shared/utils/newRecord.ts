const NEW_RECORD_TYPES = ["PR", "SR", "CCR"] as const;

export type NewRecordType = (typeof NEW_RECORD_TYPES)[number];

const isNewRecordType = (value: unknown): value is NewRecordType =>
  typeof value === "string" && NEW_RECORD_TYPES.includes(value as NewRecordType);

export const getNewRecordBadgeSrc = (value: unknown): string | null => {
  if (!isNewRecordType(value)) return null;
  return `/icon/newRecord/${value}.svg`;
};

