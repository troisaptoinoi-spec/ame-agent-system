# 🧩 Phần 4: Các Feature Modules (Firebase)

> **Tham chiếu phân quyền:** Xem [`RBAC.md`](RBAC.md) cho bảng quyền chi tiết.
>
> **Data Model:** Xem [`03-data-model.md`](03-data-model.md) cho Firestore collection schemas.

---

## Module 1: Quản lý Thành viên (Member Management)

**Purpose:** Quản lý toàn bộ thông tin thành viên CLB.

**Firestore Collection:** `users`

**API (Firebase SDK trực tiếp):**

| Action | Firebase SDK | Permission |
|--------|-------------|------------|
| Xem danh sách | `getDocs(collection(db, 'users'))` | `members.view` |
| Xem chi tiết | `getDoc(doc(db, 'users', id))` | `members.view` |
| Thêm thành viên | `createUserWithEmailAndPassword` + `setDoc` | `members.create` |
| Sửa thông tin | `updateDoc(doc(db, 'users', id), data)` | `members.edit` |
| Xóa thành viên | `updateDoc(..., { isActive: false })` | `members.delete` |
| Đổi vai trò | Cloud Function `setUserRole` | `users.change_role` |
| Export CSV | Client-side từ Firestore data | `members.view` |

**Realtime Listener:**

```javascript
// src/store/memberStore.js
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';

// Lắng nghe realtime changes
const unsubscribe = onSnapshot(
  query(collection(db, 'users'), where('isActive', '==', true)),
  (snapshot) => {
    const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    set({ members });
  }
);
```

**UI Components:**

```
MembersPage
├── MemberFilters          // Search, department filter, role filter
├── MemberGrid             // Grid view (card layout)
├── MemberList             // List view (table layout)
├── MemberCard             // Individual member card
├── MemberForm             // Add/Edit form (modal)
├── MemberProfile          // Detail view (modal)
└── MemberExport           // Export button
```

---

## Module 2: Quản lý Sự kiện (Event Management)

**Firestore Collection:** `events`

| Action | Firebase SDK | Permission |
|--------|-------------|------------|
| Xem lịch | `getDocs(collection(db, 'events'))` | `events.view` |
| Thêm sự kiện | `addDoc(collection(db, 'events'), data)` | `events.create` |
| Sửa sự kiện | `updateDoc(doc(db, 'events', id), data)` | `events.edit` |
| Xóa sự kiện | `deleteDoc(doc(db, 'events', id))` | `events.delete` |

**UI Components:**

```
EventsPage
├── EventCalendar          // Calendar view
├── EventList              // List view
├── EventCard              // Individual event card
├── EventForm              // Add/Edit form (modal)
├── EventDetail            // Detail view
└── EventFilters           // Type filter, date range
```

---

## Module 3: Quản lý Tài chính (Financial Management)

**Firestore Collection:** `finance`

| Action | Firebase SDK | Permission |
|--------|-------------|------------|
| Xem giao dịch | `getDocs(query(collection(db, 'finance'), orderBy('date', 'desc')))` | `finance.view` |
| Thêm giao dịch | `addDoc(collection(db, 'finance'), data)` | `finance.manage` |
| Duyệt giao dịch | `updateDoc(..., { status: 'approved', approvedBy: uid })` | `finance.manage` |
| Từ chối | `updateDoc(..., { status: 'rejected' })` | `finance.manage` |

**UI Components:**

```
FinancePage
├── FinanceSummary         // Tổng thu, tổng chi, số dư
├── FinanceChart           // Biểu đồ thu chi theo tháng
├── TransactionList        // Danh sách giao dịch
├── TransactionForm        // Thêm giao dịch (modal)
├── TransactionFilters     // Loại, danh mục, ngày
└── FinanceExport          // Export button
```

---

## Module 4: Quản lý Tài liệu (Document Management)

**Firestore Collection:** `documents` (metadata) + Firebase Storage (files)

| Action | Firebase SDK | Permission |
|--------|-------------|------------|
| Xem tài liệu | `getDocs(collection(db, 'documents'))` | `documents.view` |
| Upload | `uploadBytes(storageRef, file)` + `addDoc(...)` | `documents.upload` |
| Download | `getDownloadURL(storageRef)` | `documents.view` |
| Xóa | `deleteObject(storageRef)` + `deleteDoc(...)` | `documents.delete` |

**Upload Flow:**

