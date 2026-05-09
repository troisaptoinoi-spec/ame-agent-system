# 🔍 Code Review Report — InnoHub CLB Manager

> **Ngày:** 2026-05-08
> **Phạm vi:** Toàn bộ codebase hiện tại
> **Đánh giá:** Code quality, Security, Performance, SOLID compliance

---

## 📊 Tổng quan

| Hạng mục | Điểm (1-10) | Đánh giá |
|----------|:-----------:|----------|
| **Code Quality** | 6/10 | 🟡 Trung bình — Cần cải thiện |
| **Security** | 3/10 | 🔴 Kém — Nhiều lỗ hổng |
| **Performance** | 7/10 | 🟢 Tốt — Ít vấn đề |
| **SOLID Compliance** | 5/10 | 🟡 Trung bình — Vi phạm một số nguyên tắc |
| **Error Handling** | 4/10 | 🔴 Yếu — Nhiều catch rỗng |
| **Test Coverage** | 5/10 | 🟡 Trung bình — Có test nhưng chưa đủ |
| **Naming Conventions** | 7/10 | 🟢 Tốt — Nhất quán |
| **Tổng** | **5.3/10** | 🟡 Cần cải thiện đáng kể |

---

## 🔴 Critical Findings

| # | File | Vấn đề | Severity | Mô tả |
|---|------|--------|:--------:|-------|
| C1 | [`src/store/authStore.js`](../src/store/authStore.js) | **Demo auth — không có xác thực thực sự** | 🔴 Critical | `login(role)` chỉ chọn demo user theo role, không có password verification. Bất kỳ ai cũng có thể đăng nhập với bất kỳ role nào. |
| C2 | [`src/data/mockData.js`](../src/data/mockData.js) | **Hardcoded users với role admin** | 🔴 Critical | 15 users hardcode trong code, bao gồm admin account. Dữ liệu demo này sẽ bị deploy lên production. |
| C3 | [`src/store/authStore.js`](../src/store/authStore.js:6) | **Import USERS từ mockData** | 🔴 Critical | `DEMO_ACCOUNTS` depend vào mockData — nếu mockData bị xóa, auth sẽ crash. |
| C4 | [`src/utils/permissions.js`](../src/utils/permissions.js) | **4 roles cũ — không match với plan mới** | 🔴 Critical | Vẫn dùng `president`, `leader` — cần cập nhật thành `super_admin`, `admin`, `manager`, `member`. |

---

## 🟠 High Findings

| # | File | Vấn đề | Severity | Mô tả |
|---|------|--------|:--------:|-------|
| H1 | [`src/store/taskStore.js`](../src/store/taskStore.js:11) | **Fallback to mockData** | 🟠 High | `loadTasks()` fallback về `TASKS` từ mockData — dữ liệu demo sẽ hiển thị nếu localStorage trống. |
| H2 | [`src/store/memberStore.js`](../src/store/memberStore.js:7) | **Fallback to mockData** | 🟠 High | Tương tự — `loadMembers()` và `loadDepts()` fallback về mockData. |
| H3 | [`src/store/taskStore.js`](../src/store/taskStore.js:80) | **Supabase sync không có error handling** | 🟠 High | `supabase.from(TABLES.TASKS).upsert(toRow(newTask))` — không có `.then()/.catch()`, lỗi bị nuốt. |
| H4 | [`src/store/memberStore.js`](../src/store/memberStore.js:69) | **Supabase sync không có error handling** | 🟠 High | Tương tự — mọi Supabase call đều fire-and-forget không có error handling. |
| H5 | [`src/pages/Settings/SettingsPage.jsx`](../src/pages/Settings/SettingsPage.jsx) | **Cloud Sync section cần xóa** | 🟠 High | Có `handleTestConnection`, `handleAutoSetup`, `handleSyncToCloud` — cần xóa theo plan. |
| H6 | [`src/store/authStore.js`](../src/store/authStore.js:44) | **Empty catch block** | 🟠 High | `catch { /* ignore invalid data */ }` — nuốt lỗi parse JSON, không log. |

---

## 🟡 Medium Findings

