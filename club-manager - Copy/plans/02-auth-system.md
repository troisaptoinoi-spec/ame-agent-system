# 🔐 Phần 2: Authentication & Authorization (Firebase Auth)

> **Tham chiếu phân quyền chi tiết:** Xem [`RBAC.md`](RBAC.md)

---

## 2.1 Firebase Auth Configuration

```javascript
// src/services/firebase.js
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
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
```

---

## 2.2 Authentication Flow

### 2.2.1 Đăng ký (Registration)

```
User ──> Nhập name, email, password ──> Validate input
  │
  ├─ Email trùng? ──> Error: "Email đã được sử dụng"
  │
  ├─ Password yếu? ──> Error: "Mật khẩu phải có 8+ ký tự, chữ hoa, số"
  │
  └─ Hợp lệ ──> Firebase Auth createUserWithEmailAndPassword
       │
       ├─ Tạo Firestore user document trong collection 'users'
       │  { name, email, role: "member", departmentId: null, ... }
       │
       ├─ Gọi Cloud Function setDefaultRole(uid, "member")
       │  → Set custom claims: { role: "member" }
       │
       └─ Redirect to /dashboard
```

**Implementation:**

```javascript
// src/services/authService.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from './firebase';

export const authService = {
  // Đăng ký
  async register({ name, email, password }) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Tạo Firestore user document
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        role: 'member',
        departmentId: null,
        avatar: null,
        phone: null,
        studentId: null,
        joinDate: new Date().toISOString().split('T')[0],
        bio: '',
        points: 0,
        tasksCompleted: 0,
        isActive: true,
        isProtected: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Set custom claims via Cloud Function
      const setRole = httpsCallable(functions, 'setDefaultRole');
      await setRole({ uid: user.uid, role: 'member' });

      return { success: true, user };
    } catch (error) {
      return { success: false, error: mapFirebaseError(error.code) };
    }
  },

  // Đăng nhập
  async login({ email, password }) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: mapFirebaseError(error.code) };
    }
  },

  // Đăng xuất
  async logout() {
    await signOut(auth);
  },

  // Đổi mật khẩu
  async changePassword(newPassword) {
    try {
      await updatePassword(auth.currentUser, newPassword);
      return { success: true };
    } catch (error) {
      return { success: false, error: mapFirebaseError(error.code) };
    }
  },

  // Quên mật khẩu
  async forgotPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: mapFirebaseError(error.code) };
    }
  },

  // Lắng nghe auth state changes
  onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
  },

  // Lấy custom claims (role, departmentId, ...)
  async getCustomClaims() {
    const user = auth.currentUser;
    if (!user) return null;
    const tokenResult = await user.getIdTokenResult(true);
    return tokenResult.claims;
  },

  // Seed admin account (gọi 1 lần khi setup)
  async seedAdmin() {
    const setAdmin = httpsCallable(functions, 'seedAdmin');
    return await setAdmin();
  },
};

// Map Firebase error codes sang tiếng Việt
function mapFirebaseError(code) {
  const errors = {
    'auth/email-already-in-use': 'Email đã được sử dụng',
    'auth/invalid-email': 'Email không hợp lệ',
    'auth/operation-not-allowed': 'Phương thức đăng nhập chưa được bật',
    'auth/weak-password': 'Mật khẩu quá yếu (tối thiểu 6 ký tự)',
    'auth/user-disabled': 'Tài khoản đã bị vô hiệu hóa',
    'auth/user-not-found': 'Email hoặc mật khẩu không đúng',
    'auth/wrong-password': 'Email hoặc mật khẩu không đúng',
    'auth/too-many-requests': 'Quá nhiều lần thử. Vui lòng thử lại sau',
    'auth/network-request-failed': 'Lỗi kết nối mạng',
    'auth/requires-recent-login': 'Vui lòng đăng nhập lại để thực hiện thao tác này',
  };
  return errors[code] || 'Đã xảy ra lỗi. Vui lòng thử lại.';
}
```

### 2.2.2 Đăng nhập (Login)

```
User ──> Nhập email, password ──> Firebase Auth signInWithEmailAndPassword
  │
  ├─ Error? ──> Hiển thị lỗi (user-not-found, wrong-password, too-many-requests)
  │
  └─ Thành công ──> onAuthStateChanged trigger
       │
       ├─ Đọc custom claims (role, departmentId)
       ├─ Load user document từ Firestore
       ├─ Cập nhật Zustand authStore
       │
       └─ Redirect to /dashboard
```

