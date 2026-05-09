import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useMemberStore } from '../../store/memberStore';
import { useTaskStore } from '../../store/taskStore';
import { useEventStore } from '../../store/eventStore';
import { useToastStore } from '../../store/toastStore';
import { useDialogStore } from '../../store/dialogStore';
import { can } from '../../utils/permissions';
import { exportToJSON } from '../../utils/exportUtils';
import { authService } from '../../services/authService';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { currentUser } = useAuthStore();
  const { departments, addDepartment, deleteDepartment, members } = useMemberStore();
  const { tasks } = useTaskStore();
  const { events } = useEventStore();
  const { showToast } = useToastStore();
  const { showConfirm } = useDialogStore();
  const [deptName, setDeptName] = useState('');
  const [deptIcon, setDeptIcon] = useState('🏢');
  const [deptColor, setDeptColor] = useState('#6366f1');

  if (!can(currentUser, 'VIEW_SETTINGS')) return <Navigate to="/" replace />;

  const handleAddDept = () => {
    if (!deptName.trim()) return;
    addDepartment({ name: deptName, icon: deptIcon, color: deptColor, leaderId: null });
    showToast(t('settings.deptCreated'), 'success');
    setDeptName('');
  };

  const handleDeleteDept = (id) => {
    showConfirm({
      title: 'Xóa Ban',
      message: t('settings.confirmDeleteDept'),
      danger: true,
      onConfirm: () => {
        deleteDepartment(id);
        showToast(t('settings.deptDeleted'), 'error');
      }
    });
  };

  const handleReset = () => {
    showConfirm({
      title: t('settings.resetData'),
      message: t('settings.confirmReset'),
      danger: true,
      onConfirm: async () => {
        await authService.logout();
        window.location.href = '/login';
      }
    });
  };

  const handleExportData = () => {
    const data = {
      tasks,
      members,
      departments,
      events,
      exportedAt: new Date().toISOString(),
      version: '2.0',
    };
    exportToJSON(data, 'innohub_backup');
    showToast('Đã xuất dữ liệu sao lưu', 'success');
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        showToast('Tính năng nhập dữ liệu sẽ được cập nhật trong phiên bản tiếp theo', 'info');
      } catch {
        showToast('File không hợp lệ', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  return (
    <div className="page-enter">
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>⚙️ {t('settings.title')}</h1>

      <div className="grid-2">
        {/* Departments */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 16 }}>🏢 {t('settings.departments')}</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input value={deptIcon} onChange={e => setDeptIcon(e.target.value)} className="form-control" style={{ width: 60 }} placeholder="🏢" />
            <input value={deptName} onChange={e => setDeptName(e.target.value)} className="form-control" placeholder={t('settings.deptName')} />
            <input type="color" value={deptColor} onChange={e => setDeptColor(e.target.value)} style={{ width: 44, border: 'none', background: 'none', cursor: 'pointer' }} />
            <button className="btn btn-primary btn-sm" onClick={handleAddDept}>+</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {departments.map(d => (
              <div key={d.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'var(--bg3)', borderRadius:10 }}>
                <div style={{ width:10, height:10, borderRadius:'50%', background: d.color }} />
                <span style={{ fontSize:18 }}>{d.icon}</span>
                <span style={{ fontWeight:600, flex:1 }}>{d.name}</span>
                <button className="btn btn-ghost btn-icon btn-sm" style={{ color:'var(--danger)' }} onClick={() => handleDeleteDept(d.id)}>🗑️</button>
              </div>
            ))}
          </div>
        </div>

        {/* System info */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 16 }}>ℹ️ {t('settings.system')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
            {[
              ['Tên hệ thống', 'InnoHub CLB Manager'],
              ['Phiên bản', 'v2.0.0'],
              ['Môi trường', 'Firebase (Online)'],
              ['Ngôn ngữ', 'Tiếng Việt / English'],
              ['Giao diện', 'Dark / Light Mode'],
            ].map(([k, v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                <span style={{ color:'var(--text2)' }}>{k}</span>
                <span style={{ fontWeight:600 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleReset}>🔄 {t('settings.resetData')}</button>
            <button className="btn btn-secondary btn-sm" onClick={handleExportData}>📤 Xuất JSON</button>
            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
              📥 Nhập JSON
              <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImportData} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
