export const ColorTypeDTO = {
  cube: 'cube',
  tetra: 'tetra',
  dode: 'dode',
  skewb: 'skewb',
  clock: 'clock',
  square: 'square',
  none: 'none',
} as const;

export type ColorTypeDTO = typeof ColorTypeDTO[keyof typeof ColorTypeDTO];

export interface CubeEventDTO {
  eventName: string;
  avgCalc: string;
  colorType: ColorTypeDTO;
}
