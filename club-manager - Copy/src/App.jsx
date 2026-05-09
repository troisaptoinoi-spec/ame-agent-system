import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { can } from './utils/permissions';
import AppLayout from './components/layout/AppLayout';
import ErrorBoundary from './components/common/ErrorBoundary';
import ToastContainer from './components/common/Toast';
import ConfirmDialog from './components/common/ConfirmDialog';

// Lazy-loaded pages for code splitting
const SupportPage = lazy(() => import('./pages/Support/SupportPage'));
const LoginPage = lazy(() => import('./pages/Login/LoginPage'));
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage'));
const TasksPage = lazy(() => import('./pages/Tasks/TasksPage'));
const MembersPage = lazy(() => import('./pages/Members/MembersPage'));
const LeaderboardPage = lazy(() => import('./pages/Leaderboard/LeaderboardPage'));
const SettingsPage = lazy(() => import('./pages/Settings/SettingsPage'));
const ProfilePage = lazy(() => import('./pages/Profile/ProfilePage'));
const EventsPage = lazy(() => import('./pages/Events/EventsPage'));

function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', color: 'var(--text2)', fontSize: 14
    }}>
      <span className="pulse" style={{ marginRight: 8 }}>●</span>
      Đang tải...
    </div>
  );
}

function ProtectedRoute({ children, requiredPermission }) {
  const { isAuthenticated, isLoading, currentUser } = useAuthStore();

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Permission check (client-side only — security enforced by Firestore Rules)
  if (requiredPermission && !can(currentUser, requiredPermission)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  const { isAuthenticated, isLoading } = useAuthStore();

  // Khởi tạo Firebase auth listener
  useEffect(() => {
    const unsubscribe = useAuthStore.getState().initAuth();
    return () => unsubscribe?.();
  }, []);

  // Show loader while checking auth state
  if (isLoading) return <PageLoader />;

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
            <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<DashboardPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="members" element={<MembersPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="leaderboard" element={<LeaderboardPage />} />
              <Route path="settings" element={<ProtectedRoute requiredPermission="VIEW_SETTINGS"><SettingsPage /></ProtectedRoute>} />
              <Route path="support" element={<SupportPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <ToastContainer />
        <ConfirmDialog />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
