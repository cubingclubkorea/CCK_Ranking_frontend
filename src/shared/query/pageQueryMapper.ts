import type { PageQuery } from './pageQuery';

export const mapPageableToParams = (pageable?: PageQuery) => {
  if (!pageable) return {};

  const params: Record<string, any> = {};

  if (pageable.page !== undefined) params.page = pageable.page;
  if (pageable.size !== undefined) params.size = pageable.size;

  if (pageable.sort?.length) {
    params.sort = pageable.sort.map(s => `${s.field},${s.direction}`);
  }

  return params;
};