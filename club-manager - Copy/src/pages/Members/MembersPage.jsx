import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { useMemberStore } from '../../store/memberStore';
import { useTaskStore } from '../../store/taskStore';
import { useToastStore } from '../../store/toastStore';
import { useDialogStore } from '../../store/dialogStore';
import { can } from '../../utils/permissions';
import { Avatar, getColor } from '../../components/layout/AppLayout';
import { exportToCSV } from '../../utils/exportUtils';
import { ROLE_LABELS, ROLE_BADGE_CLASS } from '../../constants';
import { validateMemberForm } from '../../utils/validation';
import dayjs from 'dayjs';

const ROLE_BADGE = ROLE_BADGE_CLASS;

function MemberFormModal({ member, departments, onSave, onClose }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(member || { name:'', email:'', phone:'', studentId:'', departmentId:'', role:'member', bio:'' });
  const [errors, setErrors] = useState({});

  const handleSave = () => {
    const { isValid, errors: validationErrors } = validateMemberForm(form);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    onSave(form);
    onClose();
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{member ? t('members.editMember') : t('members.addMember')}</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
        <div className="modal-body">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div className="form-group" style={{ gridColumn:'1/-1' }}>
              <label className="form-label">{t('members.fields.name')} *</label>
              <input className={`form-control ${errors.name ? 'input-error' : ''}`} value={form.name} onChange={e => handleChange('name', e.target.value)} aria-required="true" aria-invalid={!!errors.name} />
              {errors.name && <div className="field-error">{errors.name}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">{t('members.fields.email')}</label>
              <input className={`form-control ${errors.email ? 'input-error' : ''}`} type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} aria-invalid={!!errors.email} />
              {errors.email && <div className="field-error">{errors.email}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">{t('members.fields.phone')}</label>
              <input className={`form-control ${errors.phone ? 'input-error' : ''}`} value={form.phone} onChange={e => handleChange('phone', e.target.value)} aria-invalid={!!errors.phone} />
              {errors.phone && <div className="field-error">{errors.phone}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">{t('members.fields.studentId')}</label>
              <input className="form-control" value={form.studentId} onChange={e => handleChange('studentId', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('members.fields.role')}</label>
              <select className="form-control" value={form.role} onChange={e => handleChange('role', e.target.value)}>
                {Object.entries(ROLE_LABELS).filter(([k]) => k !== 'admin').map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('members.fields.department')}</label>
              <select className="form-control" value={form.departmentId} onChange={e => handleChange('departmentId', e.target.value)}>
                <option value="">-- Ban --</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn:'1/-1' }}>
              <label className="form-label">{t('members.fields.bio')}</label>
              <textarea className={`form-control ${errors.bio ? 'input-error' : ''}`} value={form.bio} onChange={e => handleChange('bio', e.target.value)} aria-invalid={!!errors.bio} />
              {errors.bio && <div className="field-error">{errors.bio}</div>}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>{t('common.cancel')}</button>
          <button className="btn btn-primary" onClick={handleSave}>{t('common.save')}</button>
        </div>
      </div>
    </div>
  );
}

function ProfileModal({ member, departments, tasks, onClose, onEdit, canEdit }) {
  const { t } = useTranslation();
  const dept = departments.find(d => d.id === member.departmentId);
  const memberTasks = tasks.filter(t => t.assigneeId === member.id);
  const doneTasks = memberTasks.filter(t => t.status === 'done');
  const rate = memberTasks.length ? Math.round((doneTasks.length / memberTasks.length) * 100) : 0;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Hồ sơ thành viên</div>
          <div style={{ display:'flex', gap:8 }}>
            {canEdit && <button className="btn btn-secondary btn-sm" onClick={onEdit}>✏️ Sửa</button>}
            <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="modal-body">
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, marginBottom:24, textAlign:'center' }}>
            <Avatar user={member} size="xl" />
            <div>
              <div style={{ fontSize:20, fontWeight:700 }}>{member.name}</div>
              <span className={`badge ${ROLE_BADGE[member.role]}`} style={{ marginTop:4 }}>{ROLE_LABELS[member.role]}</span>
              {dept && <div style={{ fontSize:13, color:'var(--text2)', marginTop:4 }}>{dept.icon} {dept.name}</div>}
            </div>
            <div style={{ display:'flex', gap:24 }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:22, fontWeight:800, color:'var(--primary)' }}>{member.points}</div>
                <div style={{ fontSize:12, color:'var(--text2)' }}>Điểm</div>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:22, fontWeight:800, color:'var(--success)' }}>{member.tasksCompleted}</div>
                <div style={{ fontSize:12, color:'var(--text2)' }}>HT nhiệm vụ</div>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:22, fontWeight:800, color:'var(--warning)' }}>{rate}%</div>
                <div style={{ fontSize:12, color:'var(--text2)' }}>Tỷ lệ HT</div>
              </div>
            </div>
          </div>
          {member.bio && <p style={{ fontSize:14, color:'var(--text2)', textAlign:'center', marginBottom:16 }}>{member.bio}</p>}
          <hr className="divider" />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, fontSize:14 }}>
            {member.email && <div><span style={{ color:'var(--text2)' }}>📧 </span>{member.email}</div>}
            {member.phone && <div><span style={{ color:'var(--text2)' }}>📱 </span>{member.phone}</div>}
            {member.studentId && <div><span style={{ color:'var(--text2)' }}>🎓 </span>{member.studentId}</div>}
            {member.joinDate && <div><span style={{ color:'var(--text2)' }}>📅 </span>{dayjs(member.joinDate).format('DD/MM/YYYY')}</div>}
          </div>
          {memberTasks.length > 0 && (
            <>
              <hr className="divider" />
              <div className="section-title" style={{ marginBottom:10 }}>📋 Nhiệm vụ gần đây</div>
              {memberTasks.slice(0,5).map(task => (
                <div key={task.id} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)', fontSize:13 }}>
                  <span>{task.title}</span>
                  <span className={`badge badge-${task.status === 'done' ? 'success' : 'primary'}`} style={{ fontSize:10 }}>{task.status}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MembersPage() {
  const { t } = useTranslation();
  const { currentUser } = useAuthStore();
  const { members, departments, addMember, updateMember, deleteMember } = useMemberStore();
  const { tasks } = useTaskStore();
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState((currentUser?.role === 'super_admin' || currentUser?.role === 'admin' || currentUser?.role === 'manager') ? 'all' : currentUser?.departmentId || 'all');
  const [filterRole, setFilterRole] = useState('all');
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const { showToast } = useToastStore();
  const { showConfirm } = useDialogStore();

  const canAdd = can(currentUser, 'ADD_MEMBER');
  const canEdit = can(currentUser, 'EDIT_MEMBER');
  const canDelete = can(currentUser, 'DELETE_MEMBER');

  let visible = members.filter(m => m.role !== 'admin');
  if (filterDept !== 'all') visible = visible.filter(m => m.departmentId === filterDept);
  if (filterRole !== 'all') visible = visible.filter(m => m.role === filterRole);
  if (search) visible = visible.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.email?.toLowerCase().includes(search.toLowerCase()));

  const handleSave = (data) => {
    if (editing?.id) {
      updateMember(editing.id, data);
      showToast(t('members.updated'), 'success');
    } else {
      addMember(data);
      showToast(t('members.created'), 'success');
    }
    setEditing(null); setShowCreate(false);
  };

  const handleDeleteMember = (id) => {
    showConfirm({
      title: t('members.deleteMember'),
      message: t('members.confirmDelete'),
      danger: true,
      onConfirm: () => {
        deleteMember(id);
        showToast(t('members.deleted'), 'error');
      }
    });
  };

  const handleExportCSV = () => {
    const data = visible.map(m => {
      const dept = departments.find(d => d.id === m.departmentId);
      return {
        'Họ Tên': m.name,
        'Email': m.email || '',
        'Mã SV': m.studentId || '',
        'Vai trò': ROLE_LABELS[m.role],
        'Ban': dept ? dept.name : '',
        'Điểm': m.points,
        'Nhiệm vụ HT': m.tasksCompleted,
        'Ngày tham gia': dayjs(m.joinDate).format('YYYY-MM-DD')
      };
    });
    exportToCSV(data, 'innohub_members');
    showToast(t('common.success'), 'success');
  };

  return (
    <div className="page-enter">
      <div className="section-header">
        <h1 style={{ fontSize:22, fontWeight:800 }}>👥 {t('members.title')}</h1>
        <div style={{ display:'flex', gap:8 }}>
          {can(currentUser, 'VIEW_ALL_MEMBERS') && (
            <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>📥 {t('members.exportCSV')}</button>
          )}
          <button className={`btn ${view==='grid'?'btn-primary':'btn-secondary'} btn-sm`} onClick={() => setView('grid')}>▦</button>
          <button className={`btn ${view==='list'?'btn-primary':'btn-secondary'} btn-sm`} onClick={() => setView('list')}>☰</button>
          {canAdd && <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>+ {t('members.addMember')}</button>}
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input className="form-control search-input" placeholder={t('members.search')} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{ width:'auto' }} value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          <option value="all">{t('members.allDepts')}</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select className="form-control" style={{ width:'auto' }} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          <option value="all">{t('members.allRoles')}</option>
          {Object.entries(ROLE_LABELS).filter(([k]) => k !== 'admin').map(([k,v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <span className="badge badge-primary">{visible.length} {t('members.totalMembers')}</span>
      </div>

      {view === 'grid' ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:16 }}>
          {visible.map(m => {
            const dept = departments.find(d => d.id === m.departmentId);
            return (
              <div key={m.id} className="member-card" onClick={() => setSelected(m)}>
                <Avatar user={m} size="lg" />
                <div className="member-name">{m.name}</div>
                <span className={`badge ${ROLE_BADGE[m.role]} member-role-badge`}>{ROLE_LABELS[m.role]}</span>
                {dept && <div className="member-dept">{dept.icon} {dept.name}</div>}
                <div className="member-stats">
                  <div className="member-stat"><div className="member-stat-val">{m.points}</div><div>Điểm</div></div>
                  <div className="member-stat"><div className="member-stat-val">{m.tasksCompleted}</div><div>NV HT</div></div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ padding:0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Thành viên</th>
                  <th>Vai trò</th>
                  <th>Ban</th>
                  <th>Điểm</th>
                  <th>NV HT</th>
                  <th>Ngày gia nhập</th>
                  {canEdit && <th>Thao tác</th>}
                </tr>
              </thead>
              <tbody>
                {visible.map(m => {
                  const dept = departments.find(d => d.id === m.departmentId);
                  return (
                    <tr key={m.id} onClick={() => setSelected(m)} style={{ cursor:'pointer' }}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <Avatar user={m} size="sm" />
                          <div>
                            <div style={{ fontWeight:600 }}>{m.name}</div>
                            <div style={{ fontSize:12, color:'var(--text2)' }}>{m.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className={`badge ${ROLE_BADGE[m.role]}`}>{ROLE_LABELS[m.role]}</span></td>
                      <td>{dept ? `${dept.icon} ${dept.name}` : '-'}</td>
                      <td style={{ fontWeight:600, color:'var(--primary)' }}>{m.points}</td>
                      <td>{m.tasksCompleted}</td>
                      <td style={{ color:'var(--text2)' }}>{dayjs(m.joinDate).format('DD/MM/YYYY')}</td>
                      {canEdit && (
                        <td onClick={e => e.stopPropagation()}>
                          <div style={{ display:'flex', gap:4 }}>
                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditing(m); }}>✏️</button>
                            {canDelete && <button className="btn btn-ghost btn-icon btn-sm" style={{ color:'var(--danger)' }} onClick={() => handleDeleteMember(m.id)}>🗑️</button>}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {visible.length === 0 && <div className="empty-state"><div className="empty-icon">👥</div><div className="empty-title">Không tìm thấy thành viên nào</div></div>}

      {selected && (
        <ProfileModal member={selected} departments={departments} tasks={tasks} onClose={() => setSelected(null)}
          onEdit={() => { setEditing(selected); setSelected(null); }} canEdit={canEdit} />
      )}
      {(editing || showCreate) && (
        <MemberFormModal member={editing} departments={departments} onSave={handleSave} onClose={() => { setEditing(null); setShowCreate(false); }} />
      )}
    </div>
  );
}
