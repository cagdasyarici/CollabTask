import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import AuthService from '../services/auth.service';

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: { name: string; email: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<boolean>;
  verifyToken: () => Promise<boolean>;
  autoLogin: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login action
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await AuthService.login({ email, password });
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              token: response.data.token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            set({
              isLoading: false,
              error: response.error || 'Giriş başarısız',
            });
            return false;
          }
        } catch (error) {
          console.error('Login error:', error);
          set({
            isLoading: false,
            error: 'Giriş yapılırken bir hata oluştu',
          });
          return false;
        }
      },

      // Register action
      register: async (userData: { name: string; email: string; password: string }) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await AuthService.register(userData);
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              token: response.data.token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            set({
              isLoading: false,
              error: response.error || 'Kayıt başarısız',
            });
            return false;
          }
        } catch (error) {
          console.error('Register error:', error);
          set({
            isLoading: false,
            error: 'Kayıt olurken bir hata oluştu',
          });
          return false;
        }
      },

      // Logout action
      logout: async () => {
        set({ isLoading: true });
        
        try {
          await AuthService.logout();
        } catch (error) {
          console.warn('Logout API call failed:', error);
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      // Update profile action
      updateProfile: async (profileData: Partial<User>) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await AuthService.updateProfile(profileData);
          
          if (response.success && response.data) {
            set({
              user: response.data,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            set({
              isLoading: false,
              error: response.error || 'Profil güncellenirken hata oluştu',
            });
            return false;
          }
        } catch (error) {
          console.error('Update profile error:', error);
          set({
            isLoading: false,
            error: 'Profil güncellenirken bir hata oluştu',
          });
          return false;
        }
      },

      // Verify token action
      verifyToken: async () => {
        try {
          const response = await AuthService.verifyToken();
          
          if (response.success && response.data) {
            set({
              user: response.data,
              isAuthenticated: true,
              error: null,
            });
            return true;
          } else {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              error: null,
            });
            return false;
          }
        } catch (error) {
          console.error('Token verification error:', error);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          });
          return false;
        }
      },

      // Auto login action
      autoLogin: async () => {
        set({ isLoading: true });
        
        try {
          const success = await AuthService.autoLogin();
          
          if (success) {
            const user = AuthService.getStoredUser();
            const token = AuthService.getStoredToken();
            
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
          
          return success;
        } catch (error) {
          console.error('Auto login error:', error);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          return false;
        }
      },

      // Utility actions
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Initialize auth store
const initializeAuth = async () => {
  const { autoLogin } = useAuthStore.getState();
  await autoLogin();
  
  // Setup token refresh
  AuthService.setupTokenRefresh();
};

// Call initialization
initializeAuth();