| # | File | Vấn đề | Severity | Mô tả |
|---|------|--------|:--------:|-------|
| M1 | [`src/store/taskStore.js`](../src/store/taskStore.js:48) | **JSON.parse trong render** | 🟡 Medium | `typeof row.comments === 'string' ? JSON.parse(row.comments)` — có thể throw nếu JSON invalid. |
| M2 | [`src/store/taskStore.js`](../src/store/taskStore.js:187) | **Empty catch trong storage listener** | 🟡 Medium | `catch { /* ignore */ }` — nuốt lỗi. |
| M3 | [`src/store/memberStore.js`](../src/store/memberStore.js:156) | **Empty catch trong storage listener** | 🟡 Medium | Tương tự. |
| M4 | [`src/store/eventStore.js`](../src/store/eventStore.js) | **INITIAL_EVENTS hardcode** | 🟡 Medium | 3 events hardcode — cần xóa. |
| M5 | [`src/store/activityStore.js`](../src/store/activityStore.js) | **Seed activities hardcode** | 🟡 Medium | 4 activities hardcode — cần xóa. |
| M6 | [`src/constants.js`](../src/constants.js:62) | **ROLES không match plan** | 🟡 Medium | Vẫn dùng `ADMIN`, `PRESIDENT`, `LEADER`, `MEMBER` — cần cập nhật. |
| M7 | [`src/utils/permissions.js`](../src/utils/permissions.js:8) | **PERMISSIONS dùng array thay vì object** | 🟡 Medium | `VIEW_CLUB_DASHBOARD: [ROLES.ADMIN, ROLES.PRESIDENT]` — khó mở rộng, không có scope. |
| M8 | [`src/services/supabase.js`](../src/services/supabase.js:113) | **Empty catch trong autoSetupTables** | 🟡 Medium | `catch { /* individual statement may fail */ }` — nuốt lỗi. |

---

## 🟢 Low Findings

| # | File | Vấn đề | Severity | Mô tả |
|---|------|--------|:--------:|-------|
| L1 | [`src/store/taskStore.js`](../src/store/taskStore.js:68) | **ID generation bằng Date.now()** | 🟢 Low | `id: \`t-${Date.now()}\`` — có thể trùng nếu tạo 2 task cùng lúc. Nên dùng `crypto.randomUUID()`. |
| L2 | [`src/store/memberStore.js`](../src/store/memberStore.js:67) | **ID generation bằng Date.now()** | 🟢 Low | Tương tự. |
| L3 | [`src/store/eventStore.js`](../src/store/eventStore.js) | **ID generation bằng Date.now()** | 🟢 Low | Tương tự. |
| L4 | [`src/index.css`](../src/index.css) | **File quá lớn (1270 dòng)** | 🟢 Low | Nên chia thành nhiều file CSS theo component. |
| L5 | [`src/data/mockData.js`](../src/data/mockData.js) | **Helper functions nên tách riêng** | 🟢 Low | `getDepartmentById`, `getUserById` nên ở `src/utils/helpers.js`. |

---

## 📐 SOLID Principles Analysis

### S — Single Responsibility Principle

| Vi phạm | File | Mô tả |
|---------|------|-------|
| 🟠 | [`src/store/taskStore.js`](../src/store/taskStore.js) | Store vừa quản lý state, vừa gọi Supabase, vừa convert data format. Nên tách: Store (state) + Repository (data access) + Mapper (convert). |
| 🟠 | [`src/store/memberStore.js`](../src/store/memberStore.js) | Tương tự — quản lý cả members và departments trong 1 store. |
| 🟡 | [`src/pages/Settings/SettingsPage.jsx`](../src/pages/Settings/SettingsPage.jsx) | Vừa quản lý departments, vừa Cloud Sync, vừa import/export, vừa reset data. |

### O — Open/Closed Principle

| Vi phạm | File | Mô tả |
|---------|------|-------|
| 🟡 | [`src/utils/permissions.js`](../src/utils/permissions.js) | Thêm role mới phải sửa cả `PERMISSIONS` object. Nên dùng config-driven approach. |
| 🟢 | [`src/store/authStore.js`](../src/store/authStore.js) | `DEMO_ACCOUNTS` hardcode — không mở rộng được. |

### L — Liskov Substitution Principle

| Vi phạm | Mô tả |
|---------|-------|
| ✅ Không vi phạm | Không có class inheritance phức tạp. |

### I — Interface Segregation Principle

| Vi phạm | File | Mô tả |
|---------|------|-------|
| 🟡 | [`src/store/taskStore.js`](../src/store/taskStore.js) | Store expose quá nhiều methods — component chỉ cần `getTasks()` nhưng phải import cả store. |

### D — Dependency Inversion Principle

