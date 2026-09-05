import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ConfigState {
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      geminiApiKey: '',
      setGeminiApiKey: (key) => set({ geminiApiKey: key.trim() }),
    }),
    {
      name: 'hexagon-config',
      partialize: (state) => ({ geminiApiKey: state.geminiApiKey }),
    }
  )
);

/** Read the saved API key from localStorage without needing a React hook. */
export function readApiKeyFromStorage(): string {
  if (typeof window === 'undefined') return '';
  try {
    const raw = window.localStorage.getItem('hexagon-config');
    if (!raw) return '';
    const parsed = JSON.parse(raw);
    return parsed?.state?.geminiApiKey || '';
  } catch {
    return '';
  }
}