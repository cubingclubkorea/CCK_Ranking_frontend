export type TrendPoint = {
  idx: number;
  recordId: number;
  label: string;
  compName: string;
  roundName: string;
  roundIdx: number;
  compIdx: number;
  single: number | null;
  average: number | null;
};

export type ThemeMode = "light" | "dark";
