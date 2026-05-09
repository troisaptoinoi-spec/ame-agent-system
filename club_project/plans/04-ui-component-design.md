# 🎨 UI/UX & Component Architecture - CLB Khởi Nghiệp

## 📋 Mục Lục

1. [Design System](#1-design-system)
2. [Layout Architecture](#2-layout-architecture)
3. [Component Hierarchy](#3-component-hierarchy)
4. [Page Designs](#4-page-designs)
5. [Responsive Strategy](#5-responsive-strategy)
6. [i18n Architecture](#6-i18n-architecture)
7. [Theme System](#7-theme-system)

---

## 1. Design System

### 1.1 Color Palette

```mermaid
graph LR
    subgraph Light[Light Mode]
        L1[Primary: #6366f1 - Indigo]
        L2[Secondary: #10b981 - Emerald]
        L3[Accent: #f59e0b - Amber]
        L4[Danger: #ef4444 - Red]
        L5[Background: #ffffff]
        L6[Surface: #f8fafc]
        L7[Text: #0f172a]
        L8[Muted: #64748b]
    end

    subgraph Dark[Dark Mode]
        D1[Primary: #818cf8 - Indigo Light]
        D2[Secondary: #34d399 - Emerald Light]
        D3[Accent: #fbbf24 - Amber Light]
        D4[Danger: #f87171 - Red Light]
        D5[Background: #0f172a]
        D6[Surface: #1e293b]
        D7[Text: #f1f5f9]
        D8[Muted: #94a3b8]
    end
```

### 1.2 Typography

| Element | Font | Size | Weight | Usage |
|---------|------|------|--------|-------|
| H1 | Inter | 2rem (32px) | 700 | Page titles |
| H2 | Inter | 1.5rem (24px) | 600 | Section headers |
| H3 | Inter | 1.25rem (20px) | 600 | Card titles |
| Body | Inter | 0.875rem (14px) | 400 | Default text |
| Small | Inter | 0.75rem (12px) | 400 | Labels, captions |
| Mono | JetBrains Mono | 0.875rem | 400 | Code, IDs |

### 1.3 Spacing & Layout Tokens

```
Spacing scale: 4px base unit
  xs: 4px | sm: 8px | md: 16px | lg: 24px | xl: 32px | 2xl: 48px

Border radius:
  sm: 4px | md: 8px | lg: 12px | xl: 16px | full: 9999px

Shadows:
  sm: 0 1px 2px rgba(0,0,0,0.05)
  md: 0 4px 6px rgba(0,0,0,0.07)
  lg: 0 10px 15px rgba(0,0,0,0.1)
  xl: 0 20px 25px rgba(0,0,0,0.15)

Breakpoints:
  sm: 640px | md: 768px | lg: 1024px | xl: 1280px | 2xl: 1536px
```

### 1.4 Component Library (shadcn/ui)

| Component | Usage | Customization |
|-----------|-------|---------------|
| `Button` | Actions, form submit | Variants: primary, secondary, ghost, danger |
| `Card` | Dashboard stats, task cards | With header, content, footer slots |
| `Dialog` | Task detail, confirm actions | Modal + Sheet variants |
| `DropdownMenu` | User menu, action menus | With icons and shortcuts |
| `Table` | Member list, leaderboard | Sortable, filterable |
| `Tabs` | Dashboard sections, settings | Underline style |
| `Badge` | Status, priority, tags | Color-coded |
| `Avatar` | User avatars | With fallback initials |
| `Input` | Forms | With validation states |
| `Select` | Filters, dropdowns | Searchable variant |
| `Toast` | Notifications | Success, error, info |
| `Skeleton` | Loading states | Per-component skeletons |
| `Tooltip` | Help text, shortcuts | Delay: 300ms |
| `Command` | Search, quick actions | Cmd+K palette |
| `Sheet` | Mobile sidebar, detail panel | Left, right, bottom |

---

## 2. Layout Architecture

### 2.1 Root Layout Structure

```mermaid
graph TB
    subgraph RootLayout[Root Layout]
        direction TB
        subgraph AuthLayout[Auth Layout - /login, /register]
            AUTH_CENTER[Centered Card]
        end

        subgraph DashboardLayout[Dashboard Layout - /dashboard/*]
            direction LR
            SIDEBAR[Sidebar Navigation]
            subgraph Main[Main Content Area]
                HEADER[Top Header Bar]
                CONTENT[Page Content]
            end
        end
    end
```

### 2.2 Dashboard Layout Detail

```mermaid
graph TB
    subgraph DashboardLayout[Dashboard Layout]
        direction LR

        subgraph Sidebar[Sidebar - 280px]
            LOGO[CLB Logo + Name]
            NAV[Navigation Menu]
            subgraph NavItems[Nav Items by Role]
                NI1[Dashboard]
                NI2[Tasks / Kanban]
                NI3[Members]
                NI4[Departments]
                NI5[Leaderboard]
                NI6[Reports]
                NI7[Settings]
            end
            USER_CARD[User Card - Bottom]
        end

        subgraph MainArea[Main Area - Flex 1]
            direction TB
            subgraph Header[Header Bar - 64px]
                H_LEFT[Breadcrumb / Page Title]
                H_RIGHT[Search + Notifications + Theme + Language + User Menu]
            end
            subgraph Content[Content Area - Scrollable]
                PAGE[Page Content]
            end
        end
    end
```

### 2.3 Sidebar Navigation Items by Role

```mermaid
graph LR
    subgraph AdminNav[Admin Navigation]
        A1[🏠 Dashboard Tổng]
        A2[📋 Nhiệm vụ]
        A3[👥 Thành viên]
        A4[🏢 Ban chuyên môn]
        A5[🏆 Bảng xếp hạng]
        A6[📊 Báo cáo]
        A7[📝 Nhật ký hệ thống]
        A8[⚙️ Cấu hình]
    end

    subgraph ChairmanNav[Chủ nhiệm Navigation]
        C1[🏠 Dashboard CLB]
        C2[📋 Nhiệm vụ]
        C3[👥 Thành viên]
        C4[🏢 Ban chuyên môn]
        C5[🏆 Bảng xếp hạng]
        C6[📊 Báo cáo]
        C7[📝 Nhật ký hoạt động]
    end

    subgraph LeaderNav[Trưởng ban Navigation]
        L1[🏠 Dashboard ban]
        L2[📋 Nhiệm vụ ban]
        L3[👥 Thành viên ban]
        L4[🏆 Bảng xếp hạng]
        L5[📊 Báo cáo ban]
    end

    subgraph MemberNav[Thành viên Navigation]
        M1[🏠 Tổng quan cá nhân]
        M2[📋 Nhiệm vụ của tôi]
        M3[🏆 Bảng xếp hạng]
        M4[👤 Hồ sơ]
    end
```

### 2.4 Mobile Layout

```mermaid
graph TB
    subgraph MobileLayout[Mobile Layout - < 768px]
        direction TB
        M_HEADER[Mobile Header - 56px]
        M_CONTENT[Content Area]
        M_BOTTOM[Bottom Tab Bar - 56px]

        subgraph MobileHeader[Header]
            MH_LEFT[Hamburger Menu]
            MH_CENTER[Page Title]
            MH_RIGHT[User Avatar]
        end

        subgraph BottomTabs[Bottom Tabs]
            BT1[🏠 Home]
            BT2[📋 Tasks]
            BT3[➕ Quick Add]
            BT4[🏆 Rank]
            BT5[👤 Profile]
        end
    end
```

---

## 3. Component Hierarchy

### 3.1 Component Tree

```
App
├── Providers
│   ├── ThemeProvider (next-themes)
│   ├── IntlProvider (next-intl)
│   ├── AuthProvider (NextAuth SessionProvider)
│   ├── QueryProvider (TanStack QueryClientProvider)
│   └── SocketProvider (Socket.io context)
│
├── Layout
│   ├── AuthLayout
│   │   └── AuthCard
│   │
│   └── DashboardLayout
│       ├── Sidebar
│       │   ├── Logo
│       │   ├── NavMenu
│       │   │   ├── NavItem (role-based)
│       │   │   └── NavGroup
│       │   ├── UserCard
│       │   └── CollapseToggle
│       │
│       ├── Header
│       │   ├── Breadcrumb
│       │   ├── SearchCommand (Cmd+K)
│       │   ├── NotificationBell
│       │   ├── ThemeToggle
│       │   ├── LanguageSwitch
│       │   └── UserDropdown
│       │
│       └── Content (children)
│
├── Pages
│   ├── Dashboard
│   │   ├── StatsGrid
│   │   │   └── StatsCard (x4-6)
│   │   ├── TaskOverviewChart
│   │   ├── DepartmentProgressChart
│   │   ├── RecentActivityFeed
│   │   ├── UpcomingDeadlines
│   │   └── TopPerformers
│   │
│   ├── KanbanBoard
│   │   ├── KanbanToolbar
│   │   │   ├── FilterBar
│   │   │   ├── ViewToggle
│   │   │   └── CreateTaskButton
│   │   ├── KanbanContainer (DnD)
│   │   │   └── KanbanColumn (x4)
│   │   │       ├── ColumnHeader
│   │   │       └── KanbanCard (n)
│   │   │           ├── CardHeader
│   │   │           ├── CardBadges
│   │   │           ├── CardAssignees
│   │   │           └── CardFooter
│   │   └── TaskDetailSheet
│   │       ├── TaskHeader
│   │       ├── TaskDescription
│   │       ├── TaskMeta
│   │       ├── AssigneeSelector
│   │       ├── CommentSection
│   │       │   ├── CommentList
│   │       │   │   └── CommentItem
│   │       │   └── CommentInput
│   │       └── AttachmentList
│   │
│   ├── Members
│   │   ├── MemberToolbar
│   │   │   ├── SearchInput
│   │   │   ├── DepartmentFilter
│   │   │   ├── RoleFilter
│   │   │   └── InviteButton
│   │   ├── MemberTable
│   │   │   └── MemberRow
│   │   └── MemberDetailSheet
│   │
│   ├── Leaderboard
│   │   ├── LeaderboardHeader
│   │   ├── TopThree (Podium)
│   │   ├── LeaderboardTable
│   │   └── ProgressCharts
│   │
│   └── Reports
│       ├── ReportFilters
│       ├── ExportButton
│       └── ChartGrid
│
└── Shared
    ├── DataTable (reusable)
    ├── SearchFilter
    ├── FileUpload
    ├── EmptyState
    ├── ErrorBoundary
    ├── LoadingSpinner
    └── ConfirmDialog
```

### 3.2 Key Component Specifications

#### KanbanCard Component

```mermaid
graph TB
    subgraph KanbanCard[KanbanCard - 280px width]
        CARD_TOP[Top Section]
        CARD_MID[Middle Section]
        CARD_BOT[Bottom Section]

        subgraph Top[Top]
            PRIORITY_DOT[Priority Color Dot]
            TITLE[Task Title - 2 lines max]
            MENU[More Actions Menu]
        end

        subgraph Mid[Middle]
            TAGS[Tag Badges - max 3]
            DESC[Description Preview - 1 line]
        end

        subgraph Bottom[Bottom]
            DUE[Due Date Badge]
            ASSIGNEES[Avatar Stack - max 3]
            META[💬 5 | 📎 2]
        end
    end
```

#### StatsCard Component

```mermaid
graph TB
    subgraph StatsCard[StatsCard]
        SC_ICON[Icon - Circle bg]
        SC_LABEL[Label - Small text]
        SC_VALUE[Value - Large number]
        SC_TREND[Trend - Arrow + percentage]
        SC_CHART[Mini Sparkline - Optional]
    end
```

#### Dashboard Layout Grid

```mermaid
graph TB
    subgraph DashboardGrid[Dashboard Grid - 12 columns]
        ROW1[Row 1: Stats Cards - 4x col-3]
        ROW2[Row 2: Task Overview Chart - col-8 | Recent Activity - col-4]
        ROW3[Row 3: Department Progress - col-6 | Top Performers - col-6]
        ROW4[Row 4: Upcoming Deadlines - col-12]
    end
```

---

## 4. Page Designs

### 4.1 Login Page

```mermaid
graph TB
    subgraph LoginPage[Login Page - Full Screen]
        CENTER[Centered Card - max-w-md]
        subgraph Card[Login Card]
            LOGO[CLB Logo]
            TITLE[Đăng nhập]
            FORM[Form]
            subgraph FormFields[Fields]
                EMAIL[Email Input]
                PASS[Password Input]
                REMEMBER[Remember me checkbox]
            end
            SUBMIT[Đăng nhập button]
            LINKS[Links]
            subgraph LinksSection[Links]
                FORGOT[Quên mật khẩu?]
                REGISTER[Chưa có tài khoản? Đăng ký]
            end
        end
        LANG[Language Toggle - Top Right]
        THEME[Theme Toggle - Top Right]
    end
```

### 4.2 Dashboard Page (Role-Adaptive)

```mermaid
graph TB
    subgraph AdminDashboard[Admin/Chủ nhiệm Dashboard]
        STATS[6 Stats Cards]
        CHARTS[Charts Row]
        ACTIVITY[Activity Feed]
        DEADLINES[Upcoming Tasks]
    end

    subgraph LeaderDashboard[Trưởng ban Dashboard]
        DEPT_STATS[4 Stats Cards - Ban]
        DEPT_CHART[Progress Chart - Ban]
        DEPT_MEMBERS[Active Members]
        DEPT_TASKS[Recent Tasks]
    end

    subgraph MemberDashboard[Thành viên Dashboard]
        MY_STATS[3 Stats Cards - Cá nhân]
        MY_TASKS[My Tasks List]
        MY_PROGRESS[Progress Chart]
        LEADERBOARD_PREVIEW[Top 5 Leaderboard]
    end
```

### 4.3 Kanban Board Page

```mermaid
graph TB
    subgraph KanbanPage[Kanban Board Page]
        TOOLBAR[Toolbar Row]
        BOARD[Board Area - Horizontal Scroll]

        subgraph Toolbar[Toolbar]
            SEARCH[Search tasks]
            FILTER_DEPT[Department filter]
            FILTER_PRIORITY[Priority filter]
            FILTER_ASSIGNEE[Assignee filter]
            VIEW[View toggle: Board | List]
            CREATE[+ Tạo nhiệm vụ]
        end

        subgraph Board[Board - 4 Columns]
            COL1[📋 Cần làm - TODO]
            COL2[🔄 Đang làm - IN_PROGRESS]
            COL3[👀 Đang xét duyệt - IN_REVIEW]
            COL4[✅ Hoàn thành - DONE]
        end

        subgraph Column[Each Column]
            COL_HEAD[Header: Title + Count + Add button]
            COL_BODY[Scrollable card list]
            COL_CARDS[KanbanCard x N]
        end
    end
```

### 4.4 Member Management Page

```mermaid
graph TB
    subgraph MembersPage[Members Page]
        TOOLBAR[Toolbar]
        TABLE[Data Table]

        subgraph MemberToolbar[Toolbar]
            SEARCH[Search by name/email]
            FILTER_DEPT[Department dropdown]
            FILTER_ROLE[Role dropdown]
            FILTER_STATUS[Active/Inactive]
            INVITE[+ Mời thành viên]
        end

        subgraph MemberTable[Table Columns]
            COL_AVATAR[Avatar + Name]
            COL_EMAIL[Email]
            COL_DEPT[Department Badge]
            COL_ROLE[Role Badge]
            COL_POINTS[Points]
            COL_TASKS[Tasks: Done/Active]
            COL_STATUS[Active Status]
            COL_ACTIONS[Actions Menu]
        end
    end
```

### 4.5 Leaderboard Page

```mermaid
graph TB
    subgraph LeaderboardPage[Leaderboard Page]
        HEADER[Header: Title + Department Filter]
        PODIUM[Top 3 Podium]
        TABLE[Leaderboard Table]
        CHARTS[Progress Charts]

        subgraph Podium[Podium - Top 3]
            P2[🥈 2nd Place - Left]
            P1[🥇 1st Place - Center - Taller]
            P3[🥉 3rd Place - Right]
        end

        subgraph LeaderboardTable[Table Columns]
            LT_RANK[Rank #]
            LT_AVATAR[Avatar + Name]
            LT_DEPT[Department]
            LT_POINTS[Points]
            LT_COMPLETED[Completed]
            LT_RATE[Completion Rate]
            LT_STREAK[Streak 🔥]
        end
    end
```

---

## 5. Responsive Strategy

### 5.1 Breakpoint Behavior

| Component | Mobile < 768px | Tablet 768-1024px | Desktop > 1024px |
|-----------|:--------------:|:-----------------:|:----------------:|
| Sidebar | Hidden (Sheet) | Collapsed (icons) | Full expanded |
| Header | Simplified | Full | Full |
| Kanban Board | 1 column scroll | 2 columns | 4 columns |
| Dashboard Grid | 1 column | 2 columns | 3-4 columns |
| Data Table | Card view | Scrollable table | Full table |
| Leaderboard | List only | List + mini podium | Full podium + table |
| Bottom Tab Bar | ✅ Visible | ❌ Hidden | ❌ Hidden |

### 5.2 Mobile-First Approach

```mermaid
flowchart LR
    MOBILE[Mobile First] --> TABLET[Tablet Enhancement]
    TABLET --> DESKTOP[Desktop Enhancement]

    subgraph Mobile[Mobile Strategy]
        M1[Single column layout]
        M2[Bottom tab navigation]
        M3[Swipe gestures]
        M4[Touch-friendly targets 44px+]
        M5[Collapsible sections]
    end

    subgraph Tablet[Tablet Strategy]
        T1[2-column grid]
        T2[Collapsed sidebar]
        T3[Side panels]
    end

    subgraph Desktop[Desktop Strategy]
        D1[Full sidebar]
        D2[Multi-column grid]
        D3[Hover interactions]
        D4[Keyboard shortcuts]
    end
```

### 5.3 Touch Interactions

| Gesture | Action | Context |
|---------|--------|---------|
| Tap | Select/Open | Cards, buttons, links |
| Long Press | Context menu | Kanban cards, table rows |
| Swipe Left/Right | Navigate columns | Kanban board |
| Swipe Down | Pull to refresh | Lists, dashboard |
| Pinch | Zoom | Charts |

---

## 6. i18n Architecture

### 6.1 Translation Structure

```mermaid
graph TB
    subgraph i18n[i18n System]
        NEXT_INTL[next-intl Library]
        subgraph Routing[Routing Strategy]
            VI[/vi - Tiếng Việt]
            EN[/en - English]
        end

        subgraph TranslationFiles[Translation Files]
            COMMON[common.json - Shared strings]
            AUTH[auth.json - Login/Register]
            DASHBOARD[dashboard.json - Dashboard]
            TASKS[tasks.json - Kanban/Tasks]
            MEMBERS[members.json - Members]
            DEPARTMENTS[departments.json - Departments]
            LEADERBOARD[leaderboard.json - Leaderboard]
            REPORTS[reports.json - Reports]
            SETTINGS[settings.json - Settings]
        end

        NEXT_INTL --> Routing
        NEXT_INTL --> TranslationFiles
    end
```

### 6.2 Translation Key Structure

```json
// locales/vi/common.json
{
  "nav": {
    "dashboard": "Tổng quan",
    "tasks": "Nhiệm vụ",
    "members": "Thành viên",
    "departments": "Ban chuyên môn",
    "leaderboard": "Bảng xếp hạng",
    "reports": "Báo cáo",
    "settings": "Cài đặt"
  },
  "actions": {
    "create": "Tạo mới",
    "edit": "Chỉnh sửa",
    "delete": "Xóa",
    "save": "Lưu",
    "cancel": "Hủy",
    "search": "Tìm kiếm",
    "filter": "Lọc",
    "export": "Xuất file"
  },
  "status": {
    "todo": "Cần làm",
    "in_progress": "Đang làm",
    "in_review": "Đang xét duyệt",
    "done": "Hoàn thành"
  },
  "priority": {
    "low": "Thấp",
    "medium": "Trung bình",
    "high": "Cao",
    "urgent": "Khẩn cấp"
  },
  "roles": {
    "admin": "Quản trị viên",
    "chairman": "Chủ nhiệm CLB",
    "department_leader": "Trưởng ban",
    "member": "Thành viên"
  }
}
```

### 6.3 Language Switching Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Language Switch
    participant Store as Zustand Store
    participant Cookie as Cookie
    participant Router as Next.js Router

    U->>UI: Click language toggle
    UI->>Store: setLocale(en)
    Store->>Cookie: Set locale cookie
    Store->>Router: router.push(/en/...)
    Router-->>UI: Re-render with new locale
```

---

## 7. Theme System

### 7.1 Theme Architecture

```mermaid
graph TB
    subgraph ThemeSystem[Theme System]
        NEXT_THEMES[next-themes Library]
        TAILWIND[Tailwind CSS dark: prefix]

        subgraph Modes[Theme Modes]
            LIGHT[Light Mode]
            DARK[Dark Mode]
            SYSTEM[System Preference]
        end

        subgraph Storage[Persistence]
            LOCAL[localStorage]
            PREF[prefers-color-scheme]
        end

        NEXT_THEMES --> Modes
        NEXT_THEMES --> Storage
        TAILWIND --> Modes
    end
```

### 7.2 CSS Variable Strategy

```css
/* globals.css - Theme variables */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 239 84% 67%;        /* #6366f1 */
  --primary-foreground: 210 40% 98%;
  --secondary: 160 84% 39%;      /* #10b981 */
  --accent: 38 92% 50%;          /* #f59e0b */
  --destructive: 0 84% 60%;     /* #ef4444 */
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --border: 214.3 31.8% 91.4%;
  --ring: 239 84% 67%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --primary: 239 84% 77%;        /* #818cf8 */
  --primary-foreground: 222.2 84% 4.9%;
  --secondary: 160 84% 49%;      /* #34d399 */
  --accent: 38 92% 60%;          /* #fbbf24 */
  --destructive: 0 84% 70%;     /* #f87171 */
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --border: 217.2 32.6% 17.5%;
  --ring: 239 84% 77%;
}
```

### 7.3 Theme Toggle Component

```mermaid
graph LR
    TOGGLE[Theme Toggle] --> OPTIONS[3 Options]
    OPTIONS --> SUN[☀️ Light]
    OPTIONS --> MOON[🌙 Dark]
    OPTIONS --> MONITOR[🖥️ System]
```

---

## 📊 Quyết Định UI/UX

| Quyết Định | Lựa Chọn | Lý Do | Phương Án Loại Bỏ |
|------------|----------|-------|-------------------|
| Component Library | shadcn/ui | Customizable, copy-paste, no vendor lock-in | ❌ Radix only (thiếu styled), ❌ MUI (nặng) |
| CSS Strategy | Tailwind + CSS Variables | Utility-first + theme tokens | ❌ CSS Modules (verbose), ❌ Styled Components (runtime) |
| Theme | next-themes + CSS vars | SSR-safe, system preference detect | ❌ Manual toggle (flash of wrong theme) |
| i18n | next-intl | App Router native, server/client support | ❌ react-i18next (client-only) |
| Layout Pattern | Nested layouts (App Router) | Shared sidebar, per-page content | ❌ HOC wrappers (complex) |
| Mobile Navigation | Bottom tab bar | Native app feel, thumb-friendly | ❌ Hamburger only (hidden nav) |
| Data Table | shadcn Table + TanStack Table | Sorting, filtering, pagination built-in | ❌ Custom table (reinventing wheel) |
| Charts | Recharts | React-native, declarative, responsive | ❌ Chart.js (canvas), ❌ D3 (overkill) |
| Drag & Drop | @hello-pangea/dnd | Accessible, performant, maintained fork | ❌ dnd-kit (complex API) |
| Form Handling | React Hook Form + Zod | Performant, minimal re-renders, type-safe | ❌ Formik (more re-renders) |
| Toast/Notification | Sonner (shadcn) | Lightweight, beautiful defaults | ❌ react-hot-toast (less polished) |
| Command Palette | cmdk (shadcn) | Cmd+K search, keyboard-first UX | ❌ Custom search (more work) |

---

## 🎯 UX Principles

1. **Progressive Disclosure** - Hiển thị thông tin theo mức độ quan trọng
2. **Consistent Navigation** - Sidebar cố định, breadcrumb rõ ràng
3. **Immediate Feedback** - Optimistic updates, loading skeletons, toast notifications
4. **Keyboard First** - Cmd+K search, keyboard shortcuts cho power users
5. **Accessible** - ARIA labels, focus management, screen reader support
6. **Performance** - Code splitting, lazy loading, skeleton loading states
7. **Error Recovery** - Clear error messages, retry actions, undo support

> **Bước tiếp theo:** Xem chi tiết Implementation Roadmap tại [`05-implementation-roadmap.md`](plans/05-implementation-roadmap.md).
