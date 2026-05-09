# 🚀 InnoHub CLB Manager

> Hệ thống quản lý Câu lạc bộ Khởi nghiệp Đổi mới Sáng tạo — Quản lý thành viên, nhiệm vụ, sự kiện và bảng xếp hạng.

## ✨ Tính năng chính

| Tính năng | Mô tả |
|-----------|-------|
| 📊 **Dashboard** | Tổng quan CLB với thống kê, biểu đồ, hoạt động gần đây |
| 📋 **Quản lý nhiệm vụ** | Kanban board kéo thả, phân công, theo dõi tiến độ |
| 👥 **Quản lý thành viên** | Danh sách, hồ sơ, phân ban, xuất CSV |
| 📅 **Lịch sự kiện** | Calendar view, quản lý sự kiện, hiển thị deadline |
| 🏆 **Bảng xếp hạng** | Gamification với điểm thưởng, huy hiệu, xếp hạng |
| ✨ **Trợ lý AI** | Chatbot Gemini AI hỗ trợ quản lý CLB |
| 🔒 **Phân quyền RBAC** | 4 cấp: Admin, Chủ nhiệm, Trưởng ban, Thành viên |
| 🌐 **Đa ngôn ngữ** | Tiếng Việt / English |
| 🌙 **Dark/Light theme** | Chuyển đổi giao diện mượt mà |

## 🛠️ Công nghệ

- **Frontend:** React 19 + Vite 8
- **State Management:** Zustand 5
- **Routing:** React Router DOM 7
- **Charts:** Recharts 3
- **Drag & Drop:** @dnd-kit
- **AI:** Google Gemini API
- **i18n:** i18next + react-i18next
- **Testing:** Vitest 3 + @testing-library/react
- **Linting:** ESLint 10

## 🚀 Cài đặt

### Yêu cầu
- Node.js >= 18
- npm >= 9

### Bước 1: Clone và cài đặt
```bash
git clone <repository-url>
cd club-manager
npm install
```

### Bước 2: Chạy development server
```bash
npm run dev
```
Truy cập `http://localhost:5173`

### Bước 3: Cấu hình AI (tùy chọn)
1. Truy cập [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Tạo API Key miễn phí
3. Vào **Cài đặt** → Nhập API Key → Lưu

## 📜 Scripts

| Script | Mô tả |
|--------|-------|
| `npm run dev` | Chạy development server |
| `npm run build` | Build production |
| `npm run preview` | Preview production build |
| `npm test` | Chạy tests |
| `npm run test:watch` | Chạy tests (watch mode) |
| `npm run lint` | Kiểm tra code style |

## 🏗️ Cấu trúc dự án

```
src/
├── assets/              # Hình ảnh, icons
├── components/
│   ├── common/          # ErrorBoundary, Toast, ConfirmDialog, GlobalSearch, ProfileModal
│   └── layout/          # AppLayout (sidebar + header)
├── constants.js         # Hằng số toàn cục, localStorage keys, validation rules
├── data/
│   └── mockData.js      # Dữ liệu mẫu (departments, users, tasks, activities)
├── hooks/
│   └── useCountUp.js    # Custom hook animation số
├── i18n/                # Đa ngôn ngữ (vi.json, en.json)
├── pages/
│   ├── AI/              # Trợ lý AI (Gemini chatbot)
│   ├── Dashboard/       # Tổng quan CLB
│   ├── Events/          # Lịch sự kiện
│   ├── Leaderboard/     # Bảng xếp hạng
│   ├── Login/           # Đăng nhập (chọn vai trò demo)
│   ├── Members/         # Quản lý thành viên
│   ├── Profile/         # Hồ sơ cá nhân
│   ├── Settings/        # Cài đặt hệ thống
│   └── Tasks/           # Quản lý nhiệm vụ (Kanban)
├── services/
│   └── aiService.js     # Gemini AI integration
├── store/               # Zustand stores
│   ├── activityStore.js # Hoạt động gần đây
│   ├── authStore.js     # Xác thực
│   ├── chatStore.js     # Chat
│   ├── dialogStore.js   # Confirm dialog
│   ├── eventStore.js    # Sự kiện
│   ├── memberStore.js   # Thành viên & phòng ban
│   ├── profileStore.js  # Hồ sơ xem trước
│   ├── taskStore.js     # Nhiệm vụ
│   ├── toastStore.js    # Thông báo
│   └── uiStore.js       # Theme, language, sidebar
├── test/                # Tests (Vitest)
│   ├── basic.test.js
│   ├── constants.test.js
│   ├── permissions.test.js
│   └── validation.test.js
└── utils/
    ├── exportUtils.js   # Xuất CSV/JSON
    ├── permissions.js   # RBAC phân quyền
    └── validation.js    # Input validation
```

## 🔒 Phân quyền (RBAC)

| Quyền | Admin | Chủ nhiệm | Trưởng ban | Thành viên |
|-------|:-----:|:---------:|:----------:|:----------:|
| Xem Dashboard CLB | ✅ | ✅ | ❌ | ❌ |
| Xem Dashboard Ban | ✅ | ✅ | ✅ | ❌ |
| Tạo nhiệm vụ | ✅ | ✅ | ✅ | ❌ |
| Sửa mọi nhiệm vụ | ✅ | ✅ | ❌ | ❌ |
| Sửa nhiệm vụ ban | ✅ | ✅ | ✅ | ❌ |
| Xóa nhiệm vụ | ✅ | ✅ | ❌ | ❌ |
| Duyệt nhiệm vụ | ✅ | ✅ | ✅ | ❌ |
| Thêm thành viên | ✅ | ✅ | ❌ | ❌ |
| Xóa thành viên | ✅ | ❌ | ❌ | ❌ |
| Quản lý cài đặt | ✅ | ❌ | ❌ | ❌ |

## 🧪 Testing

```bash
# Chạy tất cả tests
npm test

# Chạy tests (watch mode)
npm run test:watch

# Chạy tests với coverage
npm run test:coverage
```

**Test coverage hiện tại:** 60 tests
- `permissions.test.js` — 11 tests (RBAC logic)
- `validation.test.js` — 31 tests (input validation, sanitize)
- `constants.test.js` — 17 tests (constants integrity)
- `basic.test.js` — 1 test (vitest sanity)

## 📦 Build & Deploy

```bash
# Build production
npm run build

# Preview build locally
npm run preview
```

Output sẽ nằm trong thư mục `dist/`.

## 🎯 Cấu trúc tổ chức CLB

| Ban | Trưởng ban | Thành viên |
|-----|-----------|------------|
| ✍️ Ban Nội dung | Lê Minh Khoa | 3 thành viên |
| 💻 Ban Kỹ thuật | Võ Đức Thắng | 2 thành viên |
| 📣 Ban Marketing | Hoàng Văn Bình | 2 thành viên |
| 👥 Ban Nhân sự | Bùi Thị Hoa | 2 thành viên |

## 📄 License

Private — Dành cho nội bộ CLB InnoHub.
