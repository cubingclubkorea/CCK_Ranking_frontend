// Barrel for `src/shared`
// Add shared utilities, hooks, and primitives here
export { API_URL, SSO_URL, LOGIN_URL, ANALYTICS_ID, MODE } from './config';
export { apiClient } from './api/base';
export { ssoClient } from './api/auth_base';
export type { Page } from './model/page';
export type { ErrorResponse } from './model/error';
export { mapRegionName } from './model/region';
export { getEventIconSrc } from './utils/eventIcon';
export * from './utils/apiHandler';
