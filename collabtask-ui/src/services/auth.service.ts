import { apiService } from './api.service';
import type { User } from '../types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

interface ForgotPasswordData {
  email: string;
}

interface ResetPasswordData {
  token: string;
  password: string;
}

class AuthServiceClass {
  private readonly TOKEN_KEY = 'collabtask_token';
  private readonly USER_KEY = 'collabtask_user';
  private readonly endpoint = '/api/auth';

  // Login user
  async login(credentials: LoginCredentials) {
    const response = await apiService.post<AuthResponse>(`${this.endpoint}/login`, credentials);
    
    if (response.success && response.data) {
      this.storeAuthData(response.data.user, response.data.token);
    }
    
    return response;
  }

  // Register new user
  async register(userData: RegisterData) {
    const response = await apiService.post<AuthResponse>(`${this.endpoint}/signup`, userData);
    
    if (response.success && response.data) {
      this.storeAuthData(response.data.user, response.data.token);
    }
    
    return response;
  }

  // Logout user
  async logout() {
    try {
      await apiService.post(`${this.endpoint}/logout`);
    } catch {
      // Logout API call failed, but we'll clear local data anyway
      console.warn('Logout API call failed');
    } finally {
      this.clearStoredAuthData();
    }
  }

  // Forgot password
  async forgotPassword(data: ForgotPasswordData) {
    return apiService.post(`${this.endpoint}/forgot-password`, data);
  }

  // Reset password
  async resetPassword(data: ResetPasswordData) {
    return apiService.post(`${this.endpoint}/reset-password`, data);
  }

  // Verify token
  async verifyToken() {
    const token = this.getStoredToken();
    if (!token) {
      return { success: false, error: 'No token found' };
    }

    try {
      const response = await apiService.get<User>(`${this.endpoint}/me`);
      
      if (response.success && response.data) {
        this.storeUser(response.data);
        return response;
      } else {
        this.clearStoredAuthData();
        return response;
      }
    } catch {
      this.clearStoredAuthData();
      return { success: false, error: 'Token verification failed' };
    }
  }

  // Refresh token
  async refreshToken() {
    try {
      const response = await apiService.post<AuthResponse>(`${this.endpoint}/refresh`);
      
      if (response.success && response.data) {
        this.storeAuthData(response.data.user, response.data.token);
      }
      
      return response;
    } catch {
      this.clearStoredAuthData();
      throw new Error('Token refresh failed');
    }
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string) {
    return apiService.put(`${this.endpoint}/change-password`, {
      currentPassword,
      newPassword
    });
  }

  // Get current user
  async getCurrentUser() {
    return apiService.get<User>(`${this.endpoint}/me`);
  }

  // Update current user profile
  async updateProfile(userData: Partial<User>) {
    const response = await apiService.put<User>(`${this.endpoint}/profile`, userData);
    
    if (response.success && response.data) {
      this.storeUser(response.data);
    }
    
    return response;
  }

  // Store authentication data
  private storeAuthData(user: User, token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Store user data
  private storeUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Get stored token
  getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Get stored user
  getStoredUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch {
        this.clearStoredAuthData();
        return null;
      }
    }
    return null;
  }

  // Clear stored authentication data
  clearStoredAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    return Boolean(token && user);
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    const user = this.getStoredUser();
    return user?.role === role;
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  // Check if user is manager
  isManager(): boolean {
    return this.hasRole('manager') || this.isAdmin();
  }

  // Get user permissions
  getUserPermissions(): string[] {
    const user = this.getStoredUser();
    if (!user) return [];

    const permissions: string[] = [];

    // Base permissions for all users
    permissions.push('view_profile', 'edit_profile', 'view_tasks', 'create_tasks');

    // Manager permissions
    if (this.isManager()) {
      permissions.push(
        'manage_projects',
        'assign_tasks',
        'view_reports',
        'manage_team_members'
      );
    }

    // Admin permissions
    if (this.isAdmin()) {
      permissions.push(
        'manage_users',
        'manage_system_settings',
        'view_all_data',
        'delete_data',
        'manage_permissions'
      );
    }

    return permissions;
  }

  // Check if user has specific permission
  hasPermission(permission: string): boolean {
    const permissions = this.getUserPermissions();
    return permissions.includes(permission);
  }

  // Auto-login with stored credentials (on app startup)
  async autoLogin(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      const verifyResponse = await this.verifyToken();
      return verifyResponse.success;
    } catch {
      this.clearStoredAuthData();
      return false;
    }
  }

  // Setup token refresh interval
  setupTokenRefresh(): void {
    const refreshInterval = 50 * 60 * 1000; // 50 minutes
    
    setInterval(async () => {
      if (this.isAuthenticated()) {
        try {
          await this.refreshToken();
        } catch (error) {
          console.warn('Token refresh failed:', error);
          this.clearStoredAuthData();
          window.location.href = '/login';
        }
      }
    }, refreshInterval);
  }
}

export const AuthService = new AuthServiceClass();
export default AuthService;