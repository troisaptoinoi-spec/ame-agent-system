// InnoHub Debug System — chỉ áp dụng cho dự án này
// Sử dụng: window.InnoHubDebug.help() trong browser console

const DEBUG_KEY = 'innohub_debug_mode';

const DebugSystem = {
  // Bật/tắt debug mode
  enable: () => { localStorage.setItem(DEBUG_KEY, 'true'); console.log('[InnoHub] Debug mode ON'); },
  disable: () => { localStorage.removeItem(DEBUG_KEY); console.log('[InnoHub] Debug mode OFF'); },
  isEnabled: () => localStorage.getItem(DEBUG_KEY) === 'true',

  // Xem tất cả dữ liệu localStorage
  dumpData: () => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('innohub_'));
    const data = {};
    keys.forEach(k => {
      try { data[k] = JSON.parse(localStorage.getItem(k)); }
      catch { data[k] = localStorage.getItem(k); }
    });
    console.table(keys.map(k => ({ key: k, size: localStorage.getItem(k)?.length || 0, type: typeof data[k] })));
    return data;
  },

  // Xem thống kê nhanh
  stats: () => {
    try {
      const tasks = JSON.parse(localStorage.getItem('innohub_tasks') || '[]');
      const members = JSON.parse(localStorage.getItem('innohub_members') || '[]');
      const events = JSON.parse(localStorage.getItem('innohub_events') || '[]');
      const activities = JSON.parse(localStorage.getItem('innohub_activities') || '[]');

      const taskStats = {
        total: tasks.length,
        todo: tasks.filter(t => t.status === 'todo').length,
        inprogress: tasks.filter(t => t.status === 'inprogress').length,
        done: tasks.filter(t => t.status === 'done').length,
        archived: tasks.filter(t => t.status?.startsWith('archived_')).length,
      };

      const memberStats = {
        total: members.length,
        super_admin: members.filter(m => m.role === 'super_admin').length,
        admin: members.filter(m => m.role === 'admin').length,
        manager: members.filter(m => m.role === 'manager').length,
        members: members.filter(m => m.role === 'member').length,
      };

      console.log('📊 InnoHub Stats');
      console.log('Tasks:', taskStats);
      console.log('Members:', memberStats);
      console.log('Events:', events.length);
      console.log('Activities:', activities.length);
      console.log('Data version:', localStorage.getItem('innohub_data_version'));

      return { tasks: taskStats, members: memberStats, events: events.length, activities: activities.length };
    } catch (e) {
      console.error('[InnoHub Debug] Error reading data:', e);
      return null;
    }
  },

  // Reset toàn bộ dữ liệu
  resetAll: () => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('innohub_'));
    keys.forEach(k => localStorage.removeItem(k));
    console.log(`[InnoHub] Reset ${keys.length} keys. Reload page to see changes.`);
  },

  // Xuất dữ liệu ra JSON
  exportData: () => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('innohub_'));
    const data = {};
    keys.forEach(k => { data[k] = localStorage.getItem(k); });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `innohub-debug-${new Date().toISOString().split('T')[0]}.json`;
    a.click(); URL.revokeObjectURL(url);
    console.log('[InnoHub] Data exported');
  },

  // Kiểm tra localStorage usage
  storageUsage: () => {
    let total = 0;
    const items = [];
    Object.keys(localStorage).filter(k => k.startsWith('innohub_')).forEach(k => {
      const size = localStorage.getItem(k)?.length || 0;
      total += size;
      items.push({ key: k, sizeKB: (size / 1024).toFixed(2) });
    });
    console.table(items);
    console.log(`Total: ${(total / 1024).toFixed(2)} KB / 5120 KB (${((total / 1024 / 5120) * 100).toFixed(1)}%)`);
    return { items, totalKB: (total / 1024).toFixed(2) };
  },

  // Liệt kê tất cả commands
  help: () => {
    console.log(`
🔧 InnoHub Debug System
========================
InnoHubDebug.enable()      — Bật debug mode
InnoHubDebug.disable()     — Tắt debug mode
InnoHubDebug.stats()       — Xem thống kê nhanh
InnoHubDebug.dumpData()    — Xem tất cả dữ liệu
InnoHubDebug.storageUsage() — Kiểm tra dung lượng localStorage
InnoHubDebug.exportData()  — Xuất dữ liệu ra JSON
InnoHubDebug.resetAll()    — Reset toàn bộ dữ liệu
InnoHubDebug.help()        — Hiển thị hướng dẫn này
    `);
  },
};

// Expose to window
if (typeof window !== 'undefined') {
  window.InnoHubDebug = DebugSystem;
}

export default DebugSystem;
