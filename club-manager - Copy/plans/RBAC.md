# 🔐 RBAC — Role-Based Access Control (Firebase)

> **Đây là nguồn chính (single source of truth) cho hệ thống phân quyền.** Các file khác chỉ tham chiếu đến file này.
>
> **Implementation:** Firebase Auth Custom Claims + Firestore Security Rules

---

## Roles

| Role | Mã | Mô tả | Số lượng |
|------|-----|-------|----------|
| **Super Admin** | `super_admin` | Người tạo hệ thống, không thể bị xóa | 1 |
| **Admin** | `admin` | Quản trị viên CLB | Không giới hạn |
| **Manager** | `manager` | Trưởng ban / Phó ban | Không giới hạn |
| **Member** | `member` | Thành viên CLB | Không giới hạn |

> **Lưu ý:** Role `viewer` đã bị xóa khỏi hệ thống. Không sử dụng.

---

## Permissions Matrix

| Permission | Super Admin | Admin | Manager | Member |
|------------|:-----------:|:-----:|:-------:|:------:|
| **Users** | | | | |
| `users.view` | ✅ | ✅ | ✅ | ❌ |
| `users.create` | ✅ | ✅ | ❌ | ❌ |
| `users.edit` | ✅ | ✅ | ❌ | ❌ |
| `users.delete` | ✅ | ✅* | ❌ | ❌ |
| `users.change_role` | ✅ | ✅** | ❌ | ❌ |
| `users.reset_password` | ✅ | ✅ | ❌ | ❌ |
| **Tasks** | | | | |
| `tasks.view_all` | ✅ | ✅ | ✅ | ✅ |
| `tasks.view_own` | ✅ | ✅ | ✅ | ✅ |
| `tasks.create` | ✅ | ✅ | ✅ | ❌ |
| `tasks.edit_any` | ✅ | ✅ | ✅ | ❌ |
| `tasks.edit_own` | ✅ | ✅ | ✅ | ✅ |
| `tasks.delete` | ✅ | ✅ | ✅ | ❌ |
| `tasks.assign` | ✅ | ✅ | ✅ | ❌ |
| `tasks.approve` | ✅ | ✅ | ✅ | ❌ |
| **Members** | | | | |
| `members.view` | ✅ | ✅ | ✅ | ✅ |
| `members.create` | ✅ | ✅ | ✅ | ❌ |
| `members.edit` | ✅ | ✅ | ✅*** | ❌ |
| `members.delete` | ✅ | ✅ | ✅ | ❌ |
| **Events** | | | | |
| `events.view` | ✅ | ✅ | ✅ | ✅ |
| `events.create` | ✅ | ✅ | ✅ | ❌ |
| `events.edit` | ✅ | ✅ | ✅ | ❌ |
| `events.delete` | ✅ | ✅ | ❌ | ❌ |
| **Finance** | | | | |
| `finance.view` | ✅ | ✅ | ✅ | ❌ |
| `finance.manage` | ✅ | ✅ | ✅ | ❌ |
| **Documents** | | | | |
| `documents.view` | ✅ | ✅ | ✅ | ✅ |
| `documents.upload` | ✅ | ✅ | ✅ | ✅ |
| `documents.delete` | ✅ | ✅ | ✅ | ✅ |
| **System** | | | | |
| `system.settings` | ✅ | ✅ | ❌ | ❌ |
| `system.audit_log` | ✅ | ✅ | ❌ | ❌ |
| `system.backup` | ✅ | ✅ | ❌ | ❌ |
| `system.statistics` | ✅ | ✅ | ❌ | ❌ |

> \* Admin không thể xóa Super Admin
> \** Admin không thể nâng người khác lên Super Admin
> \*** Manager chỉ edit thành viên trong ban của mình

---

## Firebase Auth Custom Claims

### Cấu trúc Claims

```javascript
// Firebase Auth custom claims được set bởi Admin SDK (server-side)
// Không thể thay đổi từ client-side
{
  role: "admin",           // super_admin | admin | manager | member
  departmentId: "dept-001", // Department assignment (cho manager scope)
  isProtected: false,       // true cho super_admin
  clubId: "club-001"        // Multi-club support
}
```

