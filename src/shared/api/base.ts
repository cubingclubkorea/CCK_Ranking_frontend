import axios, { type AxiosInstance } from 'axios';
import { API_URL, type ErrorResponse } from '@/shared';

export class ApiClient {
  private axiosInstance: AxiosInstance;

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
      (error) => {
        if (error.response) {
          const errorData: ErrorResponse | undefined = error.response.data;
          
          // 401 에러 시 토큰 제거 (인증 만료 또는 유효하지 않은 토큰)
          if (error.response.status === 401) {
            console.warn('401 Unauthorized: 토큰이 만료되었거나 유효하지 않습니다. 토큰을 제거합니다.');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
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
            customMessage = error.response.statusText || '알 수 없는 에러';
          }
          
          console.error('API Error:', {
            status: error.response.status,
            code: errorData?.code,
            name: errorData?.name,
            message: customMessage
          });
          
          // 커스텀 에러 메시지를 포함한 Error 객체 생성
          const customError = new Error(customMessage);
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
