import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMemberStore } from '../../store/memberStore';
import { useTaskStore } from '../../store/taskStore';
import { useAuthStore } from '../../store/authStore';
import { Avatar, getColor } from '../../components/layout/AppLayout';
import { exportToCSV } from '../../utils/exportUtils';
import { useToastStore } from '../../store/toastStore';
import { BADGE_THRESHOLDS } from '../../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const getBadge = (points) => BADGE_THRESHOLDS.find(b => points >= b.min) || BADGE_THRESHOLDS[4];

export default function LeaderboardPage() {
  const { t } = useTranslation();
  const { currentUser } = useAuthStore();
  const { members, departments } = useMemberStore();
  const { tasks } = useTaskStore();
  const { showToast } = useToastStore();
  const [filterDept, setFilterDept] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');

  const ranked = members
    .filter(m => m.role === 'member')
    .filter(m => filterDept === 'all' || m.departmentId === filterDept)
    .map(m => {
      const badge = getBadge(m.points);
      const dept = departments.find(d => d.id === m.departmentId);
      return { ...m, badge, deptName: dept?.name || '-', deptColor: dept?.color || '#888' };
    })
    .sort((a, b) => b.points - a.points);

  const top10 = ranked.slice(0, 10);
  const myRank = ranked.findIndex(m => m.id === currentUser?.id) + 1;
  const myEntry = ranked.find(m => m.id === currentUser?.id);

  const podium = [ranked[1], ranked[0], ranked[2]].filter(Boolean);
  const podiumSizes = [75, 100, 60];
  const podiumLabels = ['🥈', '🥇', '🥉'];

  const handleExportCSV = () => {
    const data = ranked.map((m, i) => ({
      'Hạng': i + 1,
      'Họ Tên': m.name,
      'Ban': m.deptName,
      'Điểm': m.points,
      'Nhiệm vụ HT': m.tasksCompleted,
      'Huy hiệu': m.badge.label
    }));
    exportToCSV(data, 'innohub_leaderboard');
    showToast(t('common.success'), 'success');
  };

  return (
    <div className="page-enter">
      <div className="section-header">
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>🏆 {t('leaderboard.title')}</h1>
        <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>📥 {t('members.exportCSV')}</button>
      </div>

      {/* My rank badge */}
      {myEntry && (
        <div className="card" style={{ marginBottom: 20, display:'flex', alignItems:'center', gap:16, background:'linear-gradient(135deg, var(--primary-light), transparent)' }}>
          <Avatar user={myEntry} size="lg" />
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, color:'var(--text2)' }}>Xếp hạng của bạn</div>
            <div style={{ fontSize:24, fontWeight:800 }}>#{myRank} <span style={{ fontSize:16, color:'var(--text2)' }}>trong {ranked.length} thành viên</span></div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:32 }}>{myEntry.badge.icon}</div>
            <div style={{ fontSize:12, color:'var(--text2)' }}>{myEntry.badge.label}</div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:28, fontWeight:800, color:'var(--primary)' }}>{myEntry.points}</div>
            <div style={{ fontSize:12, color:'var(--text2)' }}>Điểm</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filter-bar">
        <select className="form-control" style={{ width:'auto' }} value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          <option value="all">Tất cả các ban</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select className="form-control" style={{ width:'auto' }} value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)}>
          {['all','week','month','quarter'].map(p => <option key={p} value={p}>{t(`leaderboard.periods.${p}`)}</option>)}
        </select>
      </div>

      {/* Leaderboard Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>📊 Bảng xếp hạng thành viên</span>
          <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 400 }}>{ranked.length} thành viên</span>
        </div>
        <div className="table-wrap" style={{ maxHeight: '600px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'var(--bg2)', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <tr>
                <th style={{ width: '70px', textAlign: 'center' }}>Hạng</th>
                <th style={{ width: '200px' }}>Thành viên</th>
                <th style={{ width: '150px' }}>Ban</th>
                <th style={{ width: '150px' }}>Ngành học</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Điểm</th>
                <th style={{ width: '80px', textAlign: 'center' }}>NV HT</th>
                <th style={{ width: '90px', textAlign: 'center' }}>Huy hiệu</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((m, i) => (
                <tr key={m.id} style={m.id === currentUser?.id ? { background: 'var(--primary-light)' } : {}}>
                  <td style={{ fontWeight: 800, color: i < 3 ? ['#f59e0b', '#9ca3af', '#b45309'][i] : 'var(--text2)', fontSize: i < 3 ? 20 : 14, textAlign: 'center' }}>
                    {i < 3 ? ['🥇', '🥈', '🥉'][i] : `${i + 1}`}
                  </td>
                  <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar user={m} size="sm" />
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                        {m.id === currentUser?.id && <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 700 }}>★ BẠN</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.deptName}</td>
                  <td style={{ fontSize: 13, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.major || '-'}</td>
                  <td style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 16, textAlign: 'center' }}>{m.points}</td>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>{m.tasksCompleted}</td>
                  <td style={{ fontSize: 22, textAlign: 'center' }} title={m.badge.label}>{m.badge.icon}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
