const ACCESS_TOKEN_KEY = 'access_token';
const AUTH_EVENT = 'auth-change';

const notifyAuthChange = () => {
  window.dispatchEvent(new Event(AUTH_EVENT));
};

/**
 * Access Token 저장
 */
export const setAccessToken = (token: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  notifyAuthChange();
};

/**
 * Access Token 조회
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Access Token 삭제
 */
export const removeAccessToken = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  notifyAuthChange();
};

/**
 * Access Token 존재 여부 확인
 */
export const hasAccessToken = (): boolean => {
  return !!getAccessToken();
};

export const authChangeEvent = AUTH_EVENT;

type AccessTokenPayload = Record<string, unknown>;

const decodeBase64Url = (value: string): string | null => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  try {
    return atob(padded);
  } catch {
    return null;
  }
};

const getAccessTokenPayload = (): AccessTokenPayload | null => {
  const token = getAccessToken();
  if (!token) return null;

  const tokenPart = token.includes('.') ? token.split('.')[1] : token;
  const decoded = decodeBase64Url(tokenPart);
  if (!decoded) return null;

  try {
    return JSON.parse(decoded) as AccessTokenPayload;
  } catch {
    return null;
  }
};

const extractRoles = (payload: AccessTokenPayload): string[] => {
  const raw =
    payload.role ??
    payload.roles ??
    payload.authority ??
    payload.authorities ??
    payload.scope ??
    payload.scopes;

  if (Array.isArray(raw)) {
    return raw.filter((role) => typeof role === 'string') as string[];
  }

  if (typeof raw === 'string') {
    return raw.split(/[,\s]+/).filter(Boolean);
  }

  return [];
};

export const hasAdminRole = (): boolean => {
  const payload = getAccessTokenPayload();
  if (!payload) return false;

  if (payload.admin === true || payload.isAdmin === true) return true;

  const roles = extractRoles(payload).map((role) => role.toUpperCase());
  return roles.includes('ADMIN') || roles.includes('ROLE_ADMIN');
};
