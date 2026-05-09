# 🔌 Phần 5: API Layer & Service Architecture (Firebase SDK)

> **Tham chiếu phân quyền:** Xem [`RBAC.md`](RBAC.md)

---

## 5.1 Architecture: Firebase SDK trực tiếp (không REST API)

**Thay vì tạo REST API layer, gọi Firebase SDK trực tiếp từ Zustand stores.**

```
Component → Zustand Store → Firebase SDK → Firestore/Auth/Storage
                                    ↑
                              Security enforced by:
                              - Firestore Rules (server-side)
                              - Custom Claims (server-side)
                              - Client-side permission checks (UI only)
```

**Tại sao không cần REST API:**
- Firebase SDK đã là API — không cần wrapper
- Firestore Rules enforce security server-side
- Realtime listeners (`onSnapshot`) không thể làm qua REST
- Giảm complexity, ít code hơn

---

## 5.2 Firebase Service Layer

```javascript
// src/services/firebase.js — Central Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Connect emulators in development
if (import.meta.env.DEV) {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    connectFunctionsEmulator(functions, 'localhost', 5001);
  } catch { /* emulators may already be connected */ }
}
```

---

## 5.3 Store Pattern: Firestore → Zustand

```javascript
// src/store/taskStore.js — Example pattern
import { create } from 'zustand';
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, where, serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { useActivityStore } from './activityStore';

export const useTaskStore = create((set, get) => ({
  tasks: [],
  isLoading: true,
  error: null,
  unsubscribe: null,

  // Subscribe to realtime updates — gọi 1 lần khi mount
  subscribe: () => {
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const tasks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
          completedAt: doc.data().completedAt?.toDate?.()?.toISOString() || null,
          updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
        }));
        set({ tasks, isLoading: false, error: null });
      },
      (error) => {
        console.error('[Tasks] Listener error:', error);
        set({ error: error.message, isLoading: false });
      }
    );
    set({ unsubscribe });
    return unsubscribe;
  },

  // Unsubscribe khi unmount
  unsubscribe: () => {
    const unsub = get().unsubscribe;
    if (unsub) unsub();
  },

  // CRUD Operations
  addTask: async (taskData) => {
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, 'tasks'), {
        ...taskData,
        creatorId: user.uid,
        comments: [],
        attachments: [],
        points: taskData.points || 0,
        startDate: taskData.startDate || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Log activity
      useActivityStore.getState().addActivity(
        user.uid, 'vừa thêm', 'nhiệm vụ', taskData.title
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
    return get().updateTask(taskId, updates);
  },

  addComment: async (taskId, text) => {
    const user = auth.currentUser;
    const task = get().tasks.find(t => t.id === taskId);
    if (!task) return { success: false, error: 'Task not found' };

    const newComment = {
      id: `c-${Date.now()}`,
      userId: user.uid,
      text,
      createdAt: new Date().toISOString(),
    };

    return get().updateTask(taskId, {
      comments: [...(task.comments || []), newComment],
    });
  },
}));
```

---

## 5.4 Error Handling Strategy

```javascript
// src/utils/firebaseErrors.js
export function mapFirebaseError(code) {
  const errors = {
    // Auth errors
    'auth/email-already-in-use': 'Email đã được sử dụng',
    'auth/invalid-email': 'Email không hợp lệ',
    'auth/weak-password': 'Mật khẩu quá yếu',
    'auth/user-not-found': 'Email hoặc mật khẩu không đúng',
    'auth/wrong-password': 'Email hoặc mật khẩu không đúng',
    'auth/too-many-requests': 'Quá nhiều lần thử. Vui lòng thử lại sau',
    'auth/network-request-failed': 'Lỗi kết nối mạng',

    // Firestore errors
    'permission-denied': 'Không có quyền thực hiện thao tác này',
    'not-found': 'Dữ liệu không tồn tại',
    'already-exists': 'Dữ liệu đã tồn tại',
    'resource-exhausted': 'Đã vượt quá giới hạn. Vui lòng thử lại sau',
    'unauthenticated': 'Vui lòng đăng nhập lại',

    // Storage errors
    'storage/unauthorized': 'Không có quyền upload file',
    'storage/canceled': 'Đã hủy upload',
    'storage/quota-exceeded': 'Bộ nhớ đầy',
  };
  return errors[code] || 'Đã xảy ra lỗi. Vui lòng thử lại.';
}
```

---

## 5.5 Rate Limiting

**Firebase tự động rate limiting:**
- Firebase Auth: 10 lần thử sai → khóa tạm thời
- Firestore: 50K reads/ngày (free tier), 20K writes/ngày
- Cloud Functions: 2M calls/tháng (free tier)

**Client-side throttle cho UI:**

```javascript
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
```

---

## 5.6 Service Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Service Layer                         │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ firebase.js   │  │ authService  │  │ auditService │  │
│  │              │  │              │  │              │  │
│  │ Config       │  │ register()   │  │ log()        │  │
│  │ Auth         │  │ login()      │  │ getRecent()  │  │
│  │ Firestore    │  │ logout()     │  │ getByUser()  │  │
│  │ Storage      │  │ changePass() │  │              │  │
│  │ Functions    │  │ forgotPass() │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │ eventBus      │  │ notifService │                     │
│  │              │  │              │                     │
│  │ on()         │  │ subscribe()  │                     │
│  │ off()        │  │ markRead()   │                     │
│  │ emit()       │  │              │                     │
│  └──────────────┘  └──────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

---

## 5.7 Environment Configuration

```bash
# .env
VITE_FIREBASE_API_KEY=AIzaSyxxx...
VITE_FIREBASE_AUTH_DOMAIN=innohub-xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=innohub-xxx
VITE_FIREBASE_STORAGE_BUCKET=innohub-xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```
