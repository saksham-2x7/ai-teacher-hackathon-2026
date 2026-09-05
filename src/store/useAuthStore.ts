import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TutorGender = 'male' | 'female';
export type Language = 'en' | 'hi' | 'kn' | 'hinglish';

export interface LearnerProfile {
  id: string;
  name: string;
  email: string;
  tutorGender: TutorGender;
  language: Language;
  level: 'beginner' | 'intermediate' | 'advanced';
  dailyGoalMinutes: number;
  totalStudyMinutes: number;
  streakDays: number;
  joinedAt: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  profile: LearnerProfile | null;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<LearnerProfile>) => void;
  clearError: () => void;
}

const MOCK_USER: LearnerProfile = {
  id: 'user-1',
  name: 'Dev',
  email: 'dev@hexagon.ai',
  tutorGender: 'female',
  language: 'en',
  level: 'intermediate',
  dailyGoalMinutes: 30,
  totalStudyMinutes: 1240,
  streakDays: 7,
  joinedAt: '2026-08-01',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isLoading: false,
      profile: null,
      error: null,

      login: async (email: string, _password: string) => {
        set({ isLoading: true, error: null });
        await new Promise((r) => setTimeout(r, 1200));
        if (email) {
          set({ isAuthenticated: true, profile: { ...MOCK_USER, email }, isLoading: false });
        } else {
          set({ error: 'Please enter your email and password.', isLoading: false });
        }
      },

      signup: async (name: string, email: string, _password: string) => {
        set({ isLoading: true, error: null });
        await new Promise((r) => setTimeout(r, 1400));
        set({
          isAuthenticated: true,
          profile: { ...MOCK_USER, name, email, joinedAt: new Date().toISOString() },
          isLoading: false,
        });
      },

      loginWithGoogle: async () => {
        set({ isLoading: true, error: null });
        await new Promise((r) => setTimeout(r, 1000));
        set({ isAuthenticated: true, profile: MOCK_USER, isLoading: false });
      },

      logout: () => {
        set({ isAuthenticated: false, profile: null, error: null });
      },

      updateProfile: (updates) => {
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : { ...MOCK_USER, ...updates },
        }));
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'hexagon-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        profile: state.profile,
      }),
    }
  )
);
