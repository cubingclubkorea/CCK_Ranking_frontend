import axios, { type AxiosInstance } from 'axios';
import { API_URL, type ErrorResponse } from '@/shared';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const AUTH_EVENT = 'auth-change';

type RetryableRequestConfig = {
  _retry?: boolean;
  headers?: Record<string, string>;
  url?: string;
};

const notifyAuthChange = () => {
  window.dispatchEvent(new Event(AUTH_EVENT));
};

const setAccessToken = (token: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  notifyAuthChange();
};

const clearAuthTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  notifyAuthChange();
};

const isAuthEndpoint = (url?: string) => {
  if (!url) return false;
  return (
    url.includes('/auth/token') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/logout') ||
    url.includes('/auth/csrf')
  );
};

type RefreshResponse = {
  access_token?: string;
};

export class ApiClient {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];
  private refreshRejectors: ((error: unknown) => void)[] = [];

  constructor(url: string) {
    this.axiosInstance = axios.create({
      baseURL: url,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // CSRF 쿠키 전송을 위해 필요
    });

    // 요청 인터셉터: Access Token 자동 추가
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 응답 인터셉터: 에러 처리
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response) {
          const errorData: ErrorResponse | undefined = error.response.data;
          
          // 401 에러 시 토큰 제거 (인증 만료 또는 유효하지 않은 토큰)
          if (error.response.status === 401) {
            const originalRequest = (error.config ?? {}) as RetryableRequestConfig;
            const originalUrl = originalRequest.url;
            const hasToken = !!localStorage.getItem(ACCESS_TOKEN_KEY);

            if (!originalRequest._retry && hasToken && !isAuthEndpoint(originalUrl)) {
              if (this.isRefreshing) {
                return new Promise((resolve, reject) => {
                  this.refreshSubscribers.push((token) => {
                    const nextRequest = {
                      ...originalRequest,
                      headers: {
                        ...(originalRequest.headers ?? {}),
                        Authorization: `Bearer ${token}`,
                      },
                    };
                    resolve(this.axiosInstance(nextRequest));
                  });
                  this.refreshRejectors.push(reject);
                });
              }

              originalRequest._retry = true;
              this.isRefreshing = true;

              try {
                const csrfResponse = await this.axiosInstance.get('/auth/csrf');
                const csrfToken = csrfResponse.headers['x-csrf-token'] || '';
                const refreshData = await this.axiosInstance.post<RefreshResponse>(
                  '/auth/refresh',
                  {},
                  {
                    headers: {
                      'X-XSRF-TOKEN': csrfToken,
                    },
                  }
                );
                const refreshedToken = refreshData.data.access_token;

                if (!refreshedToken) {
                  throw new Error('토큰 갱신에 실패했습니다.');
                }

                setAccessToken(refreshedToken);

                this.refreshSubscribers.forEach((callback) => callback(refreshedToken));
                this.refreshSubscribers = [];
                this.refreshRejectors = [];

                const retryRequest = {
                  ...originalRequest,
                  headers: {
                    ...(originalRequest.headers ?? {}),
                    Authorization: `Bearer ${refreshedToken}`,
                  },
                };

                return await this.axiosInstance(retryRequest);
              } catch (refreshError) {
                console.warn('401 Unauthorized: 토큰 갱신 실패로 인증 정보를 제거합니다.');
                clearAuthTokens();
                this.refreshRejectors.forEach((reject) => reject(refreshError));
                this.refreshSubscribers = [];
                this.refreshRejectors = [];
              } finally {
                this.isRefreshing = false;
              }
            } else {
              console.warn('401 Unauthorized: 토큰이 만료되었거나 유효하지 않습니다. 토큰을 제거합니다.');
              clearAuthTokens();
            }
          }
          
          // 백엔드 커스텀 에러 메시지 파싱
          let customMessage = '';
          if (errorData?.message) {
            customMessage = errorData.message;
            if (errorData.detailMessage) {
              customMessage += `: ${errorData.detailMessage}`;
            }
            customMessage += ` [${errorData.code}]`;
          } else {
            const rawData = error.response.data;
            const dataText =
              typeof rawData === 'string'
                ? rawData
                : rawData
                  ? JSON.stringify(rawData)
                  : '';
            customMessage = error.response.statusText || '알 수 없는 오류가 발생했습니다.';
            if (dataText) {
              customMessage += `: ${dataText}`;
            }
          }
          
          console.error('API Error:', {
            status: error.response.status,
            code: errorData?.code,
            name: errorData?.name,
            message: customMessage
          });
          
          // 커스텀 에러 메시지를 포함한 Error 객체 생성
          const customError = new Error(customMessage) as Error & {
            response?: unknown;
            status?: number;
          };
          customError.response = error.response;
          customError.status = error.response.status;
          return Promise.reject(customError);
        } else if (error.request) {
          console.error('No response received:', error.request);
          throw new Error('네트워크 오류: 서버로부터 응답이 없습니다. CORS 설정을 확인하세요.');
        } else {
          console.error('Request setup error:', error.message);
          throw new Error(`요청 오류: ${error.message}`);
        }
      }
    );
  }

  private normalizeEndpoint(endpoint: string): string {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    return endpoint.replace(/^\/+/, '');
  }

  public async get<TResult = unknown>(
    endpoint: string,
    queryParams?: Record<string, any>
  ): Promise<TResult> {
    const { data } = await this.axiosInstance.get<TResult>(this.normalizeEndpoint(endpoint), {
      params: queryParams,
    });
    return data;
  }

  public async post<TResult = unknown, TData = any>(
    endpoint: string,
    body: TData,
    config?: any
  ): Promise<TResult> {
    const { data } = await this.axiosInstance.post<TResult>(
      this.normalizeEndpoint(endpoint),
      body,
      config
    );
    return data;
  }

  public async put<TResult = unknown, TData = Record<string, unknown>>(
    endpoint: string,
    body: TData
  ): Promise<TResult> {
    const { data } = await this.axiosInstance.put<TResult>(
      this.normalizeEndpoint(endpoint),
      body
    );
    return data;
  }

  public async patch<TResult = unknown, TData = Record<string, unknown>>(
    endpoint: string,
    body: TData
  ): Promise<TResult> {
    const { data } = await this.axiosInstance.patch<TResult>(
      this.normalizeEndpoint(endpoint),
      body
    );
    return data;
  }

  public async delete<TResult = unknown, TData = unknown>(
    endpoint: string,
    body?: TData
  ): Promise<TResult> {
    const { data } = await this.axiosInstance.delete<TResult>(
      this.normalizeEndpoint(endpoint),
      {
        data: body,
      }
    );
    return data;
  }

  // Raw axios instance를 반환 (특수한 경우에 사용)
  public getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

export const apiClient = new ApiClient(API_URL);
