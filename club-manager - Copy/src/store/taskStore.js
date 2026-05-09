// Task Store — Firestore-based with realtime sync
import { create } from 'zustand';
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { useActivityStore } from './activityStore';

export const useTaskStore = create((set, get) => ({
  tasks: [],
  isLoading: true,
  error: null,
  _unsubscribe: null,

  // Subscribe to realtime updates — gọi 1 lần khi mount
  subscribe: () => {
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const tasks = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate?.()?.toISOString() || null,
          completedAt: d.data().completedAt?.toDate?.()?.toISOString() || null,
          updatedAt: d.data().updatedAt?.toDate?.()?.toISOString() || null,
        }));
        set({ tasks, isLoading: false, error: null });
      },
      (error) => {
        console.error('[Tasks] Listener error:', error);
        set({ error: error.message, isLoading: false });
      }
    );
    set({ _unsubscribe: unsubscribe });
    return unsubscribe;
  },

  // Unsubscribe khi unmount
  unsubscribeAll: () => {
    const unsub = get()._unsubscribe;
    if (unsub) unsub();
  },

  // CRUD Operations
  addTask: async (taskData) => {
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, 'tasks'), {
        ...taskData,
        creatorId: user?.uid || 'system',
        comments: [],
        attachments: taskData.attachments || [],
        points: taskData.points || 0,
        startDate: taskData.startDate || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      useActivityStore.getState().addActivity(
        user?.uid || 'system', 'vừa thêm', 'nhiệm vụ', taskData.title
      );
      return { success: true };
    } catch (error) {
      console.error('[Tasks] Add error:', error);
      return { success: false, error: error.message };
    }
  },

  updateTask: async (id, updates) => {
    try {
      await updateDoc(doc(db, 'tasks', id), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error('[Tasks] Update error:', error);
      return { success: false, error: error.message };
    }
  },

  deleteTask: async (id) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
      return { success: true };
    } catch (error) {
      console.error('[Tasks] Delete error:', error);
      return { success: false, error: error.message };
    }
  },

  moveTask: async (taskId, newStatus) => {
    const updates = { status: newStatus };
    if (newStatus === 'done' || newStatus === 'archived_completed') {
      updates.completedAt = serverTimestamp();
    }
    const result = await get().updateTask(taskId, updates);

    const task = get().tasks.find(t => t.id === taskId);
    if (task) {
      let action = 'vừa cập nhật';
      if (newStatus === 'done') action = 'vừa hoàn thành';
      if (newStatus === 'inprogress') action = 'đang thực hiện';
      useActivityStore.getState().addActivity('system', action, 'nhiệm vụ', task.title);
    }
    return result;
  },

  archiveTask: (taskId, success) => {
    return get().moveTask(taskId, success ? 'archived_completed' : 'archived_incomplete');
  },

  addComment: async (taskId, text) => {
    const user = auth.currentUser;
    const task = get().tasks.find(t => t.id === taskId);
    if (!task) return { success: false, error: 'Task not found' };

    const newComment = {
      id: `c-${Date.now()}`,
      userId: user?.uid || 'unknown',
      text,
      createdAt: new Date().toISOString(),
    };

    return get().updateTask(taskId, {
      comments: [...(task.comments || []), newComment],
    });
  },

  getTasksByStatus: (status, departmentId = null, userId = null) => {
    return get().tasks.filter(t => {
      if (t.status !== status) return false;
      if (departmentId && t.departmentId !== departmentId) return false;
      if (userId && !t.assigneeIds?.includes(userId) && t.assigneeId !== userId) return false;
      return true;
    });
  },
}));
