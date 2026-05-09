import React from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar } from '../layout/AppLayout';
import dayjs from 'dayjs';

const ROLE_LABELS = { admin: 'Quản trị viên', president: 'Chủ nhiệm', leader: 'Trưởng ban', member: 'Thành viên' };
const ROLE_BADGE = { admin: 'role-admin', president: 'role-president', leader: 'role-leader', member: 'role-member' };

export default function ProfileModal({ member, departments, tasks, onClose, onEdit, canEdit }) {
  const { t } = useTranslation();
  if (!member) return null;

  const dept = departments.find(d => d.id === member.departmentId);
  const memberTasks = tasks.filter(t => t.assigneeIds?.includes(member.id) || t.assigneeId === member.id);
  const doneTasks = memberTasks.filter(t => t.status === 'done');
  const rate = memberTasks.length ? Math.round((doneTasks.length / memberTasks.length) * 100) : 0;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Hồ sơ thành viên</div>
          <div style={{ display:'flex', gap:8 }}>
            {canEdit && onEdit && <button className="btn btn-secondary btn-sm" onClick={onEdit}>✏️ Sửa</button>}
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
              {member.major && <div style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>🎓 {member.major}</div>}
            </div>
            <div style={{ display:'flex', gap:24 }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:22, fontWeight:800, color:'var(--primary)' }}>{member.points}</div>
                <div style={{ fontSize:12, color:'var(--text2)' }}>Điểm</div>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:22, fontWeight:800, color:'var(--success)' }}>{member.tasksCompleted || 0}</div>
                <div style={{ fontSize:12, color:'var(--text2)' }}>Nhiệm vụ HT</div>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:22, fontWeight:800, color:'var(--warning)' }}>{rate}%</div>
                <div style={{ fontSize:12, color:'var(--text2)' }}>Tỷ lệ HT</div>
              </div>
            </div>
          </div>
          {member.bio && <p style={{ fontSize:14, color:'var(--text2)', textAlign:'center', marginBottom:16, fontStyle:'italic' }}>"{member.bio}"</p>}
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {memberTasks.slice(0,5).map(task => (
                  <div key={task.id} style={{ display:'flex', justifyContent:'space-between', padding:'8px 12px', background: 'var(--bg3)', borderRadius: 8, fontSize:13 }}>
                    <span style={{ fontWeight: 500 }}>{task.title}</span>
                    <span className={`badge badge-${task.status === 'done' ? 'success' : 'primary'}`} style={{ fontSize:10 }}>
                      {task.status === 'done' ? 'Hoàn thành' : 'Đang làm'}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