| Vi phạm | File | Mô tả |
|---------|------|-------|
| 🟠 | [`src/store/taskStore.js`](../src/store/taskStore.js) | Direct import `supabase` client — nên abstract qua service layer. |
| 🟠 | [`src/store/memberStore.js`](../src/store/memberStore.js) | Tương tự — direct dependency vào Supabase. |
| 🟡 | [`src/store/authStore.js`](../src/store/authStore.js) | Direct import `USERS` từ mockData — tight coupling. |

---

## 🛡️ Security Vulnerabilities

| # | Vulnerability | Severity | Mô tả | Mitigation |
|---|--------------|:--------:|-------|-----------|
| S1 | **No real authentication** | 🔴 Critical | Bất kỳ ai cũng có thể đăng nhập bằng cách chọn role card | Implement Firebase Auth |
| S2 | **No password hashing** | 🔴 Critical | Không có password — demo mode hoàn toàn | Firebase Auth xử lý |
| S3 | **No input sanitization** | 🟠 High | Không có XSS protection trên user inputs | Thêm `sanitizeInput()` |
| S4 | **No CSP headers** | 🟠 High | Không có Content Security Policy | Thêm CSP meta tag |
| S5 | **No rate limiting** | 🟡 Medium | Không giới hạn số lần đăng nhập | Firebase Auth tự xử lý |
| S6 | **localStorage data visible** | 🟡 Medium | Mọi data đều có thể xem/ sửa từ DevTools | Migrate sang Firestore |
| S7 | **No HTTPS enforcement** | 🟢 Low | Không redirect HTTP → HTTPS | Firebase Hosting tự xử lý |

---

## ⚡ Performance Issues

| # | Issue | Severity | File | Mô tả |
|---|-------|:--------:|------|-------|
| P1 | **Load all data on init** | 🟡 Medium | All stores | `loadTasks()`, `loadMembers()` load toàn bộ data vào memory — không pagination. |
| P2 | **No virtualization** | 🟡 Medium | Lists | Không dùng windowing cho lists lớn — có thể lag với > 100 items. |
| P3 | **Re-render cascade** | 🟢 Low | Stores | Thay đổi 1 task → toàn bộ component subscribe taskStore re-render. |
| P4 | **No debouncing** | 🟢 Low | Search | Search input không debounce — mỗi keystroke trigger filter. |

---

## 🧪 Test Coverage

| Module | Có test? | Coverage | Đánh giá |
|--------|:--------:|:--------:|----------|
| `constants.js` | ✅ | ~90% | 🟢 Tốt |
| `permissions.js` | ✅ | ~80% | 🟢 Tốt |
| `validation.js` | ✅ | ~70% | 🟡 Trung bình |
| `authStore.js` | ❌ | 0% | 🔴 Cần thêm |
| `taskStore.js` | ❌ | 0% | 🔴 Cần thêm |
| `memberStore.js` | ❌ | 0% | 🔴 Cần thêm |
| Components | ✅ | ~30% | 🟡 Cần thêm |
| Integration | ❌ | 0% | 🔴 Cần thêm |

---

## 🏆 Kết luận & Khuyến nghị

### Ưu tiên cao (phải làm ngay)

1. **Implement Firebase Auth** — Thay thế demo auth bằng Firebase Authentication
2. **Xóa demo data** — Remove tất cả mockData, hardcode data
3. **Cập nhật roles** — Chuyển từ 4 roles cũ sang 4 roles mới (xem [`RBAC.md`](RBAC.md))
4. **Thêm Firestore Rules** — Server-side security enforcement
5. **Error handling** — Thay thế empty catches bằng proper error handling

### Ưu tiên trung bình (nên làm)

6. **Tách store responsibilities** — Store chỉ quản lý state, tách data access
7. **Thêm input sanitization** — XSS prevention
8. **Thêm CSP headers** — Content Security Policy
9. **Cải thiện test coverage** — Target > 80% cho core modules
10. **Pagination** — Không load toàn bộ data vào memory

### Ưu tiên thấp (có thể làm sau)

11. **Virtualization** cho lists lớn
12. **Debouncing** cho search
13. **Chia nhỏ CSS** thành nhiều files
14. **ID generation** dùng `crypto.randomUUID()`

---

> **Kế hoạch khắc phục:** Tất cả các findings trên sẽ được giải quyết trong quá trình implement theo [`07-deployment-testing.md`](07-deployment-testing.md) — 7 phases, 12 weeks.
