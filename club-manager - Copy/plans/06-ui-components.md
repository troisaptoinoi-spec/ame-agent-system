# 🎨 Phần 6: Component Tree & UI Patterns

> **Tham chiếu phân quyền:** Xem [`RBAC.md`](RBAC.md) cho sidebar theo role.
>
> **Lưu ý:** UI components giữ nguyên kiến trúc. Chỉ thay đổi data layer từ localStorage/Supabase → Firebase SDK.

---

## 6.1 Component Hierarchy

```
App
├── ErrorBoundary
│   ├── BrowserRouter
│   │   ├── Routes
│   │   │   ├── /login → LoginPage
│   │   │   │   ├── LoginForm
│   │   │   │   └── RegisterForm
│   │   │   │
│   │   │   └── /* → AuthGuard
│   │   │       └── AppLayout
│   │   │           ├── Sidebar
│   │   │           │   ├── NavItem (role-filtered — xem RBAC.md)
│   │   │           │   ├── UserProfile
│   │   │           │   └── LogoutButton
│   │   │           ├── Header
│   │   │           │   ├── SearchBar
│   │   │           │   ├── NotificationBell
│   │   │           │   ├── ThemeToggle
│   │   │           │   └── LanguageToggle
│   │   │           ├── Main Content
│   │   │           │   ├── / → DashboardPage
│   │   │           │   ├── /tasks → TasksPage
│   │   │           │   ├── /members → MembersPage
│   │   │           │   ├── /events → EventsPage
│   │   │           │   ├── /leaderboard → LeaderboardPage
│   │   │           │   ├── /profile → ProfilePage
│   │   │           │   ├── /support → SupportPage
│   │   │           │   ├── /finance → FinancePage
│   │   │           │   ├── /documents → DocumentsPage
│   │   │           │   ├── /settings → SettingsPage (admin)
│   │   │           │   └── /admin/* → AdminPage (admin)
│   │   │           │       ├── /admin/users → UserManagement
│   │   │           │       ├── /admin/tasks → TaskManagement
│   │   │           │       ├── /admin/departments → DepartmentMgmt
│   │   │           │       ├── /admin/finance → FinanceManagement
│   │   │           │       ├── /admin/documents → DocumentManagement
│   │   │           │       ├── /admin/stats → SystemStats
│   │   │           │       ├── /admin/audit → AuditLogViewer
│   │   │           │       └── /admin/settings → SystemSettings
│   │   │           └── Footer
│   │   └── Global Components
│   │       ├── Toast (notifications)
│   │       ├── ConfirmDialog
│   │       ├── GlobalSearch
│   │       └── ProfileModal
```

---

## 6.2 Routing Strategy

```jsx
// src/App.jsx
import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AuthGuard } from './components/auth/AuthGuard';
import AppLayout from './components/layout/AppLayout';
import { PageLoader } from './components/common/PageLoader';
import { useAuthStore } from './store/authStore';

const LoginPage = lazy(() => import('./pages/Login/LoginPage'));
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage'));
const TasksPage = lazy(() => import('./pages/Tasks/TasksPage'));
const MembersPage = lazy(() => import('./pages/Members/MembersPage'));
const EventsPage = lazy(() => import('./pages/Events/EventsPage'));
const LeaderboardPage = lazy(() => import('./pages/Leaderboard/LeaderboardPage'));
const ProfilePage = lazy(() => import('./pages/Profile/ProfilePage'));
const SupportPage = lazy(() => import('./pages/Support/SupportPage'));
const SettingsPage = lazy(() => import('./pages/Settings/SettingsPage'));
const AdminPage = lazy(() => import('./pages/Admin/AdminPage'));
const FinancePage = lazy(() => import('./pages/Finance/FinancePage'));
const DocumentsPage = lazy(() => import('./pages/Documents/DocumentsPage'));

export default function App() {
  // Khởi tạo Firebase auth listener
  useEffect(() => {
    const unsubscribe = useAuthStore.getState().initAuth();
    return () => unsubscribe?.();
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<AuthGuard><AppLayout /></AuthGuard>}>
              <Route index element={<DashboardPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="members" element={<MembersPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="leaderboard" element={<LeaderboardPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="support" element={<SupportPage />} />
              <Route path="finance" element={
                <AuthGuard requiredPermission="finance.view"><FinancePage /></AuthGuard>
              } />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="settings" element={
                <AuthGuard requiredPermission="system.settings"><SettingsPage /></AuthGuard>
              } />
              <Route path="admin/*" element={
                <AuthGuard requiredPermission="system.settings"><AdminPage /></AuthGuard>
              } />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
```

