export type RequestErrorKind = "unauthorized" | "network" | "unknown";

const UNAUTHORIZED_PATTERNS = [/401/, /unauthorized/i, /인증/i, /권한/i, /토큰/i, /로그인/i];
const NETWORK_PATTERNS = [
  /네트워크 오류/i,
  /응답이 없습니다/i,
  /internal server error/i,
  /서버 오류/i,
  /500/,
  /server communication/i,
  /통신 실패/i,
  /network error/i,
  /failed to fetch/i,
  /err_network/i,
  /timeout/i,
];

export const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  return fallbackMessage;
};

export const classifyRequestError = (message?: string | null): RequestErrorKind => {
  if (!message) return "unknown";

  if (UNAUTHORIZED_PATTERNS.some((pattern) => pattern.test(message))) {
    return "unauthorized";
  }
  if (NETWORK_PATTERNS.some((pattern) => pattern.test(message))) {
    return "network";
  }
  return "unknown";
};

export const shouldUseRequestErrorPage = (message?: string | null) => {
  const kind = classifyRequestError(message);
  return kind === "unauthorized" || kind === "network";
};
