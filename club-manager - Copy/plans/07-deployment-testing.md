# 🚀 Phần 7: Deployment, Testing & CI/CD (Firebase)

---

## 7.1 Hosting Strategy

| Component | Platform | Lý do |
|-----------|----------|-------|
| **Frontend** | Firebase Hosting | CDN global, SSL free, tích hợp Firebase ecosystem |
| **Authentication** | Firebase Auth | Free tier: unlimited users |
| **Database** | Cloud Firestore | Free tier: 1GB storage, 50K reads/ngày, 20K writes/ngày |
| **File Storage** | Firebase Storage | Free tier: 5GB storage, 1GB downloads/ngày |
| **Server Logic** | Cloud Functions (Node.js) | Free tier: 2M calls/tháng |
| **Custom Domain** | Firebase Hosting | Hỗ trợ custom domain, SSL tự động |

---

## 7.2 Firebase Project Setup

```bash
# 1. Cài Firebase CLI
npm install -g firebase-tools

# 2. Đăng nhập
firebase login

# 3. Khởi tạo project
firebase init

# Chọn:
# - Hosting → public directory: dist
# - Functions → language: JavaScript
# - Firestore → rules file: firestore.rules
# - Storage → rules file: storage.rules
```

**Cấu trúc Firebase:**

```
project-root/
├── firebase.json           # Firebase configuration
├── .firebaserc             # Project alias
├── firestore.rules         # Firestore security rules
├── firestore.indexes.json  # Firestore indexes
├── storage.rules           # Storage security rules
├── functions/              # Cloud Functions
│   ├── index.js
│   ├── package.json
│   └── ...
├── src/                    # React app source
├── dist/                   # Build output (hosting)
└── ...
```

---

## 7.3 firebase.json Configuration

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**",
        "headers": [
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "X-Frame-Options", "value": "DENY" },
          { "key": "X-XSS-Protection", "value": "1; mode=block" },
          { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
        ]
      },
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp|ico)",
        "headers": [
          { "key": "Cache-Control", "value": "public, max-age=86400" }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs18"
  }
}
```

---

## 7.4 CI/CD Pipeline

```
Git Push → Lint (ESLint) → Test (Vitest) → Build (Vite) → Deploy (Firebase CLI)
```

**GitHub Actions Workflow:**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Firebase

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm run test

      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
```

---

## 7.5 Environment Configuration

```bash
# .env — Development (Firebase Emulators)
VITE_FIREBASE_API_KEY=demo-api-key
VITE_FIREBASE_AUTH_DOMAIN=demo-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=demo-project
VITE_FIREBASE_STORAGE_BUCKET=demo-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=000000000
VITE_FIREBASE_APP_ID=1:000000000:web:demo
VITE_APP_ENV=development

# .env.production — Production
VITE_FIREBASE_API_KEY=AIzaSyxxx...
VITE_FIREBASE_AUTH_DOMAIN=innohub-xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=innohub-xxx
VITE_FIREBASE_STORAGE_BUCKET=innohub-xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_APP_ENV=production
```

---

## 7.6 Implementation Roadmap

### Tổng quan Timeline

```
Phase 1: Firebase Setup ──────────────────────>  [Week 1]
Phase 2: Auth Migration ──────────────────────>  [Week 2]
Phase 3: Data Migration ──────────────────────>  [Week 3-4]
Phase 4: Feature Modules ─────────────────────>  [Week 5-7]
Phase 5: Admin & Monitoring ──────────────────>  [Week 8-9]
Phase 6: Polish & Testing ────────────────────>  [Week 10-11]
Phase 7: Deploy & Launch ─────────────────────>  [Week 12]
```

### Phase 1: Firebase Setup (Week 1)

