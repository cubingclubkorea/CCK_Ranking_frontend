// Centralized environment wrapper for public VITE_ variables
// Keep secrets out of client-side env; only expose non-sensitive values prefixed with VITE_

export const env = {
  API_URL: import.meta.env.VITE_API_URL ?? '',
  ANALYTICS_ID: import.meta.env.VITE_ANALYTICS_ID ?? '',
  MODE: import.meta.env.MODE ?? 'development',
} as const;

export type Env = typeof env;

export const getEnv = (): Env => env;

export default env;
