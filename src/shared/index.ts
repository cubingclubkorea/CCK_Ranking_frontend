// Barrel for `src/shared`
// Add shared utilities, hooks, and primitives here
export { API_URL, SSO_URL, GROUPS_API_URL, LOGIN_URL, ANALYTICS_ID, MODE } from './config';
export { apiClient } from './api/base';
export { ssoClient } from './api/auth_base';
export type { Page } from './model/page';
export type { ErrorResponse } from './model/error';
export {
  mapRegionName,
  REGION_FILTER_OPTIONS,
  getRegionLogoSrc,
  resolveRegionKey,
  mapRegionKeyToLabel,
} from './model/region';
export {
  getRequiredAttemptCount,
  getMainAttempts,
  calculateAverageByRule,
  resolveAverageValue,
  normalizeAvgCalc,
  isAo12AvgCalc,
  isBo3AvgCalc,
  isSingleAvgCalc,
  isBA5Format,
  getWorstAttemptTrySet,
} from './model/averageRule';
export { getEventIconSrc } from './utils/eventIcon';
export { getNewRecordBadgeSrc } from './utils/newRecord';
export { classifyRequestError, getErrorMessage, shouldUseRequestErrorPage } from './utils/requestError';
export * from './utils/apiHandler';
