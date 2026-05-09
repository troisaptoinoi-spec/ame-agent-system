import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTaskStore } from '../../store/taskStore';
import { useEventStore } from '../../store/eventStore';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { useDialogStore } from '../../store/dialogStore';
import { useMemberStore } from '../../store/memberStore';
import { can } from '../../utils/permissions';
import { validateEventForm } from '../../utils/validation';
import dayjs from 'dayjs';
import TaskModal from '../../components/TaskModal';

function EventModal({ event, onSave, onDelete, onClose }) {
  const [form, setForm] = useState(event || { title: '', date: dayjs().format('YYYY-MM-DD'), type: 'meeting', color: '#6366f1', description: '' });
  const [errors, setErrors] = useState({});

  const handleSave = () => {
    const { isValid, errors: validationErrors } = validateEventForm(form);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    onSave(form);
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{event ? 'Chỉnh sửa sự kiện' : 'Thêm sự kiện mới'}</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Tên sự kiện *</label>
            <input className={`form-control ${errors.title ? 'input-error' : ''}`} value={form.title} onChange={e => handleChange('title', e.target.value)} aria-required="true" aria-invalid={!!errors.title} />
            {errors.title && <div className="field-error">{errors.title}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Ngày diễn ra</label>
            <input className={`form-control ${errors.date ? 'input-error' : ''}`} type="date" value={form.date} onChange={e => handleChange('date', e.target.value)} aria-invalid={!!errors.date} />
            {errors.date && <div className="field-error">{errors.date}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Loại sự kiện</label>
            <input className="form-control" placeholder="Ví dụ: Họp, Workshop,..." value={form.type} onChange={e => handleChange('type', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Màu sắc</label>
            <input className="form-control" type="color" value={form.color} onChange={e => handleChange('color', e.target.value)} style={{ height: 40 }} />
          </div>
          <div className="form-group">
            <label className="form-label">Mô tả</label>
            <textarea className="form-control" value={form.description} onChange={e => handleChange('description', e.target.value)} />
          </div>
        </div>
        <div className="modal-footer">
          {event && (
            <button className="btn btn-ghost" style={{ color: 'var(--danger)', marginRight: 'auto' }} onClick={() => onDelete(event.id)}>Xóa</button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={handleSave}>Lưu sự kiện</button>
        </div>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const { t } = useTranslation();
  const { currentUser } = useAuthStore();
  const { members, departments } = useMemberStore();
  const { tasks, updateTask, deleteTask, archiveTask, addComment } = useTaskStore();
  const { events, addEvent, updateEvent, deleteEvent } = useEventStore();
  const { showToast } = useToastStore();
  const { showConfirm } = useDialogStore();

  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const canManage = currentUser?.role === 'super_admin' || currentUser?.role === 'admin' || currentUser?.role === 'manager';
  
  const startOfMonth = currentDate.startOf('month');
  const daysInMonth = currentDate.daysInMonth();
  
  const firstDayIndex = startOfMonth.day() === 0 ? 6 : startOfMonth.day() - 1;
  
  const prevMonth = currentDate.subtract(1, 'month');
  const prevMonthDays = prevMonth.daysInMonth();
  const prevMonthPadding = Array.from({ length: firstDayIndex }, (_, i) => prevMonthDays - firstDayIndex + i + 1);
  
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  const totalCells = 42;
  const nextMonthPaddingCount = totalCells - prevMonthPadding.length - currentMonthDays.length;
  const nextMonthPadding = Array.from({ length: nextMonthPaddingCount }, (_, i) => i + 1);

  const getEventsForDay = (day, isCurrentMonth) => {
    if (!isCurrentMonth) return { events: [], tasks: [] };
    const dateStr = currentDate.date(day).format('YYYY-MM-DD');
    const dayEvents = events.filter(e => e.date === dateStr);
    const dayTasks = tasks.filter(t => t.deadline && dayjs(t.deadline).format('YYYY-MM-DD') === dateStr && t.status !== 'done');
    return { events: dayEvents, tasks: dayTasks };
  };

  const handleSaveEvent = (data) => {
    if (selectedEvent?.id) {
      updateEvent(selectedEvent.id, data);
      showToast('Đã cập nhật sự kiện', 'success');
    } else {
      addEvent(data);
      showToast('Đã thêm sự kiện mới', 'success');
    }
    setShowModal(false);
    setSelectedEvent(null);
  };

  const handleDeleteEvent = (id) => {
    showConfirm({
      title: 'Xóa sự kiện',
      message: 'Bạn có chắc muốn xóa sự kiện này?',
      onConfirm: () => {
        deleteEvent(id);
        showToast('Đã xóa sự kiện', 'success');
        setShowModal(false);
        setSelectedEvent(null);
      }
    });
  };

  const nextMonthAction = () => setCurrentDate(currentDate.add(1, 'month'));
  const prevMonthAction = () => setCurrentDate(currentDate.subtract(1, 'month'));
  const today = () => setCurrentDate(dayjs());

  return (
    <div className="page-enter">
      <div className="section-header">
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>📅 {t('events.title')}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {canManage && (
            <button className="btn btn-primary btn-sm" onClick={() => { setSelectedEvent(null); setShowModal(true); }}>+ Thêm sự kiện</button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={today}>{t('common.today')}</button>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg3)', borderRadius: 8, overflow: 'hidden' }}>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={prevMonthAction}>&lt;</button>
            <div style={{ width: 140, textAlign: 'center', fontWeight: 700, fontSize: 14, color: 'var(--primary)' }}>
              Tháng {currentDate.format('MM / YYYY')}
            </div>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={nextMonthAction}>&gt;</button>
          </div>
        </div>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: '3.5fr 1.5fr' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
            {['Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7','CN'].map(d => (
              <div key={d} style={{ padding: '12px 0', fontSize: 12, fontWeight: 700, color: 'var(--text2)' }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: '120px' }}>
            {prevMonthPadding.map(day => (
              <div key={`prev-${day}`} style={{ borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '8px', background: 'var(--bg2)', opacity: 0.4 }}>
                <div style={{ fontSize: 13, color: 'var(--text3)' }}>{day}</div>
              </div>
            ))}
            
            {currentMonthDays.map(day => {
              const { events: dayEvents, tasks: dayTasks } = getEventsForDay(day, true);
              const isToday = day === dayjs().date() && currentDate.isSame(dayjs(), 'month');
              return (
                  <div 
                    onClick={() => { if(canManage) { setSelectedEvent({ title: '', date: currentDate.date(day).format('YYYY-MM-DD'), type: 'meeting', color: '#6366f1', description: '' }); setShowModal(true); } }}
                    style={{ borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '8px', background: isToday ? 'rgba(99, 102, 241, 0.05)' : 'transparent', display: 'flex', flexDirection: 'column', cursor: canManage ? 'pointer' : 'default' }}>
                    <div style={{ fontSize: 13, fontWeight: isToday ? 800 : 600, color: isToday ? 'var(--primary)' : 'var(--text)', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {day}
                      {isToday && <span style={{ width: 6, height: 6, background: 'var(--primary)', borderRadius: '50%' }} />}
                    </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, overflowY: 'auto' }}>
                    {dayEvents.map(e => (
                      <div key={e.id} 
                        onClick={(e_stop) => { e_stop.stopPropagation(); if(canManage) { setSelectedEvent(e); setShowModal(true); } }}
                        style={{ fontSize: 10, padding: '3px 6px', background: e.color, color: '#fff', borderRadius: 4, whiteSpace: 'normal', wordBreak: 'break-word', cursor: canManage ? 'pointer' : 'default', fontWeight: 500 }}
                      >
                        {e.title}
                      </div>
                    ))}
                    {dayTasks.map(t => (
                      <div key={t.id} 
                        onClick={(e_stop) => { e_stop.stopPropagation(); setSelectedTask(t); }}
                        style={{ fontSize: 10, padding: '2px 6px', background: 'var(--bg3)', borderRadius: 4, whiteSpace: 'normal', wordBreak: 'break-word', borderLeft: '2px solid var(--danger)', color: 'var(--text2)', cursor: 'pointer' }}
                      >
                        DL: {t.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {nextMonthPadding.map(day => (
              <div key={`next-${day}`} style={{ borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '8px', background: 'var(--bg2)', opacity: 0.4 }}>
                <div style={{ fontSize: 13, color: 'var(--text3)' }}>{day}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card">
            <div className="section-header" style={{ marginBottom: 16 }}>
              <div className="section-title">✨ {t('events.upcoming')}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {events.filter(e => dayjs(e.date).isAfter(dayjs().subtract(1, 'day'))).sort((a,b) => dayjs(a.date).diff(dayjs(b.date))).slice(0, 5).map(e => (
                <div key={e.id} style={{ display: 'flex', gap: 12, cursor: canManage ? 'pointer' : 'default' }} onClick={() => { if(canManage) { setSelectedEvent(e); setShowModal(true); } }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg3)', padding: '8px', borderRadius: 10, minWidth: 55, border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase' }}>Th {dayjs(e.date).month() + 1}</span>
                    <span style={{ fontSize: 20, fontWeight: 800 }}>{dayjs(e.date).date()}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{e.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{e.type}</div>
                  </div>
                </div>
              ))}
              {events.length === 0 && <div style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', padding: '20px 0' }}>{t('events.noEvents')}</div>}
            </div>
          </div>

          <div className="card">
            <div className="section-header" style={{ marginBottom: 16 }}>
              <div className="section-title">🚩 {t('events.taskDeadlines')}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tasks.filter(t => t.deadline && t.status !== 'done').sort((a,b) => dayjs(a.deadline).diff(dayjs(b.deadline))).slice(0, 5).map(t => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg3)', borderRadius: 8, borderLeft: '3px solid var(--danger)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: 10 }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 700 }}>{dayjs(t.deadline).format('DD/MM')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <EventModal 
          event={selectedEvent} 
          onSave={handleSaveEvent} 
          onDelete={handleDeleteEvent}
          onClose={() => { setShowModal(false); setSelectedEvent(null); }} 
        />
      )}
      {selectedTask && (
        <TaskModal 
          task={selectedTask}
          members={members}
          departments={departments}
          currentUser={currentUser}
          onClose={() => setSelectedTask(null)}
          onSave={(data) => { updateTask(selectedTask.id, data); showToast(t('tasks.updated'), 'success'); setSelectedTask(null); }}
          onDelete={(id) => { deleteTask(id); showToast(t('tasks.deleted'), 'error'); setSelectedTask(null); }}
          onArchive={(id, isDone) => { archiveTask(id, isDone ? 'archived_completed' : 'archived_incomplete'); showToast(isDone ? t('tasks.approved') : t('tasks.incomplete'), isDone ? 'success' : 'error'); setSelectedTask(null); }}
          onAddComment={(id, uid, txt) => { addComment(id, { userId: uid, text: txt }); showToast(t('common.success'), 'success'); }}
          canEdit={can(currentUser, 'EDIT_ANY_TASK') || (can(currentUser, 'EDIT_DEPT_TASK') && currentUser.departmentId === selectedTask.departmentId) || selectedTask.assigneeId === currentUser.id}
          canDelete={can(currentUser, 'DELETE_TASK')}
          canApprove={can(currentUser, 'APPROVE_TASK') && (can(currentUser, 'EDIT_ANY_TASK') || currentUser.departmentId === selectedTask.departmentId)}
        />
      )}
    </div>
  );
}