### 2.2.3 Đăng xuất (Logout)

```
User ──> Click Logout
  │
  ├─ Firebase Auth signOut()
  ├─ onAuthStateChanged trigger với user = null
  ├─ Reset Zustand authStore
  │
  └─ Redirect to /login
```

### 2.2.4 Quên mật khẩu (Forgot Password)

```
User ──> Nhập email ──> Firebase Auth sendPasswordResetEmail
  │
  ├─ Error? ──> Hiển thị lỗi
  │
  └─ Thành công ──> Hiển thị thông báo "Đã gửi email reset mật khẩu"
       │
       └─ User kiểm tra email → Click link → Nhập mật khẩu mới
```

### 2.2.5 Đổi mật khẩu (Change Password)

```
User ──> Nhập password mới + confirm ──> Validate
  │
  ├─ Password yếu? ──> Error
  │
  └─ Hợp lệ ──> Firebase Auth updatePassword
       │
       └─ Thông báo thành công
```

---

## 2.3 Session Management

**Firebase Auth tự quản lý session.** Không cần token manual.

| Sự kiện | Hành động |
|---------|-----------|
| Login thành công | Firebase tự tạo session, lưu trong IndexedDB |
| Reload trang | Firebase tự restore session từ IndexedDB |
| Token hết hạn | Firebase tự refresh token (mỗi 1 giờ) |
| Logout | Firebase xóa session |
| Multi-tab | Firebase tự đồng bộ auth state qua BroadcastChannel |

**Auth State Listener:**

```javascript
// src/store/authStore.js
import { create } from 'zustand';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

export const useAuthStore = create((set) => ({
  currentUser: null,
  userProfile: null,  // Firestore user document
  customClaims: null,  // { role, departmentId, isProtected, clubId }
  isAuthenticated: false,
  isLoading: true,     // Đang kiểm tra auth state

  // Khởi tạo auth listener — gọi 1 lần trong App.jsx
  initAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Load custom claims
        const tokenResult = await firebaseUser.getIdTokenResult();
        const claims = tokenResult.claims;

        // Load user profile từ Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userProfile = userDoc.exists()
          ? { id: firebaseUser.uid, ...userDoc.data() }
          : null;

        set({
          currentUser: firebaseUser,
          userProfile,
          customClaims: claims,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          currentUser: null,
          userProfile: null,
          customClaims: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    });

    return unsubscribe;
  },
}));
```

---

## 2.4 RBAC — Role-Based Access Control

> **Đây là tóm tắt. Bảng quyền đầy đủ xem [`RBAC.md`](RBAC.md).**

### Roles

| Role | Mã | Mô tả |
|------|-----|-------|
| **Super Admin** | `super_admin` | Người tạo hệ thống, không thể bị xóa |
| **Admin** | `admin` | Quản trị viên CLB |
| **Manager** | `manager` | Trưởng ban / Phó ban |
| **Member** | `member` | Thành viên CLB |

### Permission Implementation

```javascript
// src/utils/permissions.js — Xem RBAC.md cho đầy đủ
export function can(userClaims, permission, context = {}) {
  if (!userClaims || !PERMISSIONS[permission]) return false;
  const perm = PERMISSIONS[permission];
  if (!perm.roles.includes(userClaims.role)) return false;
  if (perm.scope === 'department' && userClaims.role === ROLES.MANAGER) {
    return context.departmentId && userClaims.departmentId === context.departmentId;
  }
  return true;
}
```

---

## 2.5 Cloud Functions

### 2.5.1 Set Default Role

