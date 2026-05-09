# Error Log — InnoHub CLB Manager

## 2026-05-08: Firebase Migration

### Error 1: Firebase Emulator Connection
- **Symptom:** "Lỗi kết nối mạng" khi đăng nhập
- **Root cause:** `firebase.js` đang kết nối Firebase Emulator (`localhost:9099`) trong dev mode, nhưng emulator không chạy
- **Fix:** Comment out emulator connection code, dùng Firebase thật
- **File:** `src/services/firebase.js:34-42`
- **Lesson:** Luôn kiểm tra emulator config khi migrate sang Firebase mới

### Error 2: Hardcoded Roles Cũ
- **Symptom:** UI hiển thị sai role labels (president, leader)
- **Root cause:** Các pages vẫn dùng role strings cũ (`president`, `leader`) sau khi đổi sang roles mới (`super_admin`, `admin`, `manager`, `member`)
- **Fix:** Tìm và thay thế tất cả hardcoded role strings trong codebase
- **Files:** EventsPage, MembersPage, DashboardPage, debug.js
- **Lesson:** Khi đổi role system, cần search toàn bộ codebase cho role strings

### Error 3: currentUser vs userProfile Confusion
- **Symptom:** `currentUser.role` là `undefined` vì currentUser là Firebase Auth object
- **Root cause:** Firebase Auth object chỉ có `uid`, `email` — không có `role`, `name`, `departmentId`
- **Fix:** Đổi `currentUser` trong authStore để chứa Firestore profile document (có đầy đủ fields)
- **File:** `src/store/authStore.js`
- **Lesson:** Firebase Auth object ≠ Firestore user document. Cần merge hoặc alias

### Error 4: Firebase CLI Authentication
- **Symptom:** `firebase deploy` fails — "No currently active project" / "Failed to authenticate"
- **Root cause:** Firebase CLI chưa login hoặc chưa link project
- **Fix:** Deploy rules qua Firebase Console thay vì CLI
- **Lesson:** Trong môi trường không interactive, dùng Firebase Console thay vì CLI
