import type { Sort } from "./sort";

export interface PageQuery {
    page?: number;
    size?: number;
    sort?: Sort[];
}