import axios, { type AxiosInstance } from 'axios';
import { API_URL } from '@/shared';

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
          console.error('API Error:', error.response.status, error.response.data);
          return Promise.reject(error);
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

  public async get<TResult = unknown>(
    endpoint: string,
    queryParams?: Record<string, any>
  ): Promise<TResult> {
    const { data } = await this.axiosInstance.get<TResult>(endpoint, {
      params: queryParams,
    });
    return data;
  }

  public async post<TResult = unknown, TData = any>(
    endpoint: string,
    body: TData,
    config?: any
  ): Promise<TResult> {
    const { data } = await this.axiosInstance.post<TResult>(endpoint, body, config);
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

  // Raw axios instance를 반환 (특수한 경우에 사용)
  public getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

export const apiClient = new ApiClient(API_URL);
