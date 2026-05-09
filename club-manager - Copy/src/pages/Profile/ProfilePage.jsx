import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { useMemberStore } from '../../store/memberStore';
import { useTaskStore } from '../../store/taskStore';
import { useToastStore } from '../../store/toastStore';
import { useUIStore } from '../../store/uiStore';
import { Avatar } from '../../components/layout/AppLayout';
import dayjs from 'dayjs';

const ROLE_LABELS = { super_admin: 'Super Admin', admin: 'Quản trị viên', manager: 'Trưởng ban', member: 'Thành viên' };
const ROLE_BADGE = { super_admin: 'role-admin', admin: 'role-admin', manager: 'role-leader', member: 'role-member' };

export default function ProfilePage() {
  const { t } = useTranslation();
  const { currentUser } = useAuthStore();
  const { departments, updateMember } = useMemberStore();
  const { tasks } = useTaskStore();
  const { showToast } = useToastStore();
  const { theme, toggleTheme, language, setLanguage } = useUIStore();
  const { i18n } = useTranslation();

  const [form, setForm] = useState({ 
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    studentId: currentUser?.studentId || '',
    major: currentUser?.major || '',
    departmentId: currentUser?.departmentId || '',
    bio: currentUser?.bio || '', 
    phone: currentUser?.phone || '' 
  });

  if (!currentUser) return null;

  const dept = departments.find(d => d.id === currentUser.departmentId);
  const myTasks = tasks.filter(t => t.assigneeId === currentUser.id);
  const doneTasks = myTasks.filter(t => t.status === 'done');
  const rate = myTasks.length ? Math.round((doneTasks.length / myTasks.length) * 100) : 0;

  const handleSave = async () => {
    const result = await updateMember(currentUser.id, form);
    if (result?.success !== false) {
      showToast(t('profile.saved'), 'success');
    } else {
      showToast('Lỗi cập nhật hồ sơ', 'error');
    }
  };

  const handleLang = (lang) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <div className="page-enter">
      <div className="section-header">
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>👤 {t('profile.title')}</h1>
      </div>

      <div className="grid-2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Main Info */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <Avatar user={currentUser} size="xl" />
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{currentUser.name}</div>
              <span className={`badge ${ROLE_BADGE[currentUser.role]}`} style={{ marginTop: 8 }}>{ROLE_LABELS[currentUser.role]}</span>
              {dept && <div style={{ fontSize: 14, color: 'var(--text2)', marginTop: 8 }}>{dept.icon} {dept.name}</div>}
            </div>
            
            <div style={{ display: 'flex', gap: 32, marginTop: 24, width: '100%', justifyContent: 'center' }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>{currentUser.points}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>Điểm</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--success)' }}>{currentUser.tasksCompleted}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>Nhiệm vụ HT</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--warning)' }}>{rate}%</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>Tỷ lệ HT</div>
              </div>
            </div>
          </div>

          {/* Edit form */}
          <div className="card">
            <div className="section-title" style={{ marginBottom: 16 }}>✏️ {t('profile.editProfile')}</div>
            <div className="form-group">
              <label className="form-label">{t('members.fields.name')}</label>
              <input className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Mã SV</label>
                <input className="form-control" value={form.studentId} onChange={e => setForm({...form, studentId: e.target.value})} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Ngành học</label>
                <input className="form-control" value={form.major} onChange={e => setForm({...form, major: e.target.value})} placeholder="Công nghệ thông tin..." />
              </div>
              <div className="form-group">
                <label className="form-label">Ban</label>
                <select className="form-control" value={form.departmentId} onChange={e => setForm({...form, departmentId: e.target.value})}>
                  <option value="">-- Chọn Ban --</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{t('members.fields.phone')}</label>
              <input className="form-control" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="09xxxx" />
            </div>
            <div className="form-group">
              <label className="form-label">{t('members.fields.bio')}</label>
              <textarea className="form-control" rows={4} value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Giới thiệu về bản thân..." />
            </div>
            <button className="btn btn-primary" onClick={handleSave}>{t('common.save')}</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Preferences */}
          <div className="card">
            <div className="section-title" style={{ marginBottom: 16 }}>⚙️ Cài đặt hiển thị</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span>{t('common.darkMode')}</span>
              <button className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={toggleTheme}>
                {theme === 'dark' ? 'Bật' : 'Tắt'}
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{t('common.language')}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className={`btn ${language === 'vi' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => handleLang('vi')}>VI</button>
                <button className={`btn ${language === 'en' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => handleLang('en')}>EN</button>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="card">
            <div className="section-title" style={{ marginBottom: 16 }}>ℹ️ Thông tin cá nhân</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text2)' }}>Email</span>
                <span style={{ fontWeight: 500 }}>{currentUser.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text2)' }}>Mã SV</span>
                <span style={{ fontWeight: 500 }}>{currentUser.studentId || 'Chưa cập nhật'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text2)' }}>Ngày tham gia</span>
                <span style={{ fontWeight: 500 }}>{currentUser.joinDate ? dayjs(currentUser.joinDate).format('DD/MM/YYYY') : '-'}</span>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="card">
            <div className="section-title" style={{ marginBottom: 16 }}>📋 {t('profile.taskHistory')}</div>
            {myTasks.length === 0 ? (
              <div style={{ color: 'var(--text3)', fontSize: 13 }}>Chưa có nhiệm vụ nào.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {myTasks.slice(0, 5).map(task => (
                  <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{task.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>
                        {task.deadline ? dayjs(task.deadline).format('DD/MM/YYYY') : 'Không có hạn'}
                      </div>
                    </div>
                    <span className={`badge badge-${task.status === 'done' ? 'success' : 'primary'}`} style={{ alignSelf: 'flex-start' }}>
                      {t(`tasks.status.${task.status}`)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
