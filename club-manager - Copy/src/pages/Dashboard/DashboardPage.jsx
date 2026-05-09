import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { useTaskStore } from '../../store/taskStore';
import { useMemberStore } from '../../store/memberStore';
import { useActivityStore } from '../../store/activityStore';
import { can } from '../../utils/permissions';
import { Avatar, getColor } from '../../components/layout/AppLayout';
import { useCountUp } from '../../hooks/useCountUp';
import { DEPT_COLORS } from '../../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

function StatCard({ icon, label, value, change, color }) {
  const animatedValue = useCountUp(value);
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: `${color}20` }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
      </div>
      <div>
        <div className="stat-value">{animatedValue}</div>
        <div className="stat-label">{label}</div>
        {change && <div className="stat-change up">↑ {change}</div>}
      </div>
    </div>
  );
}

function RecentActivity() {
  const { activities } = useActivityStore();
  const { members } = useMemberStore();

  const formatActivityTime = (dateStr) => {
    const date = dayjs(dateStr);
    const now = dayjs();
    if (date.isSame(now, 'day')) return date.format('HH:mm');
    if (date.isSame(now.subtract(1, 'day'), 'day')) return `Hôm qua ${date.format('HH:mm')}`;
    return date.format('HH:mm DD/MM');
  };

  const getActivityIcon = (act) => {
    if (act.action.includes('hoàn thành')) return '✅';
    if (act.action.includes('thực hiện')) return '⏳';
    if (act.action.includes('thêm')) return '➕';
    if (act.targetType === 'sự kiện') return '📅';
    return '📋';
  };

  return (
    <div className="card" style={{ height: 350, display: 'flex', flexDirection: 'column' }}>
      <div className="section-header">
        <div className="section-title">⚡ Hoạt động gần đây</div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 8 }}>
        {activities.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text3)', marginTop: 20, fontSize: 13 }}>Chưa có hoạt động nào.</div>}
        {activities.map((act) => {
          const user = members.find(m => m.id === act.userId);
          return (
            <div key={act.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ position: 'relative' }}>
                <Avatar user={user} size="sm" />
                <div style={{ position: 'absolute', bottom: -4, right: -4, fontSize: 10, background: 'var(--bg1)', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  {getActivityIcon(act)}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 600 }}>{user?.name || 'Hệ thống'}</span>{' '}
                  <span style={{ color: 'var(--text2)' }}>{act.action}</span>{' '}
                  <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{act.targetType}</span>:{' '}
                  <span style={{ fontWeight: 500 }}>{act.targetName}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{formatActivityTime(act.createdAt)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MiniKanban({ tasks }) {
  const { t } = useTranslation();
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'inprogress');

  const renderTasks = (taskList, label, color) => (
    <div style={{ flex: 1, background: 'var(--bg3)', borderRadius: 8, padding: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 12 }}>{label} ({taskList.length})</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
        {taskList.slice(0, 5).map(task => (
          <div key={task.id} style={{ background: 'var(--bg2)', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>
              Hạn: {task.deadline ? dayjs(task.deadline).format('DD/MM') : 'Không có'}
            </div>
          </div>
        ))}
        {taskList.length === 0 && <div style={{ fontSize: 12, color: 'var(--text3)' }}>Trống</div>}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: 12, height: '100%' }}>
      {renderTasks(todoTasks, t('tasks.status.todo'), 'var(--text3)')}
      {renderTasks(inProgressTasks, t('tasks.status.inprogress'), 'var(--primary)')}
    </div>
  );
}





export default function DashboardPage() {
  const { t } = useTranslation();
  const { currentUser } = useAuthStore();
  const { tasks } = useTaskStore();
  const { members, departments } = useMemberStore();

  const myTasks = useMemo(() => tasks.filter(t => t.assigneeId === currentUser?.id), [tasks, currentUser]);
  const doneTasks = useMemo(() => tasks.filter(t => t.status === 'done'), [tasks]);
  const completionRate = useMemo(() => tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0, [tasks, doneTasks]);

  const deptData = useMemo(() => departments.map((d, i) => {
    const deptTasks = tasks.filter(t => t.departmentId === d.id);
    const deptDone = deptTasks.filter(t => t.status === 'archived_completed' || t.status === 'done').length;
    return { name: d.name.replace('Ban ', ''), total: deptTasks.length, done: deptDone, color: DEPT_COLORS[i % DEPT_COLORS.length] };
  }), [tasks, departments]);

  const myDeptTasks = useMemo(() => currentUser?.role === 'manager' ? tasks.filter(t => t.departmentId === currentUser.departmentId) : [], [tasks, currentUser]);
  const myDeptDone = useMemo(() => myDeptTasks.filter(t => t.status === 'done').length, [myDeptTasks]);
  const myDeptRate = useMemo(() => myDeptTasks.length > 0 ? Math.round((myDeptDone / myDeptTasks.length) * 100) : 0, [myDeptTasks, myDeptDone]);

  const isClubLevel = can(currentUser, 'VIEW_CLUB_DASHBOARD');
  const isDeptLevel = can(currentUser, 'VIEW_DEPT_DASHBOARD');
  const isManager = currentUser?.role === 'manager';
  const isMember = currentUser?.role === 'member';

  const greeting = currentUser?.name?.split(' ').slice(-1)[0];
  const roleEmoji = currentUser?.role === 'super_admin' ? '👑' : currentUser?.role === 'admin' ? '🛡️' : currentUser?.role === 'manager' ? '⭐' : '🌱';

  const hour = dayjs().hour();
  const timeGreeting = hour < 12 ? t('dashboard.morningGreet') : hour < 18 ? t('dashboard.afternoonGreet') : t('dashboard.eveningGreet');

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 24 }}>
        <h1 className="text-gradient" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: 800 }}>
          {timeGreeting}, {greeting}! {roleEmoji}
        </h1>
        <p style={{ color: 'var(--text2)', marginTop: 4, fontSize: 14 }}>
          {dayjs().format('dddd, DD/MM/YYYY')}
        </p>
      </div>

      {/* STATS */}
      {isClubLevel && (
        <div className="stats-grid stagger">
          <StatCard icon="👥" label={t('dashboard.totalMembers')} value={members.filter(m => m.role !== 'admin').length} change="+3 tháng này" color="#6366f1" />
          <StatCard icon="📋" label={t('dashboard.totalTasks')} value={tasks.length} color="#06b6d4" />
          <StatCard icon="✅" label={t('dashboard.completedTasks')} value={doneTasks.length} change="+5 tuần này" color="#10b981" />
          <StatCard icon="📈" label={t('dashboard.completionRate')} value={`${completionRate}%`} color="#f59e0b" />
        </div>
      )}

      {isManager && (
        <div className="stats-grid">
          <StatCard icon="👥" label="Thành viên ban" value={members.filter(m => m.departmentId === currentUser.departmentId).length} color="#6366f1" />
          <StatCard icon="📋" label="Nhiệm vụ ban" value={myDeptTasks.length} color="#06b6d4" />
          <StatCard icon="✅" label={t('dashboard.completedTasks')} value={myDeptDone} color="#10b981" />
          <StatCard icon="📈" label={t('dashboard.completionRate')} value={`${myDeptRate}%`} color="#f59e0b" />
        </div>
      )}

      {isMember && (
        <div className="stats-grid">
          <StatCard icon="📋" label={t('dashboard.myTasks')} value={myTasks.length} color="#6366f1" />
          <StatCard icon="✅" label={t('dashboard.completedTasks')} value={myTasks.filter(t => t.status === 'done').length} color="#10b981" />
          <StatCard icon="⭐" label={t('dashboard.myPoints')} value={currentUser?.points || 0} color="#f59e0b" />
          <StatCard icon="🏆" label={t('dashboard.myRank')}
            value={`#${members.filter(m => m.role === 'member').sort((a,b) => b.points - a.points).findIndex(m => m.id === currentUser?.id) + 1}`}
            color="#ec4899" />
        </div>
      )}

      {/* Kanban Board - Full Width */}
      <div className="card" style={{ height: 350, display: 'flex', flexDirection: 'column', marginBottom: 24 }}>
        <div className="section-header">
          <div className="section-title">🗂️ Bảng công việc {(!isClubLevel) && `(Ban của bạn)`}</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <MiniKanban tasks={isClubLevel ? tasks : tasks.filter(t => t.departmentId === currentUser?.departmentId)} />
        </div>
      </div>

      {/* 3-Column Grid: Chat, Overview, Activity */}
      {/* 2-Column Grid: Overview, Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24, alignItems: 'stretch' }}>
        <div className="card" style={{ height: 350, display: 'flex', flexDirection: 'column' }}>
          <div className="section-header"><div className="section-title">🏢 {t('dashboard.departmentOverview')}</div></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflowY: 'auto', paddingRight: 4 }}>
            {deptData.map((d, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{d.name}</span>
                  <span style={{ color: 'var(--text2)' }}>{d.done}/{d.total} nhiệm vụ</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: d.total ? `${(d.done/d.total)*100}%` : '0%', background: d.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <RecentActivity />
      </div>

    </div>
  );
}