```javascript
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../services/firebase';

async function uploadDocument(file, metadata) {
  // 1. Upload file to Firebase Storage
  const storageRef = ref(storage, `documents/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);

  // 2. Save metadata to Firestore
  const docRef = await addDoc(collection(db, 'documents'), {
    title: metadata.title,
    description: metadata.description || '',
    fileUrl: downloadURL,
    fileType: file.type,
    fileSize: file.size,
    fileName: file.name,
    uploadedBy: auth.currentUser.uid,
    departmentId: metadata.departmentId || null,
    tags: metadata.tags || [],
    isPublic: metadata.isPublic ?? true,
    downloadCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}
```

**UI Components:**

```
DocumentsPage
├── DocumentGrid           // Grid view
├── DocumentList           // List view
├── DocumentCard           // Individual document card
├── DocumentUpload         // Upload form (drag & drop)
├── DocumentPreview        // Preview (PDF, image)
├── DocumentFilters        // Type, department, tags
└── DocumentSearch         // Full-text search
```

---

## Module 5: Hệ thống Thông báo (Notification System)

**Firestore Collection:** `notifications`

| Action | Firebase SDK | Permission |
|--------|-------------|------------|
| Xem thông báo | `getDocs(query(collection(db, 'notifications'), where('userId', '==', uid)))` | Own only |
| Đánh dấu đã đọc | `updateDoc(..., { read: true })` | Own only |
| Tạo thông báo | `addDoc(collection(db, 'notifications'), data)` | Authenticated |
| Xóa | `deleteDoc(...)` | Own only |

**Notification Triggers (Cloud Functions):**

```javascript
// functions/notifications.js
// Trigger khi task được giao
exports.onTaskAssigned = functions.firestore
  .document('tasks/{taskId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.assigneeId !== after.assigneeId && after.assigneeId) {
      await admin.firestore().collection('notifications').add({
        userId: after.assigneeId,
        title: 'Bạn được giao nhiệm vụ mới',
        message: after.title,
        type: 'task',
        read: false,
        link: `/tasks/${context.params.taskId}`,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });

// Trigger khi deadline sắp đến (scheduled function)
exports.checkDeadlines = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const snapshot = await admin.firestore()
      .collection('tasks')
      .where('deadline', '==', tomorrowStr)
      .where('status', 'in', ['todo', 'inprogress'])
      .get();

    for (const doc of snapshot.docs) {
      const task = doc.data();
      if (task.assigneeId) {
        await admin.firestore().collection('notifications').add({
          userId: task.assigneeId,
          title: 'Deadline sắp đến',
          message: `Nhiệm vụ "${task.title}" hết hạn ngày mai`,
          type: 'warning',
          read: false,
          link: `/tasks/${doc.id}`,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }
  });
```

**UI Components:**

```
NotificationBell           // Icon with badge count
├── NotificationDropdown   // Dropdown list
│   ├── NotificationItem   // Individual notification
│   └── MarkAllRead        // "Đánh dấu đã đọc tất cả"
```

---

## Module 6: Quản lý Nhiệm vụ (Task Management)

**Firestore Collection:** `tasks`

| Action | Firebase SDK | Permission |
|--------|-------------|------------|
| Xem tất cả tasks | `getDocs(collection(db, 'tasks'))` | `tasks.view_all` |
| Xem tasks của mình | `getDocs(query(..., where('assigneeId', '==', uid)))` | `tasks.view_own` |
| Tạo task | `addDoc(collection(db, 'tasks'), data)` | `tasks.create` |
| Sửa task | `updateDoc(doc(db, 'tasks', id), data)` | `tasks.edit_any` / `tasks.edit_own` |
| Xóa task | `deleteDoc(doc(db, 'tasks', id))` | `tasks.delete` |
| Chuyển trạng thái | `updateDoc(..., { status: newStatus })` | `tasks.edit_own` |
| Giao task | `updateDoc(..., { assigneeId, assigneeIds })` | `tasks.assign` |
| Duyệt hoàn thành | `updateDoc(..., { status: 'done', completedAt: serverTimestamp() })` | `tasks.approve` |

**Realtime Listener:**

```javascript
// src/store/taskStore.js
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';

// Lắng nghe realtime — tự động cập nhật khi có thay đổi từ bất kỳ thiết bị nào
const unsubscribe = onSnapshot(
  query(collection(db, 'tasks'), orderBy('createdAt', 'desc')),
  (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamps to ISO strings
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
      completedAt: doc.data().completedAt?.toDate?.()?.toISOString() || null,
    }));
    set({ tasks });
  },
  (error) => {
    console.error('[Tasks] Listener error:', error);
    set({ error: error.message });
  }
);
```

**UI Components:**

```
TasksPage
├── TaskBoard              // Kanban board (drag & drop)
│   ├── TaskColumn         // Column per status
│   └── TaskCard           // Individual task card
├── TaskList               // Table view
├── TaskModal              // Add/Edit modal
├── TaskFilters            // Status, priority, department, assignee
├── TaskDetail             // Full detail view
│   ├── TaskComments       // Comments section
│   ├── TaskAttachments    // Attachments section
│   └── TaskHistory        // Change history
└── TaskStats              // Quick stats bar
```

---

## Module 7: Báo cáo & Thống kê (Reports & Analytics)

**Data Source:** Firestore aggregation queries + client-side computation

| Component | Dữ liệu | Biểu đồ |
|-----------|---------|---------|
| Tổng quan CLB | Count documents trong mỗi collection | Stat cards |
| Tiến độ nhiệm vụ | Group tasks theo status | Pie chart |
| Hoạt động theo thời gian | Query activities theo date range | Line chart |
| Top thành viên | Query users orderBy points desc | Bar chart |
| Phân bổ nhân sự | Group users theo departmentId | Donut chart |
| Thu chi | Query finance theo date range | Stacked bar chart |

**Export:** Client-side CSV/JSON generation từ Firestore data.

---

## Module 8: Quản lý Hệ thống (System Administration)

**Purpose:** Cấu hình hệ thống, quản lý dữ liệu, giám sát.

| Sub-module | Chức năng | Firebase Implementation |
|------------|-----------|------------------------|
| **User Management** | CRUD users, đổi role | Firebase Auth + Firestore + Cloud Functions |
| **Department Management** | CRUD departments | Firestore direct |
| **Task Overview** | Xem tất cả tasks | Firestore query |
| **System Statistics** | Dashboard thống kê | Firestore aggregation |
| **System Settings** | Tên app, logo | Firestore `settings/app` document |
| **Audit Log** | Xem lịch sử | Firestore `audit_log` collection |
| **Backup & Restore** | Export/Import | Cloud Functions + Firebase Export |
| **Error Log** | Xem lỗi | Firestore `error_log` collection |

---

## Activity Tracking & Audit Trail

### Event Bus Architecture

```javascript
// src/services/eventBus.js
class EventBus {
  constructor() { this.listeners = new Map(); }
  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }
  off(event, callback) { this.listeners.get(event)?.delete(callback); }
  emit(event, data) {
    this.listeners.get(event)?.forEach(cb => {
      try { cb(data); } catch (err) { console.error(`EventBus error [${event}]:`, err); }
    });
  }
}

