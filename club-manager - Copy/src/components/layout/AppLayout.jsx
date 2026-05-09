import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useTranslation } from 'react-i18next';
import { can } from '../../utils/permissions';
import GlobalSearch from '../common/GlobalSearch';
import ProfileModal from '../common/ProfileModal';
import { useProfileStore } from '../../store/profileStore';
import { useMemberStore } from '../../store/memberStore';
import { useTaskStore } from '../../store/taskStore';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import InstallPrompt from '../common/InstallPrompt';

const AVATAR_COLORS = ['#6366f1','#10b981','#f59e0b','#ec4899','#06b6d4','#8b5cf6','#ef4444'];
const getColor = (str) => AVATAR_COLORS[(str?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const getInitials = (name) => name?.split(' ').slice(-2).map(n => n[0]).join('').toUpperCase() || '?';

function Avatar({ user, size = 'md', clickable = true }) {
  const { viewProfile } = useProfileStore();
  const color = getColor(user?.name);
  
  const handleClick = (e) => {
    if (clickable && user) {
      e.stopPropagation();
      viewProfile(user);
    }
  };

  return (
    <div 
      className={`avatar avatar-${size} ${clickable && user ? 'clickable' : ''}`} 
      style={{ background: `linear-gradient(135deg, ${color}, ${color}99)`, cursor: clickable && user ? 'pointer' : 'default' }}
      onClick={handleClick}
    >
      {getInitials(user?.name)}
    </div>
  );
}

export { Avatar, getColor, getInitials };

export default function AppLayout() {
  const { currentUser, isAuthenticated } = useAuthStore();
  const { theme, toggleTheme, language, setLanguage, sidebarCollapsed, toggleSidebar } = useUIStore();
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { viewingMember, closeProfile } = useProfileStore();
  const { departments, subscribe: subscribeMembers } = useMemberStore();
  const { tasks, subscribe: subscribeTasks } = useTaskStore();
  
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  // Subscribe to Firestore realtime listeners
  useEffect(() => {
    if (isAuthenticated) {
      const unsubMembers = subscribeMembers();
      const unsubTasks = subscribeTasks();
      return () => {
        unsubMembers?.();
        unsubTasks?.();
      };
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    const { authService } = await import('../../services/authService');
    await authService.logout();
    navigate('/login');
  };
  const handleLang = () => {
    const next = language === 'vi' ? 'en' : 'vi';
    setLanguage(next);
    i18n.changeLanguage(next);
  };

  const navItems = [
    { to: '/', icon: '📊', label: t('nav.dashboard'), exact: true },
    { to: '/tasks', icon: '📋', label: t('nav.tasks') },
    { to: '/members', icon: '👥', label: t('nav.members') },
    { to: '/events', icon: '📅', label: t('nav.events') },
    { to: '/leaderboard', icon: '🏆', label: t('nav.leaderboard') },
    { to: '/support', icon: '🆘', label: 'Hỗ Trợ' },
    { to: '/profile', icon: '👤', label: 'Hồ sơ cá nhân' },
    ...(can(currentUser, 'VIEW_SETTINGS') ? [{ to: '/settings', icon: '⚙️', label: t('nav.settings') }] : []),
  ];

  const roleLabels = { super_admin: 'Super Admin', admin: 'Quản trị viên', manager: 'Trưởng ban', member: 'Thành viên' };

  return (
    <div className="app-layout">
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} role="navigation" aria-label="Menu chính">
        <div className="sidebar-logo">
          <div className="logo-icon">🚀</div>
          {!sidebarCollapsed && <span className="logo-text">InnoHub</span>}
        </div>
        <nav className="sidebar-nav" aria-label="Điều hướng">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.exact}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          {!isInstalled && (
            <button
              className="nav-item"
              onClick={() => setShowInstallPrompt(true)}
              style={{
                width: '100%', border: 'none', marginBottom: 8,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff', borderRadius: 10, fontWeight: 600,
                cursor: 'pointer', padding: '10px 12px',
                display: 'flex', alignItems: 'center', gap: 10,
                fontSize: 13, transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 16 }}>📱</span>
              {!sidebarCollapsed && <span>Cài đặt ứng dụng</span>}
            </button>
          )}
          {!sidebarCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', marginBottom: 8 }}>
              <Avatar user={currentUser} size="sm" />
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser?.name?.split(' ').slice(-1)[0]}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{roleLabels[currentUser?.role]}</div>
              </div>
            </div>
          )}
          <button className="nav-item" onClick={handleLogout} style={{ width: '100%', border: 'none', color: 'var(--danger)' }} aria-label="Đăng xuất">
            <span className="nav-icon">🚪</span>
            {!sidebarCollapsed && <span>{t('nav.logout')}</span>}
          </button>
        </div>
      </aside>

      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="header" role="banner">
          <div className="header-left">
            <button className="btn btn-ghost btn-icon" onClick={toggleSidebar} aria-label={sidebarCollapsed ? 'Mở sidebar' : 'Đóng sidebar'}>☰</button>
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg3)', padding: '6px 12px', borderRadius: 8, cursor: 'text', marginLeft: 16 }}
              onClick={() => setSearchOpen(true)}
            >
              <span style={{ fontSize: 14, color: 'var(--text3)' }}>🔍</span>
              <span style={{ fontSize: 13, color: 'var(--text2)', width: 150 }}>{t('search.placeholder')}</span>
              <span style={{ fontSize: 11, background: 'var(--bg4)', padding: '2px 6px', borderRadius: 4, color: 'var(--text3)', fontWeight: 600 }}>Ctrl K</span>
            </div>
          </div>
          <div className="header-right">
            <button className="btn btn-ghost btn-sm" onClick={handleLang} title={t('common.language')} aria-label="Đổi ngôn ngữ">
              {language === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}
            </button>
            <button className="btn btn-ghost btn-icon" onClick={toggleTheme} title={theme === 'dark' ? t('common.lightMode') : t('common.darkMode')} aria-label={theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <div className="dropdown">
              <div style={{ cursor: 'pointer' }} onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}>
                <Avatar user={currentUser} size="sm" />
              </div>
              {profileDropdownOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setProfileDropdownOpen(false)} />
                  <div className="dropdown-menu">
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{currentUser?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text2)' }}>{currentUser?.email || 'Thành viên InnoHub'}</div>
                    </div>
                    <div className="dropdown-item" onClick={() => { navigate('/profile'); setProfileDropdownOpen(false); }}>👤 {t('nav.profile')}</div>
                    {can(currentUser, 'VIEW_SETTINGS') && (
                      <div className="dropdown-item" onClick={() => { navigate('/settings'); setProfileDropdownOpen(false); }}>⚙️ {t('nav.settings')}</div>
                    )}
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item" style={{ color: 'var(--danger)' }} onClick={() => { handleLogout(); setProfileDropdownOpen(false); }}>🚪 {t('nav.logout')}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>
        <main className="page-content fade-in">
          <Outlet />
        </main>
      </div>
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <InstallPrompt isOpen={showInstallPrompt} onClose={() => setShowInstallPrompt(false)} />
      {viewingMember && (
        <ProfileModal 
          member={viewingMember}
          departments={departments}
          tasks={tasks}
          onClose={closeProfile}
        />
      )}
    </div>
  );
}
