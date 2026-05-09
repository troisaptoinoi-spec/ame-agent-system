# 📊 Phần 3: Data Model — Firestore Collections

> **Tham chiếu phân quyền:** Xem [`RBAC.md`](RBAC.md) cho Firestore Security Rules.

---

## 3.1 Firestore Collections Structure

```
firestore/
├── users/{userId}              # User profiles
├── tasks/{taskId}              # Tasks
├── departments/{deptId}        # Departments
├── events/{eventId}            # Events
├── finance/{transactionId}     # Financial transactions
├── documents/{docId}           # Document metadata
├── notifications/{notifId}     # Notifications
├── activities/{activityId}     # Activity feed
└── audit_log/{logId}           # Audit trail
```

> **Lưu ý:** Firestore là document-based (không phải relational). Không có JOIN. Sử dụng subcollections hoặc references khi cần.

---

## 3.2 Collection Schemas

### 3.2.1 users Collection

```javascript
// /users/{userId}
{
  name: "Nguyễn Văn A",
  email: "user@example.com",
  role: "member",                  // super_admin | admin | manager | member
  departmentId: "dept-001",        // Reference to departments collection
  avatar: "https://...",           // Firebase Storage URL
  phone: "0901234567",
  studentId: "SV001",
  joinDate: "2026-05-08",
  bio: "Thành viên CLB",
  points: 150,
  tasksCompleted: 5,
  isActive: true,
  isProtected: false,              // true cho super_admin
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Indexes:**
- `role` (single)
- `departmentId` (single)
- `isActive` (single)
- `points` (descending) — cho leaderboard

### 3.2.2 tasks Collection

```javascript
// /tasks/{taskId}
{
  title: "Thiết kế poster Workshop AI",
  description: "Thiết kế poster quảng bá cho sự kiện Workshop AI sắp tới",
  status: "todo",                  // todo | inprogress | review | done | archived_completed | archived_incomplete
  priority: "high",               // low | medium | high | urgent
  departmentId: "dept-001",       // Reference to departments
  assigneeId: "user-001",         // Primary assignee
  assigneeIds: ["user-001", "user-002"],  // Multiple assignees
  deadline: "2026-05-20",
  startDate: "2026-05-10",
  tags: ["design", "workshop"],
  comments: [
    {
      id: "c-001",
      userId: "user-001",
      text: "Đã bắt đầu thiết kế",
      createdAt: Timestamp
    }
  ],
  attachments: [
    {
      id: "a-001",
      name: "poster-v1.png",
      url: "https://firebasestorage...",
      type: "image/png",
      size: 245760
    }
  ],
  points: 50,
  creatorId: "user-admin",
  createdAt: Timestamp,
  completedAt: null,              // Timestamp khi hoàn thành
  updatedAt: Timestamp
}
```

**Indexes:**
- `status` (single)
- `priority` (single)
- `assigneeId` (single)
- `departmentId` (single)
- `creatorId` (single)
- `deadline` (ascending)
- `status` + `departmentId` (compound)
- `assigneeId` + `status` (compound)

### 3.2.3 departments Collection

```javascript
// /departments/{deptId}
{
  name: "Ban Truyền thông",
  color: "#6366f1",
  icon: "📢",
  description: "Phụ trách truyền thông và marketing",
  leaderId: "user-001",           // Reference to users
  memberCount: 12,
  createdAt: Timestamp
}
```

### 3.2.4 events Collection

```javascript
// /events/{eventId}
{
  title: "Họp CLB hàng tuần",
  date: "2026-05-15T18:00:00",
  endDate: "2026-05-15T20:00:00",
  type: "meeting",                // meeting | workshop | demo | social | deadline | other
  color: "#6366f1",
  description: "Tổng kết tuần, phân công nhiệm vụ mới",
  location: "Phòng họp A",
  attendees: ["user-001", "user-002"],
  createdBy: "user-admin",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Indexes:**
- `date` (ascending)
- `type` (single)

### 3.2.5 finance Collection

```javascript
// /finance/{transactionId}
{
  type: "income",                 // income | expense
  amount: 500000,                 // VND
  description: "Phí thành viên tháng 5",
  category: "membership_fee",     // membership_fee | sponsorship | event_cost | equipment | other
  date: "2026-05-01",
  receiptUrl: null,               // Firebase Storage URL
  createdBy: "user-admin",
  approvedBy: "user-admin",
  status: "approved",             // pending | approved | rejected
  createdAt: Timestamp
}
```

**Indexes:**
- `type` (single)
- `date` (descending)
- `category` (single)
- `status` (single)

### 3.2.6 documents Collection

```javascript
// /documents/{docId}
{
  title: "Quy chế CLB 2026",
  description: "Quy chế hoạt động CLB năm 2026",
  fileUrl: "https://firebasestorage.googleapis.com/...",
  fileType: "application/pdf",
  fileSize: 245760,
  fileName: "quy-che-clb-2026.pdf",
  uploadedBy: "user-001",
  departmentId: null,             // null = public
  tags: ["quy-chế", "2026"],
  isPublic: true,
  downloadCount: 15,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 3.2.7 notifications Collection

```javascript
// /notifications/{notifId}
{
  userId: "user-001",             // Người nhận
  title: "Bạn được giao nhiệm vụ mới",
  message: "Thiết kế poster cho Workshop AI",
  type: "task",                   // info | success | warning | error | task | event | system
  read: false,
  link: "/tasks/task-001",
  createdAt: Timestamp
}
```

**Indexes:**
- `userId` + `read` (compound)
- `userId` + `createdAt` (compound, descending)

### 3.2.8 activities Collection

```javascript
// /activities/{activityId}
{
  userId: "user-001",
  userName: "Nguyễn Văn A",
  action: "vừa thêm",
  targetType: "nhiệm vụ",
  targetId: "task-001",
  targetName: "Thiết kế poster",
  details: {},
  createdAt: Timestamp
}
```

**Indexes:**
- `createdAt` (descending)

### 3.2.9 audit_log Collection

```javascript
// /audit_log/{logId}
{
  timestamp: Timestamp,
  userId: "user-001",
  userName: "Nguyễn Văn A",
  userRole: "admin",
  action: "task.update",
  actionType: "update",
  resourceType: "task",
  resourceId: "task-001",
  resourceName: "Thiết kế poster",
  changes: [
    { field: "status", oldValue: "todo", newValue: "inprogress" }
  ],
  metadata: {
    userAgent: "Mozilla/5.0...",
    deviceType: "desktop",
    browser: "Chrome",
    page: "/tasks"
  }
}
```

**Indexes:**
- `userId` (single)
- `action` (single)
- `resourceType` + `resourceId` (compound)
- `timestamp` (descending)

---

## 3.3 Firebase Storage Structure

```
firebase-storage/
├── avatars/
│   └── {userId}/
│       └── profile.jpg
├── documents/
│   └── {docId}/
│       └── filename.ext
├── task-attachments/
│   └── {taskId}/
│       └── filename.ext
└── receipts/
    └── {transactionId}/
        └── receipt.jpg
```

**Storage Rules:**

```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Avatars: chỉ owner upload, mọi người xem
    match /avatars/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024  // 5MB max
                   && request.resource.contentType.matches('image/.*');
    }

    // Documents: authenticated upload, admin delete
    match /documents/{docId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && request.resource.size < 50 * 1024 * 1024;  // 50MB max
    }

    // Task attachments
    match /task-attachments/{taskId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && request.resource.size < 20 * 1024 * 1024;  // 20MB max
    }

    // Receipts
    match /receipts/{transactionId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && request.resource.size < 10 * 1024 * 1024;  // 10MB max
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## 3.4 Soft Delete Policy

| Entity | Policy | Implementation |
|--------|--------|---------------|
| Users | **Soft delete** | `isActive: false` — không xóa document |
| Tasks | **Soft delete** | `status: 'archived_*'` — giữ document |
| Departments | **Hard delete** | Xóa document Firestore |
| Events | **Hard delete** | Xóa document Firestore |
| Finance | **Soft delete** | `status: 'rejected'` — giữ document |
| Documents | **Soft delete** | Giữ metadata, xóa file Storage |
| Notifications | **Hard delete** | Xóa document |
| Activities | **Hard delete** (rotation 90 ngày) | Cloud Function scheduled cleanup |
| Audit Log | **Không xóa** | Giữ vĩnh viễn |

---

## 3.5 Data Migration từ localStorage sang Firestore

```javascript
// functions/migrateData.js — Cloud Function chạy 1 lần
exports.migrateData = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.role !== 'super_admin') {
    throw new functions.https.HttpsError('permission-denied', 'Chỉ super_admin');
  }

  const { users, tasks, departments, events } = data;
  const batch = admin.firestore().batch();

  // Migrate users
  users?.forEach(user => {
    const ref = admin.firestore().collection('users').doc(user.id);
    batch.set(ref, { ...user, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  });

  // Migrate tasks
  tasks?.forEach(task => {
    const ref = admin.firestore().collection('tasks').doc(task.id);
    batch.set(ref, { ...task, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  });

  // Migrate departments
  departments?.forEach(dept => {
    const ref = admin.firestore().collection('departments').doc(dept.id);
    batch.set(ref, { ...dept, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  });

  // Migrate events
  events?.forEach(event => {
    const ref = admin.firestore().collection('events').doc(event.id);
    batch.set(ref, { ...event, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  });

  await batch.commit();
  return { success: true, message: 'Migration completed' };
});
```
