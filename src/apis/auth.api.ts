import { fetchFromApi, authFetch } from '@/utils/api';
import { API_ENDPOINTS } from '@/src/constants';
import type { User } from '@/src/types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface GoogleLoginData {
  idToken: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return fetchFromApi(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    return fetchFromApi(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  googleLogin: async (data: GoogleLoginData): Promise<AuthResponse> => {
    return fetchFromApi(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMe: async (): Promise<{ user: User }> => {
    return authFetch(API_ENDPOINTS.AUTH.ME);
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    return fetchFromApi(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
    return fetchFromApi(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },
};
