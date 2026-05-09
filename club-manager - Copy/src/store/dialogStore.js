import { create } from 'zustand';

export const useDialogStore = create((set) => ({
  dialog: null,

  showConfirm: ({ title, message, onConfirm, danger = true }) => {
    set({ dialog: { title, message, onConfirm, danger } });
  },

  closeDialog: () => set({ dialog: null }),
}));
