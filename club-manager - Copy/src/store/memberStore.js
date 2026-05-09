// Member Store — Firestore-based with realtime sync
import { create } from 'zustand';
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../services/firebase';

export const useMemberStore = create((set, get) => ({
  members: [],
  departments: [],
  isLoading: true,
  error: null,
  _unsubscribeMembers: null,
  _unsubscribeDepts: null,

  // Subscribe to realtime updates
  subscribe: () => {
    const unsubMembers = onSnapshot(
      query(collection(db, 'users'), orderBy('name')),
      (snapshot) => {
        const members = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate?.()?.toISOString() || null,
          updatedAt: d.data().updatedAt?.toDate?.()?.toISOString() || null,
        }));
        set({ members, isLoading: false });
      },
      (error) => {
        console.error('[Members] Listener error:', error);
        set({ error: error.message, isLoading: false });
      }
    );

    const unsubDepts = onSnapshot(
      query(collection(db, 'departments'), orderBy('name')),
      (snapshot) => {
        const departments = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
        }));
        set({ departments });
      },
      (error) => {
        console.error('[Departments] Listener error:', error);
      }
    );

    set({ _unsubscribeMembers: unsubMembers, _unsubscribeDepts: unsubDepts });
    return () => { unsubMembers(); unsubDepts(); };
  },

  unsubscribeAll: () => {
    const unsub1 = get()._unsubscribeMembers;
    const unsub2 = get()._unsubscribeDepts;
    if (unsub1) unsub1();
    if (unsub2) unsub2();
  },

  // Member CRUD
  addMember: async (member) => {
    try {
      await addDoc(collection(db, 'users'), {
        ...member,
        joinDate: new Date().toISOString().split('T')[0],
        points: 0,
        tasksCompleted: 0,
        isActive: true,
        isProtected: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  updateMember: async (id, updates) => {
    try {
      await updateDoc(doc(db, 'users', id), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  deleteMember: async (id) => {
    try {
      await updateDoc(doc(db, 'users', id), {
        isActive: false,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Department CRUD
  addDepartment: async (dept) => {
    try {
      await addDoc(collection(db, 'departments'), {
        ...dept,
        memberCount: 0,
        createdAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  updateDepartment: async (id, updates) => {
    try {
      await updateDoc(doc(db, 'departments', id), updates);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  deleteDepartment: async (id) => {
    try {
      await deleteDoc(doc(db, 'departments', id));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getMembersByDept: (deptId) => get().members.filter(m => m.departmentId === deptId),
}));
