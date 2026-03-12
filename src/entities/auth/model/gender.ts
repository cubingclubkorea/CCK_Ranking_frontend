export const Gender = {
    Male: 'Male',
    Female: 'Female',
    Unknown: 'Unknown'
} as const;

export type Gender = typeof Gender[keyof typeof Gender];