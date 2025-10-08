import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { ApiResponse } from 'collabtask-core';
import { AuthService } from './auth.service';

// API base URL - backend server'ın adresi
const API_BASE_URL = 'http://localhost:3000';

// ApiResponse tipi core paketinden alınır

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - token ekleme
    this.api.interceptors.request.use(
      (config) => {
        const token = AuthService.getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          const url: string = error.config?.url || '';
          const isAuthPublic = url.includes('/api/auth/login') || url.includes('/api/auth/signup') || url.includes('/api/auth/forgot-password');
          if (!isAuthPublic) {
            AuthService.clearStoredAuthData();
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic GET request
  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.get<ApiResponse<T>>(endpoint, config);
      return response.data;
    } catch (error: unknown) {
      return this.handleError(error);
    }
  }

  // Generic POST request
  async post<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.post<ApiResponse<T>>(endpoint, data, config);
      return response.data;
    } catch (error: unknown) {
      return this.handleError(error);
    }
  }

  // Generic PUT request
  async put<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.put<ApiResponse<T>>(endpoint, data, config);
      return response.data;
    } catch (error: unknown) {
      return this.handleError(error);
    }
  }

  // Generic DELETE request
  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.delete<ApiResponse<T>>(endpoint, config);
      return response.data;
    } catch (error: unknown) {
      return this.handleError(error);
    }
  }

  // File upload
  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, unknown>): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, String(value));
        });
      }

      const response = await this.api.post<ApiResponse<T>>(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: unknown) {
      return this.handleError(error);
    }
  }

  // Error handler
  private handleError<T>(error: unknown): ApiResponse<T> {
    console.error('API Error:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error
        return {
          success: false,
          error: (error.response.data?.message || error.response.data?.error || 'Sunucu hatası') as string,
        };
      } else if (error.request) {
        // Network error
        return {
          success: false,
          error: 'Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin.',
        };
      }
    }

    return {
      success: false,
      error: 'Beklenmeyen bir hata oluştu.',
    };
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.api.get('/health');
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
export default apiService; 