```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Set default role khi user đăng ký
exports.setDefaultRole = functions.https.onCall(async (data, context) => {
  const { uid, role } = data;
  await admin.auth().setCustomUserClaims(uid, {
    role: role || 'member',
    departmentId: null,
    isProtected: false,
  });
  return { success: true };
});

// Seed admin account
exports.seedAdmin = functions.https.onCall(async (data, context) => {
  try {
    const adminUser = await admin.auth().getUserByEmail('admin@innohub.com').catch(() => null);

    if (!adminUser) {
      // Tạo admin user
      const userRecord = await admin.auth().createUser({
        email: 'admin@innohub.com',
        password: 'admin123',
        displayName: 'Administrator',
      });

      // Set custom claims
      await admin.auth().setCustomUserClaims(userRecord.uid, {
        role: 'super_admin',
        departmentId: null,
        isProtected: true,
      });

      // Tạo Firestore document
      await admin.firestore().collection('users').doc(userRecord.uid).set({
        name: 'Administrator',
        email: 'admin@innohub.com',
        role: 'super_admin',
        departmentId: null,
        avatar: null,
        phone: null,
        studentId: null,
        joinDate: '2024-01-01',
        bio: 'Quản trị viên hệ thống',
        points: 999,
        tasksCompleted: 0,
        isActive: true,
        isProtected: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true, message: 'Đã tạo tài khoản admin' };
    }

    return { success: true, message: 'Tài khoản admin đã tồn tại' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Set role (admin only)
exports.setUserRole = functions.https.onCall(async (data, context) => {
  if (!context.auth || !['super_admin', 'admin'].includes(context.auth.token.role)) {
    throw new functions.https.HttpsError('permission-denied', 'Không có quyền đổi vai trò');
  }

  const { uid, role, departmentId } = data;

  if (role === 'super_admin') {
    throw new functions.https.HttpsError('permission-denied', 'Không thể tạo super_admin');
  }

  const targetUser = await admin.auth().getUser(uid);
  if (targetUser.customClaims?.isProtected) {
    throw new functions.https.HttpsError('permission-denied', 'Không thể đổi vai trò của tài khoản được bảo vệ');
  }

  await admin.auth().setCustomUserClaims(uid, {
    role,
    departmentId: departmentId || null,
    isProtected: false,
  });

  // Cập nhật Firestore document
  await admin.firestore().collection('users').doc(uid).update({
    role,
    departmentId: departmentId || null,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true };
});
```

---

## 2.6 Cơ chế Bảo mật

### 2.6.1 Password Policy

Firebase Auth mặc định yêu cầu tối thiểu 6 ký tự. Cần enforce mạnh hơn ở client-side:

```javascript
export function validatePasswordStrength(password) {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return {
    valid: score >= 3 && checks.minLength,
    checks,
    score,
    label: score <= 1 ? 'Yếu' : score <= 3 ? 'Trung bình' : 'Mạnh',
  };
}
```

### 2.6.2 Rate Limiting

Firebase Auth tự động rate limiting:
- 10 lần thử sai liên tiếp → khóa tạm thời
- Không cần implement manual

### 2.6.3 Input Sanitization

```javascript
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.replace(/[<>]/g, '').replace(/javascript:/gi, '').replace(/on\w+\s*=/gi, '').trim();
}
```

### 2.6.4 Content Security Policy

```html
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self';
           script-src 'self';
           style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
           font-src 'self' https://fonts.gstatic.com;
           img-src 'self' data: https:;
           connect-src 'self' https://*.firebaseio.com https://*.googleapis.com wss://*.firebaseio.com;">
```

---

## 2.7 Threat Model

| Mối đe dọa | Mức độ | Mitigation |
|------------|--------|------------|
| **Brute force login** | 🟢 Thấp | Firebase Auth tự rate limiting |
| **XSS injection** | 🔴 Cao | Input sanitization, CSP |
| **Session hijacking** | 🟢 Thấp | Firebase quản lý token tự động |
| **CSRF** | 🟢 Thấp | Firebase SDK dùng same-origin |
| **Privilege escalation** | 🔴 Cao | Firestore Rules + Custom Claims (server-side) |
| **Data tampering** | 🟢 Thấp | Firestore Rules enforce server-side |
| **Data loss** | 🟡 Trung bình | Firebase tự backup, export data |

---

## 2.8 Security Testing Checklist

- [ ] Firebase Auth createUserWithEmailAndPassword hoạt động
- [ ] Firebase Auth signInWithEmailAndPassword hoạt động
- [ ] Custom claims được set đúng sau đăng ký
- [ ] Firestore Rules chặn unauthorized access
- [ ] Protected admin account không thể xóa
- [ ] Role-based access control hoạt động đúng (xem [`RBAC.md`](RBAC.md))
- [ ] Password reset email gửi thành công
- [ ] Rate limiting hoạt động (Firebase tự động)
- [ ] CSP headers chặn inline scripts