| # | Task | Dependencies | Acceptance Criteria |
|---|------|-------------|-------------------|
| 1.1 | Tạo Firebase project | Không | Project created on Firebase Console |
| 1.2 | Cài Firebase SDK | Không | `npm install firebase` |
| 1.3 | Tạo `src/services/firebase.js` | 1.2 | Firebase config, emulators |
| 1.4 | Cấu hình `firebase.json` | 1.1 | Hosting, Firestore, Storage, Functions |
| 1.5 | Viết `firestore.rules` | 1.1 | Security rules (xem [`RBAC.md`](RBAC.md)) |
| 1.6 | Viết `storage.rules` | 1.1 | Storage security rules |
| 1.7 | Setup Firebase Emulators | 1.1 | Auth, Firestore, Storage, Functions emulators |
| 1.8 | Cập nhật `.env` | 1.1 | Firebase config variables |

### Phase 2: Auth Migration (Week 2)

| # | Task | Dependencies | Acceptance Criteria |
|---|------|-------------|-------------------|
| 2.1 | Viết lại `src/services/authService.js` | 1.3 | Firebase Auth: register, login, logout, changePassword, forgotPassword |
| 2.2 | Viết lại `src/store/authStore.js` | 2.1 | onAuthStateChanged, custom claims, isLoading |
| 2.3 | Viết lại `src/pages/Login/LoginPage.jsx` | 2.2 | Login/Register form với Firebase Auth |
| 2.4 | Cập nhật `src/components/auth/AuthGuard.jsx` | 2.2 | Auth + permission check |
| 2.5 | Cập nhật `src/App.jsx` | 2.4 | initAuth, protected routes |
| 2.6 | Tạo Cloud Functions | 1.3 | setDefaultRole, seedAdmin, setUserRole |
| 2.7 | Cập nhật `src/utils/permissions.js` | Không | 4 roles (xem [`RBAC.md`](RBAC.md)) |
| 2.8 | Cập nhật `src/constants.js` | Không | 4 ROLES, remove STORAGE_KEYS cho data |

### Phase 3: Data Migration (Week 3-4)

| # | Task | Dependencies | Acceptance Criteria |
|---|------|-------------|-------------------|
| 3.1 | Viết lại `src/store/taskStore.js` | 1.3 | Firestore onSnapshot, CRUD |
| 3.2 | Viết lại `src/store/memberStore.js` | 1.3 | Firestore onSnapshot, CRUD |
| 3.3 | Viết lại `src/store/eventStore.js` | 1.3 | Firestore onSnapshot, CRUD |
| 3.4 | Viết lại `src/store/activityStore.js` | 1.3 | Firestore onSnapshot |
| 3.5 | Xóa `src/data/mockData.js` | Không | Chỉ giữ helper functions |
| 3.6 | Xóa `src/services/supabase.js` | Không | Remove Supabase dependency |
| 3.7 | Xóa `src/services/sync.js` | Không | Remove Supabase sync |
| 3.8 | Tạo migration Cloud Function | 2.6 | Migrate localStorage data to Firestore |
| 3.9 | Cập nhật `src/main.jsx` | 2.2 | Remove DATA_VERSION, seed admin |

### Phase 4: Feature Modules (Week 5-7)

| # | Task | Dependencies | Acceptance Criteria |
|---|------|-------------|-------------------|
| 4.1 | Tạo `src/store/financeStore.js` | 1.3 | Firestore CRUD |
| 4.2 | Tạo `src/pages/Finance/FinancePage.jsx` | 4.1 | Finance UI |
| 4.3 | Tạo `src/store/documentStore.js` | 1.3 | Firestore + Firebase Storage |
| 4.4 | Tạo `src/pages/Documents/DocumentsPage.jsx` | 4.3 | Document UI |
| 4.5 | Tạo `src/store/notificationStore.js` | 1.3 | Firestore onSnapshot |
| 4.6 | Tạo `src/components/common/NotificationBell.jsx` | 4.5 | Bell UI |
| 4.7 | Tạo `src/services/eventBus.js` | Không | Pub/sub event system |
| 4.8 | Tạo `src/services/auditService.js` | 4.7 | Firestore audit log |
| 4.9 | Tạo notification Cloud Functions | 4.5 | Task assignment, deadline alerts |
| 4.10 | Cập nhật tất cả stores | 4.7 | Emit events cho audit |

