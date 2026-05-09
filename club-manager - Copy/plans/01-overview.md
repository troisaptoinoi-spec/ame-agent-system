# 🏗️ Phần 1: Tổng quan Kiến trúc Hệ thống (Firebase)

> **Mục đích:** Tài liệu kiến trúc chi tiết cho hệ thống quản lý CLB production-grade, online-first với Firebase.
>
> **Tech Stack:** React 19, Zustand 5, react-router-dom 7, Firebase 11 (Auth + Firestore + Storage + Hosting), Vite 8, Vitest, i18next, recharts, @dnd-kit, dayjs

---

## 1.1 Sơ đồ Kiến trúc Tổng thể

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ LoginPage│ │Dashboard │ │ TasksPage│ │MembersPage│ │ AdminPage│ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ │
│       │             │            │             │             │       │
│  ┌────┴─────────────┴────────────┴─────────────┴─────────────┴────┐ │
│  │                    AppLayout + Route Guards                    │ │
│  └────────────────────────────┬───────────────────────────────────┘ │
├───────────────────────────────┼─────────────────────────────────────┤
│                        BUSINESS LOGIC LAYER                        │
│  ┌────────────────────────────┴───────────────────────────────────┐ │
│  │                     Zustand Store Layer                        │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │ │
│  │  │authStore │ │taskStore │ │memberStore│ │eventStore│         │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘         │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │ │
│  │  │activitySt│ │dialogStore│ │toastStore│ │ uiStore  │         │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘         │ │
│  └────────────────────────────┬───────────────────────────────────┘ │
│  ┌────────────────────────────┴───────────────────────────────────┐ │
│  │                     Service Layer                              │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │ │
│  │  │ firebase.js  │ │ auditService │ │ notifService │           │ │
│  │  └──────────────┘ └──────────────┘ └──────────────┘           │ │
│  └────────────────────────────┬───────────────────────────────────┘ │
├───────────────────────────────┼─────────────────────────────────────┤
│                        DATA ACCESS LAYER                           │
│  ┌────────────────────────────┴───────────────────────────────────┐ │
│  │                   Firebase SDK (Direct)                        │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │ │
│  │  │ Firebase Auth │ │ Cloud Firestore│ │Firebase Storage│        │ │
│  │  │ (Authentication)│ │ (Database)   │ │ (File Uploads)│        │ │
│  │  └──────────────┘ └──────────────┘ └──────────────┘           │ │
│  └────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│                        INFRASTRUCTURE LAYER                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────┐ │
│  │Firebase Hosting│ │Cloud Functions│ │ Error Logger │ │ CSP/Sec   │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 1.2 Các Layer của Hệ thống

| Layer | Trách nhiệm | Công nghệ |
|-------|-------------|-----------|
| **Presentation** | UI components, routing, form handling, animations | React 19, react-router-dom 7, CSS custom properties |
| **Business Logic** | State management, business rules, validation | Zustand 5 stores, custom hooks |
| **Service** | Firebase config, audit, notifications | Service modules (plain JS) |
| **Data Access** | Firebase SDK gọi trực tiếp — không cache offline | Firebase Auth, Firestore, Storage |
| **Infrastructure** | Hosting, Cloud Functions, security | Firebase Hosting, Firebase Functions |

---

## 1.3 Lựa chọn Công nghệ và Lý do

| Quyết định | Lựa chọn | Lý do | Alternatives bị từ chối |
|------------|----------|-------|------------------------|
| **Framework** | React 19 | Đã có trong project, ecosystem lớn | Vue 3, Svelte |
| **State Management** | Zustand 5 | Nhẹ, đơn giản, đã dùng | Redux Toolkit (quá nặng) |
| **Backend** | Firebase (Auth + Firestore + Storage + Hosting) | Free tier, realtime, không cần server | Supabase (đã có nhưng cần migration), custom backend |
| **Authentication** | Firebase Auth | Built-in, email/password, custom claims, free | Supabase Auth, custom JWT |
| **Database** | Cloud Firestore | Realtime listeners, offline-free mode, scalable | Supabase PostgreSQL, MongoDB Atlas |
| **File Storage** | Firebase Storage | Tích hợp Firebase, CDN, security rules | Supabase Storage, AWS S3 |
| **Hosting** | Firebase Hosting | CDN global, SSL free, deploy CLI | Vercel (đã có), Netlify |
| **Cloud Functions** | Firebase Functions (Node.js) | Tích hợp Firebase, set custom claims | AWS Lambda, Vercel Functions |
| **Build Tool** | Vite 8 | Nhanh, HMR tốt | Webpack |
| **Testing** | Vitest + Testing Library | Tương thích Vite | Jest |
| **i18n** | i18next + react-i18next | Đã tích hợp | react-intl |
| **Charts** | Recharts | Đã có | Chart.js, D3 |
| **Drag & Drop** | @dnd-kit | Đã có, accessible | react-beautiful-dnd |

