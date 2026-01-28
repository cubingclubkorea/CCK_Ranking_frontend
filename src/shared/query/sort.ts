export type SortDirection = 'asc' | 'desc';

export interface Sort {
  field: string;
  direction: SortDirection;
}