### Phase 5: Admin & Monitoring (Week 8-9)

| # | Task | Dependencies | Acceptance Criteria |
|---|------|-------------|-------------------|
| 5.1 | Viết lại `src/components/layout/AppLayout.jsx` | 2.2 | Role-based sidebar |
| 5.2 | Cập nhật `src/pages/Dashboard/DashboardPage.jsx` | 3.1 | Empty state, role-based stats |
| 5.3 | Cập nhật `src/pages/Settings/SettingsPage.jsx` | 2.2 | Remove Cloud Sync |
| 5.4 | Tạo `src/components/admin/UserManagement.jsx` | 2.2 | User CRUD |
| 5.5 | Tạo `src/components/admin/TaskManagement.jsx` | 3.1 | Task overview |
| 5.6 | Tạo `src/components/admin/DepartmentMgmt.jsx` | 3.2 | Department CRUD |
| 5.7 | Tạo `src/components/admin/SystemStats.jsx` | 4.8 | Statistics dashboard |
| 5.8 | Tạo `src/components/admin/SystemSettings.jsx` | 2.2 | System config |
| 5.9 | Tạo `src/components/admin/AuditLogViewer.jsx` | 4.8 | Audit log UI |
| 5.10 | Tạo `src/pages/Admin/AdminPage.jsx` | 5.4-5.9 | Admin dashboard |

### Phase 6: Polish & Testing (Week 10-11)

| # | Task | Dependencies | Acceptance Criteria |
|---|------|-------------|-------------------|
| 6.1 | Cập nhật AppLayout — ARIA, keyboard nav | 5.1 | WCAG 2.1 AA |
| 6.2 | Tạo `src/hooks/useFocusTrap.js` | Không | Modal focus |
| 6.3 | Cập nhật `src/i18n/vi.json` | Tất cả | 100% coverage |
| 6.4 | Cập nhật `src/i18n/en.json` | Tất cả | 100% coverage |
| 6.5 | Tạo `src/hooks/useDebounce.js` | Không | Debouncing |
| 6.6 | Cập nhật `src/index.css` | 6.1 | Accessibility styles |
| 6.7 | Tạo unit tests | 2.1-2.7 | > 80% coverage |
| 6.8 | Tạo integration tests | 2.3 | Full auth flow |
| 6.9 | Performance audit | Tất cả | Lighthouse > 90 |

### Phase 7: Deploy & Launch (Week 12)

| # | Task | Dependencies | Acceptance Criteria |
|---|------|-------------|-------------------|
| 7.1 | Final QA | 6.9 | Không critical bugs |
| 7.2 | Deploy Cloud Functions | 2.6, 4.9 | Functions deployed |
| 7.3 | Deploy Firestore Rules | 1.5 | Rules active |
| 7.4 | Deploy Storage Rules | 1.6 | Rules active |
| 7.5 | Deploy Hosting | 7.1 | Production URL |
| 7.6 | Smoke test | 7.5 | All features working |
| 7.7 | Documentation | 7.5 | README updated |

---

## 7.7 Testing Strategy

### Unit Testing

**Framework:** Vitest + @testing-library/react

**Test Files:**

```
src/__tests__/
├── utils/
│   ├── permissions.test.js      # can() with all roles (xem RBAC.md)
│   ├── validation.test.js       # validateEmail, validatePasswordStrength
│   └── firebaseErrors.test.js   # mapFirebaseError
├── services/
│   ├── authService.test.js      # register, login, logout (mock Firebase)
│   ├── auditService.test.js     # log, getRecent
│   └── eventBus.test.js         # on, off, emit
├── store/
│   ├── authStore.test.js        # State management
│   ├── taskStore.test.js        # CRUD operations (mock Firestore)
│   └── memberStore.test.js      # CRUD operations
└── integration/
    ├── authFlow.test.js         # Full login/register/logout
    └── permissionFlow.test.js   # Role-based access control
```

### Mock Firebase cho Tests

