import axios, { type AxiosInstance } from 'axios';
import { SSO_URL } from '@/shared';

export class SSOClient {
  private axiosInstance: AxiosInstance;

  constructor(url: string) {
    this.axiosInstance = axios.create({
      baseURL: url,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // 요청 인터셉터: Access Token 자동 추가 (관리자 인증 API 포함)
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
          // 서버가 응답했지만 2xx 범위를 벗어난 상태 코드
          console.error('API Error:', error.response.status, error.response.data);
          throw new Error(
            `HTTP error! Status: ${error.response.status} - ${error.response.data?.message || error.message}`
          );
        } else if (error.request) {
          // 요청은 보냈지만 응답이 없음 (CORS 에러 포함)
          console.error('No response received:', error.request);
          throw new Error('네트워크 오류: 서버로부터 응답이 없습니다. CORS 설정을 확인하세요.');
        } else {
          // 요청 설정 중 에러 발생
          console.error('Request setup error:', error.message);
          throw new Error(`요청 오류: ${error.message}`);
        }
      }
    );
  }

  public async get<TResult = unknown>(
    endpoint: string,
    queryParams?: Record<string, unknown>
  ): Promise<TResult> {
    const { data } = await this.axiosInstance.get<TResult>(endpoint, {
      params: queryParams,
    });
    return data;
  }

  public async post<TResult = unknown, TData = Record<string, unknown>>(
    endpoint: string,
    body: TData
  ): Promise<TResult> {
    const { data } = await this.axiosInstance.post<TResult>(endpoint, body);
    return data;
  }

  public async put<TResult = unknown, TData = Record<string, unknown>>(
    endpoint: string,
    body: TData
  ): Promise<TResult> {
    const { data } = await this.axiosInstance.put<TResult>(endpoint, body);
    return data;
  }

  public async patch<TResult = unknown, TData = Record<string, unknown>>(
    endpoint: string,
    body: TData
  ): Promise<TResult> {
    const { data } = await this.axiosInstance.patch<TResult>(endpoint, body);
    return data;
  }

  public async delete<TResult = unknown>(endpoint: string): Promise<TResult> {
    const { data } = await this.axiosInstance.delete<TResult>(endpoint);
    return data;
  }
}

export const ssoClient = new SSOClient(SSO_URL);
