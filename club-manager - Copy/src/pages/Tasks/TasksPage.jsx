import { useState } from 'react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from 'react-i18next';
import { useTaskStore } from '../../store/taskStore';
import { useAuthStore } from '../../store/authStore';
import { useMemberStore } from '../../store/memberStore';
import { useToastStore } from '../../store/toastStore';
import { useDialogStore } from '../../store/dialogStore';
import { can } from '../../utils/permissions';
import { Avatar, getColor } from '../../components/layout/AppLayout';
import dayjs from 'dayjs';

import TaskModal from '../../components/TaskModal';
import { PRIORITY_COLORS, PRIORITY_LABELS } from '../../constants';

const STATUSES = [
  { id: 'todo', color: '#9ca3af', emoji: '📌' },
  { id: 'inprogress', color: '#6366f1', emoji: '⚡' },
  { id: 'done', color: '#10b981', emoji: '✅' },
];

function TaskCard({ task, members, departments, onClick, isDragging }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({ id: task.id });
  
  const assignees = members.filter(m => (task.assigneeIds || (task.assigneeId ? [task.assigneeId] : [])).includes(m.id));
  const creator = members.find(m => m.id === task.creatorId);
  const dept = departments?.find(d => d.id === task.departmentId);
  
  const isOverdue = task.deadline && dayjs(task.deadline).isBefore(dayjs(), 'day') && task.status !== 'done';
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isSortableDragging ? 0.4 : 1 };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className={`task-card ${isSortableDragging ? 'dragging' : ''}`}
      onClick={(e) => { e.stopPropagation(); onClick(task); }}>
      <div className="priority-bar" style={{ background: PRIORITY_COLORS[task.priority] }} />
      <div style={{ paddingLeft: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="task-card-title">{task.title}</div>
          {task.points > 0 && (
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 6px', borderRadius: 10 }}>
              +{task.points}đ
            </div>
          )}
        </div>
        {/* Department badge */}
        {dept && (
          <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 8, background: `${dept.color}20`, color: dept.color, fontWeight: 600, display: 'inline-block', marginBottom: 4 }}>
            {dept.icon} {dept.name.replace('Ban ', '')}
          </span>
        )}
        {task.departmentId === 'all' && (
          <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 8, background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600, display: 'inline-block', marginBottom: 4 }}>
            🏢 Chung CLB
          </span>
        )}
        {task.tags?.length > 0 && (
          <div className="task-card-tags">
            {task.tags.slice(0,3).map(tag => <span key={tag} className="badge badge-gray" style={{ fontSize: 10 }}>#{tag}</span>)}
          </div>
        )}
        <div className="task-card-footer">
          <div className="task-card-deadline" style={isOverdue ? { color: 'var(--danger)' } : {}}>
            🗓 {dayjs(task.deadline).format('DD/MM')}
            {isOverdue && ' ⚠️'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="badge" style={{ background: `${PRIORITY_COLORS[task.priority]}20`, color: PRIORITY_COLORS[task.priority], fontSize: 10 }}>
              {PRIORITY_LABELS[task.priority]}
            </span>
            <div style={{ display: 'flex', marginLeft: 4 }}>
              {assignees.slice(0, 3).map((m, idx) => (
                <div key={m.id} style={{ marginLeft: idx > 0 ? -8 : 0, border: '2px solid var(--bg3)', borderRadius: '50%' }}>
                  <Avatar user={m} size="sm" />
                </div>
              ))}
              {assignees.length > 3 && (
                <div style={{ marginLeft: -8, width: 24, height: 24, borderRadius: '50%', background: 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, border: '2px solid var(--bg3)' }}>
                  +{assignees.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          {creator && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text3)' }}>
              <Avatar user={creator} size="xs" />
              <span>{creator.name}</span>
            </div>
          )}
          {task.comments?.length > 0 && (
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>💬 {task.comments.length}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({ status, tasks, members, departments, onTaskClick, onAddTask, canCreate }) {
  const { t } = useTranslation();
  const s = STATUSES.find(s => s.id === status);
  const { setNodeRef } = useDroppable({ id: status });
  return (
    <div className="kanban-col" ref={setNodeRef}>
      <div className="kanban-col-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{s.emoji}</span>
          <span>{t(`tasks.status.${status}`)}</span>
          <span style={{ background: 'var(--bg4)', borderRadius: 20, padding: '1px 8px', fontSize: 12, color: 'var(--text2)' }}>{tasks.length}</span>
        </div>
        {canCreate && status === 'todo' && (
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onAddTask} style={{ fontSize: 16 }}>+</button>
        )}
      </div>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="kanban-col-body">
          {tasks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text3)', fontSize: 13 }}>
              Trống
            </div>
          )}
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} members={members} departments={departments} onClick={onTaskClick} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}



export default function TasksPage() {
  const { t } = useTranslation();
  const { currentUser } = useAuthStore();
  const { tasks, moveTask, addTask, updateTask, deleteTask, addComment, archiveTask } = useTaskStore();
  const { members, departments, updateMember } = useMemberStore();
  const { showToast } = useToastStore();
  const { showConfirm } = useDialogStore();
  
  const [activeTab, setActiveTab] = useState('board');
  const [filterDept, setFilterDept] = useState('all');
  const [filterScope, setFilterScope] = useState('all'); // 'all' | 'dept' | 'mine'
  const [showCreate, setShowCreate] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const canCreate = can(currentUser, 'CREATE_TASK');
  const canEdit = can(currentUser, 'EDIT_DEPT_TASK');
  const canDelete = can(currentUser, 'DELETE_TASK');
  const canApprove = currentUser?.role === 'super_admin' || currentUser?.role === 'admin' || currentUser?.role === 'manager';

  let visibleTasks = tasks;

  if (filterScope === 'all') {
    if (filterDept === 'all') {
      visibleTasks = tasks;
    } else {
      visibleTasks = tasks.filter(t => t.departmentId === filterDept || t.departmentId === 'all');
    }
  } else if (filterScope === 'dept') {
    visibleTasks = tasks.filter(t =>
      t.departmentId === currentUser?.departmentId ||
      t.departmentId === 'all' ||
      t.assigneeId === currentUser?.id ||
      t.assigneeIds?.includes(currentUser?.id)
    );
  } else if (filterScope === 'mine') {
    visibleTasks = tasks.filter(t =>
      t.assigneeId === currentUser?.id ||
      t.assigneeIds?.includes(currentUser?.id)
    );
  }

  const boardTasks = visibleTasks.filter(t => !t.status.startsWith('archived_'));
  const archivedTasks = visibleTasks.filter(t => t.status.startsWith('archived_')).sort((a,b) => dayjs(b.completedAt || b.createdAt).diff(dayjs(a.completedAt || a.createdAt)));

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragStart = (e) => setActiveTask(tasks.find(t => t.id === e.active.id));
  const handleDragEnd = (e) => {
    const { active, over } = e;
    setActiveTask(null);
    if (!over) return;
    const newStatus = STATUSES.find(s => over.id === s.id) ? over.id : tasks.find(t => t.id === over.id)?.status;
    if (newStatus && tasks.find(t => t.id === active.id)?.status !== newStatus) {
      moveTask(active.id, newStatus);
      showToast(t('tasks.moved'), 'info', 2000);
    }
  };

  const handleSaveTask = (data) => {
    if (selectedTask) {
      updateTask(selectedTask.id, data);
      showToast(t('tasks.updated'), 'success');
    } else {
      addTask(data);
      showToast(t('tasks.created'), 'success');
    }
    setSelectedTask(null);
    setShowCreate(false);
  };

  const handleDeleteTask = (id) => {
    showConfirm({
      title: t('tasks.deleteTask'),
      message: t('tasks.confirmDelete'),
      danger: true,
      onConfirm: () => {
        deleteTask(id);
        showToast(t('tasks.deleted'), 'error');
        setSelectedTask(null);
      }
    });
  };

  const handleArchiveTask = (taskId, success) => {
    archiveTask(taskId, success);
    const task = tasks.find(t => t.id === taskId);
    if (success && task && task.assigneeId && task.points > 0) {
      const member = members.find(m => m.id === task.assigneeId);
      if (member) {
        updateMember(member.id, { 
          points: (member.points || 0) + task.points,
          tasksCompleted: (member.tasksCompleted || 0) + 1 
        });
        showToast(`Đã cộng ${task.points} điểm cho ${member.name}`, 'success');
      }
    } else {
      showToast(t('tasks.archived'), 'info');
    }
  };

  return (
    <div className="page-enter">
      <div className="section-header">
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>📋 {t('tasks.title')}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ display: 'flex', background: 'var(--bg3)', borderRadius: 8, padding: 4 }}>
            <button className={`btn ${activeTab === 'board' ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setActiveTab('board')}>{t('tasks.board')}</button>
            <button className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setActiveTab('history')}>{t('tasks.history')}</button>
          </div>
          {canCreate && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>+ {t('tasks.addTask')}</button>
          )}
        </div>
      </div>

      <div className="filter-bar">
        <select className="form-control" style={{ width: 'auto' }} value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          <option value="all">Tất cả các Ban</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select className="form-control" style={{ width: 'auto' }} value={filterScope} onChange={e => setFilterScope(e.target.value)}>
          <option value="all">Tất cả nhiệm vụ</option>
          <option value="dept">Nhiệm vụ của Ban</option>
          <option value="mine">Nhiệm vụ của tôi</option>
        </select>
        {activeTab === 'board' && <span style={{ fontSize: 12, color: 'var(--text3)' }}>💡 {t('tasks.dragHint')}</span>}
      </div>

      {activeTab === 'board' ? (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="kanban-board">
            {STATUSES.map(status => (
              <KanbanColumn
                key={status.id}
                status={status.id}
                tasks={boardTasks.filter(t => t.status === status.id)}
                members={members}
                departments={departments}
                onTaskClick={setSelectedTask}
                onAddTask={() => setShowCreate(true)}
                canCreate={canCreate}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask && (
              <div className="task-card" style={{ opacity: 0.9, boxShadow: 'var(--shadow-lg)', cursor: 'grabbing' }}>
                <div className="priority-bar" style={{ background: PRIORITY_COLORS[activeTask.priority] }} />
                <div style={{ paddingLeft: 8 }}>
                  <div className="task-card-title">{activeTask.title}</div>
                </div>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text2)' }}>{t('tasks.taskTitle')}</th>
                <th style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text2)' }}>Người thực hiện</th>
                <th style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text2)' }}>Điểm</th>
                <th style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text2)' }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {archivedTasks.map(task => (
                <tr key={task.id} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => setSelectedTask(task)}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: 14 }}>{task.title}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {task.assigneeId ? members.find(m => m.id === task.assigneeId)?.name : '-'}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--primary)', fontWeight: 600 }}>{task.points ? `+${task.points}` : '-'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`badge ${task.status === 'archived_completed' ? 'badge-success' : 'badge-danger'}`}>
                      {t(`tasks.status.${task.status}`)}
                    </span>
                  </td>
                </tr>
              ))}
              {archivedTasks.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24, color: 'var(--text3)' }}>Trống</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {(selectedTask) && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          members={members}
          departments={departments}
          currentUser={currentUser}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          onArchive={handleArchiveTask}
          canEdit={can(currentUser, 'EDIT_ANY_TASK') || (canEdit && (selectedTask.departmentId === currentUser?.departmentId || selectedTask.departmentId === 'all'))}
          canDelete={canDelete}
          canApprove={canApprove && (can(currentUser, 'EDIT_ANY_TASK') || selectedTask.departmentId === currentUser?.departmentId || selectedTask.departmentId === 'all')}
          onAddComment={addComment}
        />
      )}

      {showCreate && (
        <TaskModal
          task={null}
          onClose={() => setShowCreate(false)}
          members={members}
          departments={departments}
          currentUser={currentUser}
          onSave={handleSaveTask}
          onDelete={() => {}}
          onArchive={() => {}}
          canEdit={true}
          canDelete={false}
          canApprove={canApprove}
          onAddComment={() => {}}
        />
      )}
    </div>
  );
}
