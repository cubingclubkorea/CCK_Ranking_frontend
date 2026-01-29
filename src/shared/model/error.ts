/**
 * 백엔드 에러 응답 타입
 */
export interface ErrorResponse {
  status: number;
  name: string;
  code: string;
  message: string;
  detailMessage: string;
}
