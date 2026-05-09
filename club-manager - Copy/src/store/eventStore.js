// Event Store — Firestore-based with realtime sync
import { create } from 'zustand';
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { useActivityStore } from './activityStore';

export const useEventStore = create((set, get) => ({
  events: [],
  isLoading: true,
  error: null,
  _unsubscribe: null,

  // Subscribe to realtime updates
  subscribe: () => {
    const q = query(collection(db, 'events'), orderBy('date'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const events = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate?.()?.toISOString() || null,
          updatedAt: d.data().updatedAt?.toDate?.()?.toISOString() || null,
        }));
        set({ events, isLoading: false, error: null });
      },
      (error) => {
        console.error('[Events] Listener error:', error);
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

  // CRUD Operations
  addEvent: async (event) => {
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, 'events'), {
        ...event,
        createdBy: user?.uid || 'system',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      useActivityStore.getState().addActivity(
        user?.uid || 'system', 'vừa thêm', 'sự kiện', event.title
      );
      return { success: true };
    } catch (error) {
      console.error('[Events] Add error:', error);
      return { success: false, error: error.message };
    }
  },

  updateEvent: async (id, data) => {
    try {
      await updateDoc(doc(db, 'events', id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error('[Events] Update error:', error);
      return { success: false, error: error.message };
    }
  },

  deleteEvent: async (id) => {
    try {
      await deleteDoc(doc(db, 'events', id));
      return { success: true };
    } catch (error) {
      console.error('[Events] Delete error:', error);
      return { success: false, error: error.message };
    }
  },
}));