---

## 1.4 Kiến trúc State Management

```
┌─────────────────────────────────────────────────────────┐
│                    Zustand Store Architecture            │
│                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │  authStore   │    │  taskStore   │    │ memberStore │ │
│  │             │    │             │    │             │ │
│  │ currentUser │    │ tasks[]     │    │ members[]   │ │
│  │ session     │    │ filters     │    │ departments[]│ │
│  │ isAuthenticated│ │ sortBy      │    │ filters     │ │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘ │
│         │                  │                  │         │
│  ┌──────┴──────────────────┴──────────────────┴──────┐ │
│  │              Firebase SDK Layer                     │ │
│  │  ┌──────────────┐  ┌──────────────┐               │ │
│  │  │ Firestore    │  │ Firebase Auth│               │ │
│  │  │ onSnapshot   │  │ onAuthState  │               │ │
│  │  │ listeners    │  │ Changed      │               │ │
│  │  └──────────────┘  └──────────────┘               │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │ eventStore   │    │activityStore│    │  uiStore    │ │
│  └─────────────┘    └─────────────┘    │ theme       │ │
│                                         │ language    │ │
│  ┌─────────────┐    ┌─────────────┐    └─────────────┘ │
│  │ dialogStore  │    │ toastStore  │                    │
│  └─────────────┘    └─────────────┘    ┌─────────────┐ │
│                                         │ profileStore│ │
│                                         └─────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Chiến lược Data Flow:**

| Store | Data Source | Strategy | Lý do |
|-------|-----------|----------|-------|
| `authStore` | Firebase Auth | `onAuthStateChanged` listener | Realtime auth state |
| `taskStore` | Firestore | `onSnapshot` listener | Realtime sync đa thiết bị |
| `memberStore` | Firestore | `onSnapshot` listener | Realtime sync đa thiết bị |
| `eventStore` | Firestore | `onSnapshot` listener | Realtime sync đa thiết bị |
| `activityStore` | Firestore | `onSnapshot` listener | Realtime audit trail |
| `uiStore` | localStorage | Zustand persist middleware | Preferences cá nhân (theme, language) |
| `dialogStore` | Không | In-memory only | UI state tạm thời |
| `toastStore` | Không | In-memory only | UI state tạm thời |
| `profileStore` | Không | In-memory only | UI state tạm thời |

**Data Flow Pattern:**

```javascript
// Pattern: Firestore onSnapshot → Zustand store
// Không dùng localStorage cho data, chỉ dùng cho UI preferences

import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';

// Trong store init:
const unsubscribe = onSnapshot(
  collection(db, 'tasks'),
  (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    set({ tasks });
  },
  (error) => {
    console.error('[Tasks] Firestore listener error:', error);
    set({ error: error.message });
  }
);

// Cleanup khi unmount
return () => unsubscribe();
```

---

## 1.5 Tại sao Online-First (không Offline)?

| Lý do | Giải thích |
|-------|-----------|
| **Realtime sync** | Firestore `onSnapshot` tự động đồng bộ đa thiết bị |
| **Đơn giản hơn** | Không cần sync queue, conflict resolution, merge logic |
| **Bảo mật** | Firestore Rules kiểm soát server-side, không thể bypass |
| **Custom Claims** | Firebase Auth custom claims cần server-side, không thể offline |
| **Multi-device** | Dữ liệu luôn mới nhất trên mọi thiết bị |
| **Free tier đủ** | Firebase Spark plan: 1GB Firestore, 50K reads/ngày, 20K writes/ngày |

---

## 1.6 Quyết định Kiến trúc

| # | Quyết định | Lựa chọn | Alternatives bị từ chối | Lý do |
|---|------------|----------|------------------------|-------|
| Q1 | Backend | Firebase | Supabase (cần migration), custom Node.js backend | Free tier, realtime, không cần server management |
| Q2 | Roles | 4 roles (super_admin, admin, manager, member) | 2 roles (quá đơn giản), 5 roles (viewer không cần) | RBAC chi tiết |
| Q3 | Data flow | Firestore onSnapshot → Zustand | localStorage + sync (phức tạp), Redux + RTK Query (nặng) | Realtime, đơn giản |
| Q4 | File storage | Firebase Storage | localStorage base64 (quota), Supabase Storage | Tích hợp, CDN, security rules |
| Q5 | Hosting | Firebase Hosting | Vercel (đã có), Netlify | Tích hợp ecosystem Firebase |
| Q6 | Security | Firestore Rules + Custom Claims | Client-side only (không an toàn), RLS (Supabase) | Server-side enforcement |

---

> **Tham chiếu phân quyền:** Xem [`RBAC.md`](RBAC.md) cho bảng quyền chi tiết và Firestore Security Rules.
