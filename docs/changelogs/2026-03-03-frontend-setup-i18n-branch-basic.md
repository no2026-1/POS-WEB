# Changelog — 2026-03-03

## Table of Contents
- [Backend Changes](#backend-changes)
  - [Production Seed Script — สร้าง Users & Roles บน VPS](#production-seed-script--สรางusers--roles-บน-vps)
  - [Bug Fix — CORS ไม่อนุญาต localhost:5173](#bug-fix--cors-ไมอนุญาต-localhost5173)
- [Frontend — Initial Setup](#frontend--initial-setup)
  - [Package Installation — ติดตั้ง dependencies ทั้งหมด](#package-installation--ติดตัง-dependencies-ทังหมด)
  - [Project Configuration — vite, tsconfig, tailwind, path alias](#project-configuration--vite-tsconfig-tailwind-path-alias)
  - [Core Architecture — api client, auth store, layout, routing](#core-architecture--api-client-auth-store-layout-routing)
- [Frontend — Features Built](#frontend--features-built)
  - [i18n — ระบบหลายภาษา EN / TH / LO](#i18n--ระบบหลายภาษา-en--th--lo)
  - [Branch Feature — CRUD + Two-Panel Layout](#branch-feature--crud--two-panel-layout)
  - [Basic Feature — CRUD + Nested BasicLine Management](#basic-feature--crud--nested-basicline-management)
- [Pending Work — งานที่ยังค้างอยู่](#pending-work--งานทียังคางอยู)
- [Notes & Patterns — สิ่งสำคัญที่ควรจำ](#notes--patterns--สิงสำคัญทีควรจำ)

---

## Backend Changes

### Production Seed Script — สร้าง Users & Roles บน VPS
**ไฟล์:** `seed-prod.js` (รันด้วย `node /app/seed-prod.js` ใน Docker container)

- สร้าง Basic category `USER_ROLE` + BasicLine roles: ADMIN, MANAGER, CASHIER
- สร้าง user 3 คนพร้อม assign roles:

| Email | Password | Role |
|---|---|---|
| admin@pos.com | password123 | ADMIN |
| manager@pos.com | password123 | MANAGER |
| cashier@pos.com | password123 | CASHIER |

**วิธีรัน (บน VPS):**
```bash
docker cp seed-prod.js $(docker compose ps -q api):/app/seed-prod.js
docker compose exec api node /app/seed-prod.js
```

---

### Bug Fix — CORS ไม่อนุญาต localhost:5173
**ไฟล์ที่แก้:** `e:/high-performance-pos/.env`, `.env.production`

- เพิ่ม `http://localhost:5173` ใน `CORS_ORIGIN`
- เหตุผล: browser block request จาก Vite dev server → backend API

```
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:5173
```

---

## Frontend — Initial Setup

### Package Installation — ติดตั้ง dependencies ทั้งหมด
**Project path:** `E:\high-performance-pos-web`

```bash
npm install react-router-dom axios @tanstack/react-query zustand
npm install -D tailwindcss @tailwindcss/vite i18next react-i18next
```

| Package | หน้าที่ |
|---|---|
| `react-router-dom` | Client-side routing |
| `axios` | HTTP client สำหรับ API calls |
| `@tanstack/react-query` | Server state management (fetch, cache, invalidate) |
| `zustand` | Client state management (auth store) |
| `tailwindcss` | Utility-first CSS framework |
| `i18next` + `react-i18next` | Internationalization (EN/TH/LO) |

---

### Project Configuration — vite, tsconfig, tailwind, path alias
**ไฟล์ที่แก้:**

- `vite.config.ts` — เพิ่ม Tailwind plugin + path alias `@/` → `src/`
- `tsconfig.app.json` — เพิ่ม `baseUrl` + `paths` สำหรับ `@/*`
- `src/index.css` — แทนที่ด้วย `@import "tailwindcss"` + component classes

**Tailwind component classes ที่สร้าง (`src/index.css`):**
```css
.input          /* input field มาตรฐาน */
.btn-primary    /* ปุ่มสีฟ้า (save, submit) */
.btn-secondary  /* ปุ่ม outline สีเทา (cancel) */
```

---

### Core Architecture — api client, auth store, layout, routing

| ไฟล์ | หน้าที่ |
|---|---|
| `src/api/client.ts` | Axios instance — auto attach Bearer token + auto logout เมื่อ 401 |
| `src/stores/auth.store.ts` | Zustand — เก็บ accessToken + user, persist ใน localStorage |
| `src/features/auth/auth.api.ts` | API: login, logout, me |
| `src/features/auth/LoginPage.tsx` | หน้า login |
| `src/components/layout/MainLayout.tsx` | Sidebar + language switcher + user info + logout |
| `src/components/layout/ProtectedRoute.tsx` | Guard — redirect `/login` ถ้าไม่ได้ login |
| `src/pages/DashboardPage.tsx` | หน้า dashboard (placeholder) |
| `src/App.tsx` | Router + QueryClientProvider setup |
| `.env.local` | `VITE_API_URL=http://localhost:3000/api` |

---

## Frontend — Features Built

### i18n — ระบบหลายภาษา EN / TH / LO
**ไฟล์:** `src/i18n/index.ts`, `src/i18n/locales/en.json`, `th.json`, `lo.json`

- รองรับ 3 ภาษา: English, ภาษาไทย, ພາສາລາວ
- `fallbackLng: 'en'` — ถ้า key ไม่มีใน th/lo จะแสดงเป็น English อัตโนมัติ
- Language switcher ปุ่ม **EN / ไทย / ລາວ** อยู่ที่ sidebar ล่าง
- เก็บภาษาที่เลือกไว้ใน `localStorage` (จำข้ามครั้งได้)
- **Workflow:** เพิ่มใน `en.json` เสมอ → แปล th/lo ก่อน deploy

---

### Branch Feature — CRUD + Two-Panel Layout
**ไฟล์:**
- `src/features/branch/branch.types.ts` — TypeScript interfaces
- `src/features/branch/branch.api.ts` — getAll, getById, create, update, delete
- `src/features/branch/BranchPage.tsx` — หน้าหลัก

**API Endpoints ที่ใช้:**
```
GET    /api/branch          — list with search/pagination
POST   /api/branch          — create (ADMIN only)
PUT    /api/branch/:id      — update (ADMIN only)
DELETE /api/branch/:id      — soft delete / deactivate (ADMIN only)
```

**UI Features:**
- Dark gradient header + ปุ่ม Add สีเขียว
- Real-time search ค้นหาทุก field (code, name, tel, address)
- คลิกแถวเพื่อเปิด **side panel** แทน popup modal
- Toggle switches สำหรับ autoProcess, requireApproval, allowReturnRefund
- Delete confirmation อยู่ใน panel เดียวกัน (ไม่มี modal ซ้อน)
- Toast notification (3 วินาที) แจ้งผลสำเร็จ/ผิดพลาด
- Selected row — highlight + left blue border

---

### Basic Feature — CRUD + Nested BasicLine Management
**ไฟล์:**
- `src/features/basic/basic.types.ts` — TypeScript interfaces (Basic + BasicLine)
- `src/features/basic/basic.api.ts` — getAll, create, update, delete + createLine, updateLine, deleteLine
- `src/features/basic/BasicPage.tsx` — หน้าหลัก

**API Endpoints ที่ใช้:**
```
GET    /api/basic            — list
POST   /api/basic            — create Basic category (ADMIN only)
PUT    /api/basic/:id        — update Basic (ADMIN only)
DELETE /api/basic/:id        — delete Basic (ADMIN only)
POST   /api/basic/:id/lines  — add BasicLine
PUT    /api/basic/lines/:id  — update BasicLine
DELETE /api/basic/lines/:id  — delete BasicLine
```

**UI Features:**
- Two-panel layout — ตาราง Basic ซ้าย + Side panel ขวา
- Badge แสดงจำนวน lines ในแต่ละ Basic category
- Side panel แบ่งเป็น 2 ส่วน: Basic form (บน) + Nested BasicLine table (ล่าง)
- เพิ่ม/แก้ไข BasicLine แบบ **inline row form** (ไม่ต้องเปิด modal ซ้อน)
- Sync ข้อมูล panel อัตโนมัติเมื่อ TanStack Query refresh

---

## Pending Work — งานที่ยังค้างอยู่

| ลำดับ | Feature | สถานะ |
|---|---|---|
| Step 3 | Department | ⏳ ยังไม่ได้ทำ |
| Step 4 | Location | ⏳ ยังไม่ได้ทำ |
| Step 5 | Employee | ⏳ ยังไม่ได้ทำ |
| Step 6 | User | ⏳ ยังไม่ได้ทำ |
| — | ทดสอบ Branch + Basic CRUD ให้ครบ | ⏳ รอทดสอบ |
| — | เพิ่ม th/lo translations ให้ครบก่อน deploy | ⏳ รอก่อน deploy |

---

## Notes & Patterns — สิ่งสำคัญที่ควรจำ

### Feature Pattern (ใช้ซ้ำทุก feature)
```
1. สร้าง src/features/<name>/<name>.types.ts
2. สร้าง src/features/<name>/<name>.api.ts
3. สร้าง src/features/<name>/<name>Page.tsx
4. เพิ่ม key ใน src/i18n/locales/en.json
5. เพิ่ม <Route> ใน src/App.tsx
```

### i18n Pattern
- เพิ่มใน `en.json` ก่อนเสมอ → th/lo จะ fallback เป็น English ระหว่างพัฒนา
- แปล th/lo พร้อมกันทีเดียวก่อน deploy

### Toast Pattern
```tsx
const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

function showToast(message: string, type: 'success' | 'error') {
  setToast({ message, type })
  setTimeout(() => setToast(null), 3000)
}
```
