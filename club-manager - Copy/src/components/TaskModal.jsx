import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useToastStore } from '../store/toastStore';
import { useTaskStore } from '../store/taskStore';
import { Avatar } from './layout/AppLayout';
import { PRIORITY_COLORS, PRIORITY_LABELS } from '../constants';
import { validateTaskForm } from '../utils/validation';
import dayjs from 'dayjs';

export default function TaskModal({ task, onClose, members, departments, currentUser, onSave, onDelete, onArchive, canEdit, canDelete, canApprove, onAddComment }) {
  const { t } = useTranslation();
  const { showToast } = useToastStore();
  const allTasks = useTaskStore(s => s.tasks);

  // Realtime: get latest task data from store (especially comments)
  const liveTask = useMemo(() => allTasks.find(t => t.id === task?.id) || task, [allTasks, task]);
  const comments = liveTask?.comments || [];
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(task ? { ...task, tags: task.tags || [], attachments: task.attachments || [], points: task.points || 0, assigneeIds: task.assigneeIds || (task.assigneeId ? [task.assigneeId] : []) } : { title:'', description:'', status:'todo', priority:'medium', departmentId:'', assigneeIds:[], startDate: dayjs().format('YYYY-MM-DD'), deadline: dayjs().format('YYYY-MM-DD'), tags:[], points: 20, attachments: [], creatorId: currentUser.id });
  const [comment, setComment] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newAttachment, setNewAttachment] = useState({ name: '', url: '' });
  const [showAttachForm, setShowAttachForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const assignees = members.filter(m => form.assigneeIds?.includes(m.id));
  const creator = members.find(m => m.id === (task?.creatorId || form.creatorId));
  const dept = departments.find(d => d.id === form.departmentId);
  const priorityBadge = { low:'badge-success', medium:'badge-warning', high:'badge-danger', urgent:'badge-danger' };

  const calculatePoints = (priority) => {
    switch(priority) {
      case 'low': return 10;
      case 'medium': return 20;
      case 'high': return 30;
      case 'urgent': return 50;
      default: return 0;
    }
  };

  const handlePriorityChange = (e) => {
    const priority = e.target.value;
    setForm({...form, priority, points: calculatePoints(priority)});
  };

  const handleSave = () => {
    const { isValid, errors: validationErrors } = validateTaskForm(form);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    const data = { ...form };
    if (!task) data.points = calculatePoints(data.priority);
    onSave(data);
    setEditing(false);
  };

  const requestEdit = () => {
    if (!canEdit) {
      showToast('Bạn không có quyền sửa nhiệm vụ này', 'error');
      return;
    }
    setEditing(true);
  };

  const handleComment = () => {
    if (!comment.trim() || !liveTask) return;
    onAddComment(liveTask.id, currentUser.id, comment);
    setComment('');
  };

  const handleFileUpload = (e, target) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1 * 1024 * 1024) {
      showToast('File quá lớn, vui lòng chọn file < 1MB', 'error');
      return;
    }
    
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target.result;
      if (target === 'comment') {
        const fileComment = `[Tệp đính kèm] ${file.name}\n${base64Url}`;
        onAddComment(task.id, currentUser.id, fileComment);
      } else if (target === 'task') {
        const newAttachments = [...(task.attachments || []), { name: file.name, url: base64Url }];
        onSave({ ...task, attachments: newAttachments });
      } else if (target === 'form') {
        setForm(prev => ({ ...prev, attachments: [...prev.attachments, { name: file.name, url: base64Url }] }));
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const addTag = () => {
    if (newTag.trim() && !form.tags.includes(newTag.trim())) {
      setForm({ ...form, tags: [...form.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (tag) => {
    setForm({ ...form, tags: form.tags.filter(t => t !== tag) });
  };

  const addAttachment = () => {
    if (newAttachment.name.trim() && newAttachment.url.trim()) {
      setForm({ ...form, attachments: [...form.attachments, newAttachment] });
      setNewAttachment({ name: '', url: '' });
      setShowAttachForm(false);
    }
  };

  const removeAttachment = (index) => {
    setForm({ ...form, attachments: form.attachments.filter((_, i) => i !== index) });
  };

  const renderCommentText = (text) => {
    if (text.startsWith('[Tệp đính kèm]')) {
      const lines = text.split('\n');
      const filename = lines[0].replace('[Tệp đính kèm] ', '');
      const url = lines[1];
      if (url.startsWith('data:image')) {
        return <div><div style={{fontSize: 12, marginBottom: 4}}>{filename}</div><img src={url} alt={filename} style={{maxWidth: '100%', maxHeight: 150, borderRadius: 8}} /></div>;
      }
      return <a href={url} download={filename} style={{ color: 'var(--primary)', textDecoration: 'underline', fontSize: 13 }}>📎 Tải xuống: {filename}</a>;
    }
    return <div style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>{text}</div>;
  };

  if (editing || !task) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
          <div className="modal-header">
            <div className="modal-title">{task ? t('tasks.editTask') : t('tasks.addTask')}</div>
            <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">{t('tasks.taskTitle')} *</label>
              <input className="form-control" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Nhập tiêu đề..." />
            </div>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="form-label" style={{ marginBottom: 0 }}>{t('tasks.description')}</label>
              </div>
              <textarea className="form-control" rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Mô tả chi tiết công việc..." />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">{t('tasks.priorityLabel')}</label>
                <select className="form-control" value={form.priority} onChange={handlePriorityChange}>
                  {['low','medium','high','urgent'].map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t('tasks.points')} (Tự động tính)</label>
                <input type="number" className="form-control" value={form.points} disabled style={{ background: 'var(--bg3)', color: 'var(--text2)' }} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('tasks.startDate')}</label>
                <input type="date" className="form-control" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('tasks.deadline')}</label>
                <input type="date" className="form-control" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('tasks.department')}</label>
                <select className="form-control" value={form.departmentId} onChange={e => setForm({...form, departmentId: e.target.value})}>
                  <option value="">-- Chọn ban --</option>
                  <option value="all" style={{ fontWeight: 700, color: 'var(--primary)' }}>Tất cả các Ban</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t('tasks.assignee')} (Có thể chọn nhiều)</label>
                <select className="form-control" onChange={e => { if(e.target.value && !form.assigneeIds.includes(e.target.value)) setForm({ ...form, assigneeIds: [...form.assigneeIds, e.target.value] }); e.target.value = ''; }}>
                  <option value="">-- Thêm người --</option>
                  {members.filter(m => (!form.departmentId || form.departmentId === 'all' || m.departmentId === form.departmentId) && !form.assigneeIds.includes(m.id)).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: form.assigneeIds?.length > 0 ? 8 : 0 }}>
                  {assignees.map(m => (
                    <span key={m.id} className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {m.name}
                      <button onClick={() => setForm({ ...form, assigneeIds: form.assigneeIds.filter(id => id !== m.id) })} style={{ background:'none', border:'none', cursor:'pointer', color:'#fff', fontSize: 10 }}>✕</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">{t('tasks.tags')}</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                {form.tags.map(tag => (
                  <span key={tag} className="badge badge-gray" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    #{tag}
                    <button onClick={() => removeTag(tag)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--danger)' }}>✕</button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-control" value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()} placeholder="Nhập nhãn..." />
                <button className="btn btn-secondary" onClick={addTag}>{t('common.add')}</button>
              </div>
            </div>

            {canApprove && (
              <div className="form-group">
                <label className="form-label">{t('tasks.attachments')}</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
                  {form.attachments.map((att, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg3)', padding: '6px 12px', borderRadius: 8 }}>
                      <a href={att.url} download={att.name} style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none', wordBreak: 'break-all' }}>📎 {att.name}</a>
                      <button onClick={() => removeAttachment(idx)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--danger)', flexShrink: 0, paddingLeft: 10 }}>✕</button>
                    </div>
                  ))}
                </div>
                {!showAttachForm ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowAttachForm(true)}>🔗 {t('tasks.addAttachment')}</button>
                    <div>
                      <input type="file" id={`upload-form-${task?.id || 'new'}`} style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'form')} />
                      <label htmlFor={`upload-form-${task?.id || 'new'}`} className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-block' }}>
                        {uploading ? 'Đang tải...' : '📎 Upload File'}
                      </label>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--bg3)', padding: 12, borderRadius: 8 }}>
                    <input className="form-control" placeholder={t('tasks.linkName')} value={newAttachment.name} onChange={e => setNewAttachment({...newAttachment, name: e.target.value})} />
                    <input className="form-control" placeholder={t('tasks.linkUrl')} value={newAttachment.url} onChange={e => setNewAttachment({...newAttachment, url: e.target.value})} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-primary btn-sm" onClick={addAttachment}>{t('common.save')}</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setShowAttachForm(false)}>{t('common.cancel')}</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => task ? setEditing(false) : onClose()}>{t('common.cancel')}</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={!form.title}>{t('common.save')}</button>
          </div>
        </div>
      </div>
    );
  }

  const isArchived = task.status.startsWith('archived_');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
            <div className="priority-bar" style={{ position:'static', width:4, height:24, borderRadius:4, background: PRIORITY_COLORS[task.priority] }} />
            <div className="modal-title">{task.title}</div>
            {task.points > 0 && <span className="badge badge-primary">+{task.points}đ</span>}
            {isArchived && <span className={`badge ${task.status === 'archived_completed' ? 'badge-success' : 'badge-danger'}`}>{t(`tasks.status.${task.status}`)}</span>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {!isArchived && <button className="btn btn-secondary btn-sm" onClick={requestEdit}>✏️ {t('common.edit')}</button>}
            {canDelete && <button className="btn btn-danger btn-sm" onClick={() => { onDelete(task.id); onClose(); }}>🗑️</button>}
            <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            <span className={`badge ${priorityBadge[task.priority]}`}>{PRIORITY_LABELS[task.priority]}</span>
            {task.departmentId === 'all' ? (
              <span className="badge badge-primary" style={{ background: 'var(--primary)', color: '#fff' }}>🏢 Nhiệm vụ chung CLB</span>
            ) : dept && (
              <span className="badge badge-primary">{dept.icon} {dept.name}</span>
            )}
            {task.startDate && <span className="badge badge-gray">Bắt đầu: {dayjs(task.startDate).format('DD/MM/YYYY')}</span>}
            {task.deadline && <span className="badge badge-gray">Hạn: {dayjs(task.deadline).format('DD/MM/YYYY')}</span>}
          </div>
          {task.description && <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text2)', marginBottom: 16, whiteSpace: 'pre-wrap' }}>{task.description}</p>}
          {task.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              {task.tags.map(tag => <span key={tag} className="badge badge-gray">#{tag}</span>)}
            </div>
          )}
          {assignees.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px', background: 'var(--bg3)', borderRadius: 10, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, marginBottom: 4 }}>👥 Người phụ trách ({assignees.length})</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {assignees.map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar user={m} size="sm" />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {creator && (
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '8px 12px', background: 'var(--bg4)', borderRadius: 10, width: 'fit-content' }}>
               <Avatar user={creator} size="xs" />
               <span style={{ fontSize: 12, color: 'var(--text2)' }}>Người giao: <strong style={{ color: 'var(--text)' }}>{creator.name}</strong></span>
             </div>
          )}
          
          <div style={{ marginBottom: 16 }}>
            <div className="section-title" style={{ marginBottom: 10 }}>📎 {t('tasks.attachments')} & Nộp kết quả</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              {task.attachments?.map((att, idx) => {
                if (att.url.startsWith('data:image')) {
                  return <img key={idx} src={att.url} alt={att.name} style={{ height: 60, borderRadius: 8, border: '1px solid var(--border)' }} />;
                }
                return (
                  <a key={idx} href={att.url} download={att.name} style={{ padding: '6px 12px', background: 'var(--bg3)', borderRadius: 8, fontSize: 12, border: '1px solid var(--border)', color: 'var(--text)', textDecoration: 'none' }}>
                    🔗 {att.name}
                  </a>
                );
              })}
              {task.attachments?.length === 0 && <span style={{ fontSize: 12, color: 'var(--text3)' }}>Chưa có tệp nào.</span>}
            </div>
            {!isArchived && (
              <div>
                <input type="file" id={`upload-task-${task.id}`} style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'task')} />
                <label htmlFor={`upload-task-${task.id}`} className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                  {uploading ? 'Đang tải lên...' : '📤 Nộp File / Ảnh'}
                </label>
              </div>
            )}
          </div>

          {/* Comments */}
          <div>
            <div className="section-title" style={{ marginBottom: 4 }}>💬 {t('tasks.comments')} ({comments.length})</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic', marginBottom: 12 }}>
              👉 Nhận được thông tin thì hãy bình luận xác nhận. Nếu có thắc mắc hay cần hỗ trợ gì, hãy nhắn ở đây nhé!
            </div>
            
            {comments.map(c => {
              const u = members.find(m => m.id === c.userId);
              return (
                <div key={c.id} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  {u && <Avatar user={u} size="sm" />}
                  <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '8px 12px', flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{u?.name}</div>
                    {renderCommentText(c.text)}
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{dayjs(c.createdAt).fromNow()}</div>
                  </div>
                </div>
              );
            })}
            {!isArchived && (
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <Avatar user={currentUser} size="sm" />
                <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                  <input type="file" id={`upload-comment-${task.id}`} style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'comment')} />
                  <label htmlFor={`upload-comment-${task.id}`} className="btn btn-ghost btn-icon" style={{ cursor: 'pointer', fontSize: 18 }} title="Đính kèm file">📎</label>
                  <input className="form-control" value={comment} onChange={e => setComment(e.target.value)}
                    placeholder={t('tasks.addComment')}
                    onKeyDown={e => e.key === 'Enter' && handleComment()} />
                  <button className="btn btn-primary btn-sm" onClick={handleComment}>{t('common.submit')}</button>
                </div>
              </div>
            )}
          </div>
          
          {!isArchived && canApprove && (
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-danger" onClick={() => { onArchive(task.id, false); onClose(); }}>{t('tasks.markIncomplete')}</button>
              <button className="btn btn-success" onClick={() => { onArchive(task.id, true); onClose(); }}>{t('tasks.approveDone')}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
