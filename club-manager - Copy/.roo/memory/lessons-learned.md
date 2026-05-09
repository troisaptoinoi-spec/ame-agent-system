# Lessons Learned — InnoHub CLB Manager

## 2026-05-08: Firebase Migration Session

### Architecture Decisions
1. **Firebase Spark Plan (Free)** — Không cần Blaze, không cần credit card
2. **Firestore Document cho role** — Không dùng Custom Claims (cần Cloud Functions)
3. **Cloudinary thay Firebase Storage** — Miễn phí 25GB, không cần Blaze
4. **4 roles:** super_admin, admin, manager, member (bỏ viewer, president, leader)

### Key Patterns
- **`currentUser` trong authStore** = Firestore user document (có role, name, departmentId)
- **Stores dùng `onSnapshot`** — realtime sync đa thiết bị
- **`subscribe()` pattern** — gọi trong AppLayout useEffect, cleanup khi unmount
- **Permissions check** — `can(userProfile, 'PERMISSION_NAME')` từ `permissions.js`

### Files Structure (Post-Migration)
```
src/services/
├── firebase.js        # Firebase config, init
├── authService.js     # Auth logic (register, login, logout, seedAdmin)
└── cloudinary.js      # File uploads

src/store/
├── authStore.js       # currentUser = Firestore profile
├── taskStore.js       # Firestore onSnapshot
├── memberStore.js     # Firestore onSnapshot (users + departments)
├── eventStore.js      # Firestore onSnapshot
├── activityStore.js   # Firestore onSnapshot
├── dialogStore.js     # In-memory (confirm dialog)
├── toastStore.js      # In-memory (toast notifications)
├── profileStore.js    # In-memory (profile modal)
└── uiStore.js         # localStorage (theme, language)
```

### Firebase Config
- **Project:** innohub-clb-manager
- **Region:** asia-southeast1
- **Auth:** Email/Password
- **Rules:** Đọc role từ Firestore document (không cần Custom Claims)

### Next Steps
1. Deploy Firestore Rules qua Firebase Console
2. Thêm features: Finance, Documents, Notifications
3. Deploy lên Firebase Hosting hoặc Vercel
4. Thêm tests cho Firebase integration
