export const Gender = {
    Male: 'MALE',
    Female: 'FEMALE', 
    Unknown: 'UNKNOWN'
} as const;

export type Gender = typeof Gender[keyof typeof Gender];