**AuthGuard Component:**

```jsx
// src/components/auth/AuthGuard.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { can } from '../../utils/permissions';

export function AuthGuard({ children, requiredPermission }) {
  const { isAuthenticated, isLoading, customClaims } = useAuthStore();
  const location = useLocation();

  // Đang kiểm tra auth state
  if (isLoading) return <PageLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredPermission && !can(customClaims, requiredPermission)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
```

---

## 6.3 Design System

**CSS Custom Properties (giữ nguyên từ [`src/index.css`](../src/index.css)):**

```css
:root {
  --color-primary: #6366f1;
  --color-primary-hover: #4f46e5;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-info: #3b82f6;

  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-card: #1e293b;
  --bg-hover: #334155;

  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;

  --space-1: 4px; --space-2: 8px; --space-3: 12px;
  --space-4: 16px; --space-6: 24px; --space-8: 32px;

  --radius-sm: 6px; --radius-md: 8px; --radius-lg: 12px;

  --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.3);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.3);

  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;

  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

  --z-dropdown: 100; --z-modal: 400; --z-toast: 500;
}
```

---

## 6.4 Form Management

```jsx
// src/hooks/useForm.js
import { useState, useCallback } from 'react';

export function useForm({ initialValues, validate, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((field, value) => {
    setValues(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  }, [errors]);

  const handleBlur = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (validate) {
      const fieldErrors = validate({ ...values });
      if (fieldErrors[field]) setErrors(prev => ({ ...prev, [field]: fieldErrors[field] }));
    }
  }, [values, validate]);

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    setIsSubmitting(true);
    const allErrors = validate ? validate(values) : {};
    setErrors(allErrors);
    setTouched(Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    if (Object.keys(allErrors).length === 0) {
      try { await onSubmit(values); }
      catch (err) { setErrors({ form: err.message }); }
    }
    setIsSubmitting(false);
  }, [values, validate, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues); setErrors({}); setTouched({}); setIsSubmitting(false);
  }, [initialValues]);

  return {
    values, errors, touched, isSubmitting,
    handleChange, handleBlur, handleSubmit, reset,
    setValues, setErrors,
  };
}
```

---

## 6.5 Accessibility (WCAG 2.1 AA)

| Tiêu chí | Implementation |
|----------|---------------|
| **1.1.1 Non-text Content** | Alt text cho image, aria-label cho icon buttons |
| **1.3.1 Info and Relationships** | Semantic HTML (nav, main, section) |
| **1.4.1 Use of Color** | Không dùng color alone để truyền tải thông tin |
| **1.4.3 Contrast Minimum** | Contrast ratio ≥ 4.5:1 cho text |
| **2.1.1 Keyboard** | Mọi functionality accessible bằng keyboard |
| **2.4.1 Bypass Blocks** | Skip navigation link |
| **2.4.3 Focus Order** | Focus order logic theo visual layout |
| **3.3.1 Error Identification** | Error messages rõ ràng, linked tới input |
| **4.1.2 Name, Role, Value** | ARIA attributes cho custom components |

**Skip Navigation:**

```jsx
<a href="#main-content" className="skip-link">Chuyển đến nội dung chính</a>
<main id="main-content" tabIndex="-1"><Outlet /></main>
```

**Focus Trap cho Modals:**

```javascript
// src/hooks/useFocusTrap.js
export function useFocusTrap(ref, isActive) {
  useEffect(() => {
    if (!isActive || !ref.current) return;
    const focusable = ref.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    function handleKeyDown(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    ref.current.addEventListener('keydown', handleKeyDown);
    return () => ref.current?.removeEventListener('keydown', handleKeyDown);
  }, [ref, isActive]);
}
```

---

## 6.6 Performance Optimization

| Technique | Implementation | Impact |
|-----------|---------------|--------|
| **Code Splitting** | `React.lazy()` cho mọi page | Giảm initial bundle ~60% |
| **Tree Shaking** | Vite tự động | Loại bỏ unused code |
| **Font Loading** | `font-display: swap`, preconnect | FOUT thay vì FOIT |
| **Memoization** | `useMemo`, `useCallback` | Tránh re-render |
| **Debouncing** | Search inputs | Giảm unnecessary computations |
| **Firestore Query Optimization** | Limit, pagination, composite indexes | Giảm reads |

**Bundle Size Targets:**

| Metric | Target |
|--------|--------|
| JS (gzipped) | < 150KB |
| CSS (gzipped) | < 20KB |
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3s |
