import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useTaskStore } from '../../store/taskStore';
import { useMemberStore } from '../../store/memberStore';
import { Avatar } from '../layout/AppLayout';

export default function GlobalSearch({ isOpen, onClose }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tasks } = useTaskStore();
  const { members, departments } = useMemberStore();
  
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const results = [];
  if (query.trim().length > 1) {
    const lowerQuery = query.toLowerCase();
    
    // Search tasks
    tasks.filter(task => 
      task.title.toLowerCase().includes(lowerQuery) || 
      task.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      task.description?.toLowerCase().includes(lowerQuery)
    ).forEach(task => {
      results.push({
        type: 'task',
        id: task.id,
        title: task.title,
        subtitle: t(`tasks.status.${task.status}`),
        icon: '📋',
        onClick: () => { navigate('/tasks'); onClose(); }
      });
    });

    // Search members
    members.filter(member => 
      member.name.toLowerCase().includes(lowerQuery) || 
      member.email?.toLowerCase().includes(lowerQuery) ||
      member.studentId?.toLowerCase().includes(lowerQuery)
    ).forEach(member => {
      const dept = departments.find(d => d.id === member.departmentId);
      results.push({
        type: 'member',
        id: member.id,
        title: member.name,
        subtitle: dept ? dept.name : t(`login.roles.${member.role}`),
        icon: <Avatar user={member} size="sm" />,
        onClick: () => { navigate('/members'); onClose(); }
      });
    });
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    if (results.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      results[selectedIndex]?.onClick();
    }
  };

  return (
    <div className="modal-overlay fade-in" style={{ zIndex: 3000, alignItems: 'flex-start', paddingTop: '10vh' }} onClick={onClose}>
      <div className="modal scale-in" style={{ width: '100%', maxWidth: 600, padding: 0 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 20, color: 'var(--text3)', marginRight: 12 }}>🔍</span>
          <input 
            ref={inputRef}
            className="form-control" 
            style={{ border: 'none', background: 'transparent', padding: 0, fontSize: 18, flex: 1, boxShadow: 'none' }}
            placeholder={t('search.placeholder')}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
          />
          <span style={{ fontSize: 12, background: 'var(--bg3)', padding: '2px 6px', borderRadius: 4, color: 'var(--text2)' }}>ESC</span>
        </div>
        
        <div style={{ maxHeight: 400, overflowY: 'auto', padding: '12px 0' }}>
          {query.trim().length <= 1 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text3)', fontSize: 14 }}>
              {t('search.hint')}
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text3)', fontSize: 14 }}>
              {t('search.noResults')}
            </div>
          ) : (
            <div>
              {['task', 'member'].map(type => {
                const typeResults = results.filter(r => r.type === type);
                if (typeResults.length === 0) return null;
                return (
                  <div key={type}>
                    <div style={{ padding: '8px 20px', fontSize: 12, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase' }}>
                      {t(`search.${type}s`)}
                    </div>
                    {typeResults.map(res => {
                      const idx = results.indexOf(res);
                      const isSelected = idx === selectedIndex;
                      return (
                        <div 
                          key={res.id} 
                          style={{ 
                            padding: '12px 20px', 
                            display: 'flex', alignItems: 'center', gap: 12, 
                            cursor: 'pointer',
                            background: isSelected ? 'var(--bg3)' : 'transparent',
                            borderLeft: isSelected ? '3px solid var(--primary)' : '3px solid transparent'
                          }}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          onClick={res.onClick}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28 }}>
                            {typeof res.icon === 'string' ? <span style={{ fontSize: 18 }}>{res.icon}</span> : res.icon}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 500, color: isSelected ? 'var(--primary)' : 'var(--text)' }}>{res.title}</div>
                            <div style={{ fontSize: 12, color: 'var(--text2)' }}>{res.subtitle}</div>
                          </div>
                          {isSelected && <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text3)' }}>Enter ↵</span>}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
