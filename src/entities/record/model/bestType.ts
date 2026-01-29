export const BestType = {
  PR: 'PR',     // Personal Record
  SR: 'SR',     // State Record
  CCR: 'CCR',   // CCK Record
} as const;

export type BestType = typeof BestType[keyof typeof BestType];
