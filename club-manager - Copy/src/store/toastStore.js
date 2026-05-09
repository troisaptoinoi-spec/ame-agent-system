import { create } from 'zustand';
import { TOAST_ANIMATION_DURATION } from '../constants';

let idCounter = 0;

export const useToastStore = create((set, get) => ({
  toasts: [],

  showToast: (message, type = 'success', duration = 3000) => {
    const id = ++idCounter;
    set(state => ({ toasts: [...state.toasts.slice(-2), { id, message, type, exiting: false }] }));
    setTimeout(() => {
      set(state => ({ toasts: state.toasts.map(t => t.id === id ? { ...t, exiting: true } : t) }));
      setTimeout(() => {
        set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
      }, TOAST_ANIMATION_DURATION);
    }, duration);
  },

  dismissToast: (id) => {
    set(state => ({ toasts: state.toasts.map(t => t.id === id ? { ...t, exiting: true } : t) }));
    setTimeout(() => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })), TOAST_ANIMATION_DURATION);
  },
}));