### Set Claims (Server-side — Firebase Cloud Function)

```javascript
// functions/setUserRole.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.setUserRole = functions.https.onCall(async (data, context) => {
  // Chỉ super_admin hoặc admin mới được đổi role
  if (!context.auth || !['super_admin', 'admin'].includes(context.auth.token.role)) {
    throw new functions.https.HttpsError('permission-denied', 'Không có quyền đổi vai trò');
  }

  const { uid, role, departmentId } = data;

  // Không thể nâng lên super_admin
  if (role === 'super_admin') {
    throw new functions.https.HttpsError('permission-denied', 'Không thể tạo super_admin');
  }

  // Không thể đổi role của protected user
  const targetUser = await admin.auth().getUser(uid);
  if (targetUser.customClaims?.isProtected) {
    throw new functions.https.HttpsError('permission-denied', 'Không thể đổi vai trò của tài khoản được bảo vệ');
  }

  await admin.auth().setCustomUserClaims(uid, {
    role,
    departmentId: departmentId || null,
    isProtected: false,
    clubId: context.auth.token.clubId,
  });

  return { success: true, message: `Đã đổi vai trò thành ${role}` };
});
```

### Đọc Claims (Client-side)

```javascript
// src/services/firebase.js
import { getAuth, onIdTokenChanged } from 'firebase/auth';

export function getCurrentUserRole() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return null;

  // Force refresh token để lấy claims mới nhất
  return user.getIdTokenResult(true).then(tokenResult => ({
    role: tokenResult.claims.role || 'member',
    departmentId: tokenResult.claims.departmentId,
    isProtected: tokenResult.claims.isProtected || false,
    clubId: tokenResult.claims.clubId,
  }));
}
```

---

## Firestore Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function getUserRole() {
      return request.auth.token.role;
    }

    function isRole(roles) {
      return getUserRole() in roles;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function isProtected() {
      return request.auth.token.isProtected == true;
    }

    // ===== Users Collection =====
    match /users/{userId} {
      // Mọi authenticated user đều xem được
      allow read: if isAuthenticated();

      // Chỉ admin+ tạo user mới
      allow create: if isRole(['super_admin', 'admin']);

      // Admin+ sửa user, hoặc chính user sửa profile mình
      allow update: if isRole(['super_admin', 'admin'])
                    || (isOwner(userId) && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'isProtected', 'isActive']));

      // Chỉ admin+ xóa, không xóa protected user
      allow delete: if isRole(['super_admin', 'admin']) && !resource.data.isProtected;
    }

    // ===== Tasks Collection =====
    match /tasks/{taskId} {
      // Mọi authenticated user xem được
      allow read: if isAuthenticated();

      // Manager+ tạo task
      allow create: if isRole(['super_admin', 'admin', 'manager']);

      // Admin+ sửa mọi task, Manager sửa task của ban mình, Member sửa task của mình
      allow update: if isRole(['super_admin', 'admin'])
                    || (isRole(['manager']) && resource.data.departmentId == getUserData().departmentId)
                    || (isOwner(resource.data.assigneeId) && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['assigneeId', 'departmentId', 'points']));

      // Manager+ xóa task
      allow delete: if isRole(['super_admin', 'admin', 'manager']);
    }

    // ===== Departments Collection =====
    match /departments/{deptId} {
      allow read: if isAuthenticated();
      allow write: if isRole(['super_admin', 'admin']);
    }

    // ===== Events Collection =====
    match /events/{eventId} {
      allow read: if isAuthenticated();
      allow create, update: if isRole(['super_admin', 'admin', 'manager']);
      allow delete: if isRole(['super_admin', 'admin']);
    }

    // ===== Finance Collection =====
    match /finance/{transactionId} {
      allow read: if isRole(['super_admin', 'admin', 'manager']);
      allow create: if isRole(['super_admin', 'admin', 'manager']);
      allow update: if isRole(['super_admin', 'admin', 'manager']);
      allow delete: if isRole(['super_admin', 'admin']);
    }

    // ===== Documents Collection =====
    match /documents/{docId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow delete: if isAuthenticated();
    }

    // ===== Notifications Collection =====
    match /notifications/{notifId} {
      allow read: if isOwner(resource.data.userId);
      allow create: if isAuthenticated();
      allow update: if isOwner(resource.data.userId);
      allow delete: if isOwner(resource.data.userId);
    }

    // ===== Activities Collection =====
    match /activities/{activityId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow delete: if isRole(['super_admin', 'admin']);
    }

    // ===== Audit Log Collection =====
    match /audit_log/{logId} {
      allow read: if isRole(['super_admin', 'admin']);
      allow create: if isAuthenticated(); // Cloud Functions ghi
      allow update, delete: if false; // Không sửa/xóa audit log
    }

    // Helper: lấy user data
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
  }
}
```

---

## Sidebar theo Role

**Super Admin / Admin:**
```
📊 Dashboard (Tổng quan)
📋 Tasks (Tất cả)
👥 Members
📅 Events
🏆 Leaderboard
💰 Finance
📄 Documents
⚙️ Settings
   ├── 👤 User Management
   ├── 📋 Task Management
   ├── 🏢 Department Management
   ├── 📊 System Statistics
   ├── 📝 Audit Log
   └── ⚙️ System Settings
