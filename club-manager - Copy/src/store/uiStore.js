import { create } from 'zustand';
import { STORAGE_KEYS } from '../constants';

export const useUIStore = create((set) => ({
  theme: localStorage.getItem(STORAGE_KEYS.THEME) || 'dark',
  language: localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'vi',
  sidebarCollapsed: false,

  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    return { theme: newTheme };
  }),

  setLanguage: (lang) => set(() => {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    return { language: lang };
  }),

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