```javascript
// src/__tests__/mocks/firebase.js
import { vi } from 'vitest';

// Mock Firebase Auth
export const mockAuth = {
  currentUser: { uid: 'test-uid', email: 'test@example.com' },
  onAuthStateChanged: vi.fn((auth, callback) => {
    callback(mockAuth.currentUser);
    return vi.fn(); // unsubscribe
  }),
};

// Mock Firestore
export const mockDb = {};

vi.mock('firebase/auth', () => ({
  getAuth: () => mockAuth,
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: mockAuth.onAuthStateChanged,
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: () => mockDb,
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  onSnapshot: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn(),
}));
```

### E2E Testing Scenarios

| Scenario | Steps | Expected Result |
|----------|-------|----------------|
| **New user registration** | Open → Register → Fill form → Submit | Dashboard, role = member |
| **Admin login** | Open → admin@innohub.com/admin123 → Submit | Dashboard, full sidebar |
| **Create task** | Login admin → Tasks → Add → Fill → Submit | Task appears in board |
| **Assign task** | Login admin → Open task → Assign → Save | Member sees task |
| **Role-based access** | Login member → /admin | Redirect to / |
| **Multi-device sync** | Create task on Device 1 → Check Device 2 | Task appears on Device 2 |
| **Password reset** | Click forgot password → Check email → Reset | New password works |

### Performance Benchmarks

| Metric | Target | Tool |
|--------|--------|------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Largest Contentful Paint | < 2.5s | Lighthouse |
| Time to Interactive | < 3s | Lighthouse |
| Bundle size (gzipped) | < 150KB | vite-bundle-visualizer |
| Firestore reads/page | < 50 | Firebase Console |

---

## 7.8 File Changes Summary

| Category | Count | Files |
|----------|-------|-------|
| **New — Firebase** | 3 | firebase.js, firebase.json, firestore.rules |
| **New — Services** | 4 | authService, auditService, eventBus, notifService |
| **New — Hooks** | 3 | useFocusTrap, useDebounce, useForm |
| **New — Components** | 15 | AuthGuard, LoginForm, RegisterForm, ErrorBoundary, AdminLayout, UserManagement, TaskManagement, DepartmentMgmt, SystemStats, SystemSettings, AuditLogViewer, FinanceManagement, DocumentManagement, NotificationBell, PageLoader |
| **New — Pages** | 4 | AdminPage, FinancePage, DocumentsPage |
| **New — Stores** | 4 | financeStore, documentStore, notificationStore |
| **New — Cloud Functions** | 4 | setDefaultRole, seedAdmin, setUserRole, notifications |
| **New — Tests** | 8 | Unit + integration tests |
| **Rewrite** | 5 | authStore, taskStore, memberStore, eventStore, activityStore |
| **Rewrite — Pages** | 2 | LoginPage, AppLayout |
| **Update** | 8 | constants, permissions, App, DashboardPage, SettingsPage, index.css, index.html, main.jsx |
| **Delete** | 3 | supabase.js, sync.js, mockData.js (data only) |
| **Config** | 4 | firebase.json, firestore.rules, storage.rules, .env |
| **Total** | **~67 files** | |

---

## 7.9 Firebase Free Tier Limits

| Service | Free Limit | Dự kiến Usage |
|---------|-----------|---------------|
| **Authentication** | Unlimited | ~100 users |
| **Firestore Storage** | 1GB | ~10MB (CLB data) |
| **Firestore Reads** | 50K/ngày | ~5K/ngày |
| **Firestore Writes** | 20K/ngày | ~1K/ngày |
| **Storage** | 5GB | ~500MB (documents) |
| **Storage Downloads** | 1GB/ngày | ~100MB/ngày |
| **Cloud Functions** | 2M calls/tháng | ~10K/tháng |
| **Hosting** | 10GB storage, 360MB/ngày | ~100MB/ngày |

> **Kết luận:** Firebase free tier đủ cho ứng dụng quản lý CLB quy mô nhỏ-trung bình (50-200 thành viên).
