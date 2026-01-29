// Centralized environment wrapper for public VITE_ variables
// Keep secrets out of client-side env; only expose non-sensitive values prefixed with VITE_

export const env = {
  API_URL: import.meta.env.VITE_API_URL ?? '',
  SSO_URL: import.meta.env.VITE_SSO_URL ?? '',
  LOGIN_URL: import.meta.env.VITE_LOGIN_URL ?? '',
  ANALYTICS_ID: import.meta.env.VITE_ANALYTICS_ID ?? '',
  MODE: import.meta.env.MODE ?? 'development',
} as const;

export const API_URL = env.API_URL;
export const SSO_URL = env.SSO_URL;
export const LOGIN_URL = env.LOGIN_URL;
export const ANALYTICS_ID = env.ANALYTICS_ID;
export const MODE = env.MODE;
