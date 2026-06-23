import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, authApi } from '../lib/api';

type AuthState = {
  user: User | null;
  token: string | null;
  salon: { id: string; name: string; slug: string } | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string; role: 'client' | 'professional' }) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
  setSalon: (salon: { id: string; name: string; slug: string } | null) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      salon: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { token, user } = await authApi.login(email, password);
          localStorage.setItem('af_nail_token', token);
          set({ token, user, isLoading: false });
          // fetch salon if professional
          if (user.role === 'professional') {
            const { salon } = await authApi.me();
            set({ salon: salon ? { id: salon.id, name: salon.name, slug: salon.slug } : null });
          }
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const { token, user } = await authApi.register(data);
          localStorage.setItem('af_nail_token', token);
          set({ token, user, isLoading: false });
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      logout: () => {
        localStorage.removeItem('af_nail_token');
        set({ user: null, token: null, salon: null });
      },

      refreshMe: async () => {
        try {
          const { user, salon } = await authApi.me();
          set({
            user,
            salon: salon ? { id: salon.id, name: salon.name, slug: salon.slug } : null,
          });
        } catch {
          get().logout();
        }
      },

      setSalon: (salon) => set({ salon }),
    }),
    {
      name: 'af-nail-auth',
      partialize: (state) => ({ user: state.user, token: state.token, salon: state.salon }),
    }
  )
);
