import type { Gender } from "./gender";

export interface SearchInfo {
    name: string;
    enName: string;
    state: string;
    gender: Gender;
    cckId: string;
    wcaId: string;
}