export const eventBus = new EventBus();

export const EVENTS = {
  USER_LOGIN: 'user:login', USER_LOGOUT: 'user:logout',
  USER_REGISTER: 'user:register',
  TASK_CREATED: 'task:created', TASK_UPDATED: 'task:updated', TASK_DELETED: 'task:deleted',
  MEMBER_CREATED: 'member:created', MEMBER_UPDATED: 'member:updated', MEMBER_DELETED: 'member:deleted',
  EVENT_CREATED: 'event:created', EVENT_UPDATED: 'event:updated', EVENT_DELETED: 'event:deleted',
  SETTINGS_CHANGED: 'system:settings_changed', ROLE_CHANGED: 'user:role_changed',
};
```

### Audit Service

```javascript
// src/services/auditService.js
import { collection, addDoc, query, where, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { eventBus, EVENTS } from './eventBus';

class AuditService {
  constructor() {
    this.setupListeners();
  }

  setupListeners() {
    Object.values(EVENTS).forEach(event => {
      eventBus.on(event, (data) => this.log(event, data));
    });
  }

  async log(event, data) {
    const [resourceType, actionType] = event.split(':');

    await addDoc(collection(db, 'audit_log'), {
      timestamp: serverTimestamp(),
      userId: data.userId || data.currentUser?.uid,
      userName: data.userName || data.currentUser?.displayName,
      userRole: data.userRole,
      action: event,
      actionType,
      resourceType,
      resourceId: data.id || data.resourceId,
      resourceName: data.name || data.title || data.resourceName,
      changes: data.changes || [],
      metadata: {
        userAgent: navigator.userAgent,
        deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop',
        page: window.location.pathname,
      },
    });
  }

  async getRecent(count = 100) {
    const q = query(collection(db, 'audit_log'), orderBy('timestamp', 'desc'), limit(count));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getByUser(userId, count = 50) {
    const q = query(
      collection(db, 'audit_log'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(count)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

export const auditService = new AuditService();
```
