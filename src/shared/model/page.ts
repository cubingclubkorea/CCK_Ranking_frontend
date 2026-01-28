import type { Pagination } from "./pagination";

export interface Page<T> {
    content: T[];
    page: Pagination;
}