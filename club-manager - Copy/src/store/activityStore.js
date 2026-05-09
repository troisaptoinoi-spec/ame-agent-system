// Activity Store — Firestore-based with realtime sync
import { create } from 'zustand';
import {
  collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { MAX_ACTIVITIES } from '../constants';

export const useActivityStore = create((set, get) => ({
  activities: [],
  isLoading: true,
  error: null,
  _unsubscribe: null,

  // Subscribe to realtime updates
  subscribe: () => {
    const q = query(
      collection(db, 'activities'),
      orderBy('createdAt', 'desc'),
      limit(MAX_ACTIVITIES)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const activities = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate?.()?.toISOString() || null,
        }));
        set({ activities, isLoading: false, error: null });
      },
      (error) => {
        console.error('[Activities] Listener error:', error);
        set({ error: error.message, isLoading: false });
      }
    );
    set({ _unsubscribe: unsubscribe });
    return unsubscribe;
  },

  unsubscribeAll: () => {
    const unsub = get()._unsubscribe;
    if (unsub) unsub();
  },

  // Add activity
  addActivity: async (userId, action, targetType, targetName) => {
    try {
      await addDoc(collection(db, 'activities'), {
        userId: userId || auth.currentUser?.uid || 'system',
        action,
        targetType,
        targetName,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('[Activities] Add error:', error);
    }
  },

  clearActivities: () => {
    set({ activities: [] });
  },
}));
