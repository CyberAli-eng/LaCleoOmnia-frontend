import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '../types';

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  loadAuthFromStorage: () => void;
  getToken: () => string | null;
  getUser: () => User | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token: string, user: User) => {
        // Also set in cookies for middleware compatibility
        if (typeof document !== 'undefined') {
          document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
        }
        set({ token, user, isAuthenticated: true });
      },

      logout: () => {
        // Clear cookie
        if (typeof document !== 'undefined') {
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        // Clear localStorage (handled by persist middleware)
        set({ token: null, user: null, isAuthenticated: false });
      },

      loadAuthFromStorage: () => {
        const state = get();
        if (state.token) {
          set({ isAuthenticated: true });
        }
      },

      getToken: () => {
        const state = get();
        if (state.token) return state.token;

        // Fallback: try to get from cookie
        if (typeof document !== 'undefined') {
          const cookieToken = document.cookie
            .split(';')
            .find((c) => c.trim().startsWith('token='))
            ?.split('=')[1]
            ?.trim();
          if (cookieToken) {
            return cookieToken;
          }
        }

        return null;
      },

      getUser: () => {
        return get().user;
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
