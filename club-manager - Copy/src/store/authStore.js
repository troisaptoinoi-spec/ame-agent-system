// Firebase Auth Store — Session-based authentication
import { create } from 'zustand';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

export const useAuthStore = create((set, get) => ({
  // currentUser = Firestore user document (có role, name, departmentId, etc.)
  // Đây là field chính mà tất cả components dùng
  currentUser: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  _unsubProfile: null,

  // Khởi tạo auth listener — gọi 1 lần trong App.jsx
  initAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Load user profile từ Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userProfile = userDoc.exists()
            ? { id: firebaseUser.uid, ...userDoc.data() }
            : null;

          set({
            currentUser: userProfile,  // Firestore document — có role, name, etc.
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Subscribe to user profile changes realtime
          const unsubProfile = onSnapshot(
            doc(db, 'users', firebaseUser.uid),
            (snapshot) => {
              if (snapshot.exists()) {
                set({ currentUser: { id: firebaseUser.uid, ...snapshot.data() } });
              }
            },
            (error) => {
              console.error('[Auth] Profile listener error:', error);
            }
          );

          set({ _unsubProfile: unsubProfile });
        } catch (error) {
          console.error('[Auth] Init error:', error);
          set({
            currentUser: null,
            isAuthenticated: true,
            isLoading: false,
            error: error.message,
          });
        }
      } else {
        // Cleanup profile listener
        const unsubProfile = get()._unsubProfile;
        if (unsubProfile) unsubProfile();

        set({
          currentUser: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          _unsubProfile: null,
        });
      }
    });

    return unsubscribe;
  },

  // Force logout
  forceLogout: () => {
    const unsubProfile = get()._unsubProfile;
    if (unsubProfile) unsubProfile();
    set({
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
      _unsubProfile: null,
    });
  },
}));
