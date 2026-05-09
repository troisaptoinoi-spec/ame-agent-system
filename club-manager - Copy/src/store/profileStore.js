import { create } from 'zustand';

export const useProfileStore = create((set) => ({
  viewingMember: null,
  
  viewProfile: (member) => {
    set({ viewingMember: member });
  },
  
  closeProfile: () => {
    set({ viewingMember: null });
  }
}));