🆘 Support
🚪 Logout
```

**Manager:**
```
📊 Dashboard (Tổng quan ban)
📋 Tasks (Tất cả)
👥 Members
📅 Events
🏆 Leaderboard
💰 Finance
📄 Documents
🆘 Support
🚪 Logout
```

**Member:**
```
📊 My Dashboard
📋 Tasks (Tất cả — xem only, edit own)
📅 Events
📄 Documents
👤 Profile
🆘 Support
🚪 Logout
```

---

## Client-side Permission Check

```javascript
// src/utils/permissions.js
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  MEMBER: 'member',
};

export const PERMISSIONS = {
  USERS_VIEW: { roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER] },
  USERS_CREATE: { roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
  USERS_EDIT: { roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
  USERS_DELETE: { roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
  USERS_CHANGE_ROLE: { roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
  USERS_RESET_PASSWORD: { roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },

  TASKS_VIEW_ALL: { roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.MEMBER] },
  TASKS_VIEW_OWN: { roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.MEMBER] },
  TASKS_CREATE: { roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER] },
  TASKS_EDIT_ANY: { roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER] },
  TASKS_EDIT_OWN: { roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.MEMBER] },
  TASKS_DELETE: { roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER] },
  TASKS_ASSIGN: { roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER] },
  TASKS_APPROVE: { roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER] },

  MEMBERS_VIEW: { roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.MEMBER] },
  MEMBERS_CREATE: { roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER] },
  MEMBERS_EDIT: { roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER], scope: 'department' },
  MEMBERS_DELETE: { roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER] },

  EVENTS_VIEW: { roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.MEMBER] },
  EVENTS_CREATE: { roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER] },
  EVENTS_EDIT: { roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER] },
  EVENTS_DELETE: { roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },

  FINANCE_VIEW: { roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER] },
  FINANCE_MANAGE: { roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER] },

  DOCUMENTS_VIEW: { roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.MEMBER] },
  DOCUMENTS_UPLOAD: { roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.MEMBER] },
  DOCUMENTS_DELETE: { roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.MEMBER] },

  SYSTEM_SETTINGS: { roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
  SYSTEM_AUDIT_LOG: { roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
  SYSTEM_BACKUP: { roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
  SYSTEM_STATISTICS: { roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
};

export function can(user, permission, context = {}) {
  if (!user || !PERMISSIONS[permission]) return false;
  const perm = PERMISSIONS[permission];
  if (!perm.roles.includes(user.role)) return false;
  if (perm.scope === 'department' && user.role === ROLES.MANAGER) {
    return context.departmentId && user.departmentId === context.departmentId;
  }
  return true;
}
```

> **Lưu ý:** Client-side permission check chỉ để ẩn/hiện UI. **Security thực sự nằm ở Firestore Rules.** Không bao giờ tin tưởng client-side checks.
