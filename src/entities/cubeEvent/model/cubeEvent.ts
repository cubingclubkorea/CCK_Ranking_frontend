export const ColorType = {
  cube: 'cube',
  tetra: 'tetra',
  dode: 'dode',
  skewb: 'skewb',
  clock: 'clock',
  square: 'square',
  none: 'none',
} as const;

export type ColorType = typeof ColorType[keyof typeof ColorType];

export interface CubeEvent {
  eventName: string;
  avgCalc: string;
  colorType: ColorType;
}
