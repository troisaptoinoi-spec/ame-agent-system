# ⚠️ File này đã được chia nhỏ & refactor sang Firebase

> **File này không còn được bảo trì.** Nội dung đã được refactor hoàn toàn sang kiến trúc **Firebase Online-First**.

---

## Cấu trúc Plans (Firebase Architecture)

| File | Nội dung |
|------|----------|
| [`RBAC.md`](RBAC.md) | 🔐 Phân quyền — Firebase Auth Custom Claims + Firestore Security Rules |
| [`01-overview.md`](01-overview.md) | 🏗️ Tổng quan kiến trúc Firebase (layers, tech stack, state management) |
| [`02-auth-system.md`](02-auth-system.md) | 🔐 Firebase Auth (register, login, logout, forgot password, Cloud Functions) |
| [`03-data-model.md`](03-data-model.md) | 📊 Firestore Collections (9 collections), Storage structure, security rules |
| [`04-features-modules.md`](04-features-modules.md) | 🧩 8 modules với Firebase SDK trực tiếp |
| [`05-api-design.md`](05-api-design.md) | 🔌 Firebase SDK pattern — không REST API, Firestore → Zustand |
| [`06-ui-components.md`](06-ui-components.md) | 🎨 Component tree, routing, design system, a11y |
| [`07-deployment-testing.md`](07-deployment-testing.md) | 🚀 Firebase Hosting, CI/CD, 7 phases/12 weeks, ~67 files |

---

## Thay đổi chính so với phiên bản cũ

| Thay đổi | Cũ (localStorage/Supabase) | Mới (Firebase) |
|----------|---------------------------|----------------|
| **Backend** | localStorage + optional Supabase | Firebase Auth + Firestore + Storage |
| **Authentication** | Demo role selection | Firebase Auth (email/password) |
| **Database** | localStorage JSON | Cloud Firestore (realtime) |
| **File Storage** | localStorage base64 | Firebase Storage (CDN) |
| **Security** | Client-side only | Firestore Rules + Custom Claims |
| **Hosting** | Vercel | Firebase Hosting |
| **Offline** | Offline-first | Online-only |
| **Sync** | Manual localStorage + Supabase | Firestore onSnapshot (automatic) |
| **Roles** | 4 roles (localStorage) | 4 roles (Custom Claims) |
| **Viewer role** | ❌ Đã xóa | ❌ Đã xóa |

---

> **Lưu ý RBAC:** Role `viewer` đã bị xóa. Hệ thống chỉ có 4 roles: `super_admin`, `admin`, `manager`, `member`. Xem [`RBAC.md`](RBAC.md) cho bảng quyền đầy đủ.
