# Changelog: 2026-03-05
## Department, Location, Employee, User Features + Bug Fixes

---

## Table of Contents
1. [Summary](#summary)
2. [Frontend Features Added](#frontend-features-added)
3. [Backend Bug Fixes](#backend-bug-fixes)
4. [i18n Updates](#i18n-updates)
5. [Routing Updates](#routing-updates)
6. [Files Changed](#files-changed)

---

## Summary

เพิ่ม 4 features ใหม่ในฝั่ง frontend (Department, Location, Employee, User) ให้ครบ Module 1 Master Data ทั้งหมด พร้อมแก้ bug 2 จุดในฝั่ง backend ที่ทำให้ Employee และ User ไม่แสดงข้อมูล

---

## Frontend Features Added

### 1. Department (`/department`)
- ไฟล์: `src/features/department/department.types.ts`, `department.api.ts`, `DepartmentPage.tsx`
- CRUD: เพิ่ม / แก้ไข / ลบ department
- มี dropdown เลือก Parent Department (รองรับ hierarchy)
- Response path: `data?.data.data` (array ตรง ไม่มี pagination)

### 2. Location / Warehouse (`/location`)
- ไฟล์: `src/features/location/location.types.ts`, `location.api.ts`, `LocationPage.tsx`
- CRUD: เพิ่ม / แก้ไข / ลบ location
- ต้องเลือก Branch ก่อน (required field)
- `locationCode` auto-uppercase
- Response path: `data?.data.data.data` (paginated)

### 3. Employee (`/employee`)
- ไฟล์: `src/features/employee/employee.types.ts`, `employee.api.ts`, `EmployeePage.tsx`
- CRUD: เพิ่ม / แก้ไข / ลบ employee
- Dropdown: Branch (required), Department (optional)
- Date picker สำหรับ `hireDate`
- Response path: `data?.data.data.data` (paginated)

### 4. User Management (`/user`)
- ไฟล์: `src/features/user/user.types.ts`, `user.api.ts`, `UserPage.tsx`
- CRUD: เพิ่ม / แก้ไข / ลบ user
- Role selection: toggle-pill UI — ดึง roles จาก `basicApi` category `USER_ROLE`
- Activate / Deactivate ผ่าน `PATCH /users/:id/status`
- Response path: `data?.data.data` (User[] ตรง + pagination แยก)

---

## Backend Bug Fixes

### Bug 1: Employee แสดงข้อมูลไม่ได้ (500 Error)
**ไฟล์:** `src/features/employee/employee.repository.ts`

**สาเหตุ:** `includeRelations` ใช้ชื่อ field ผิดสำหรับ Department
```ts
// ผิด
department: { select: { id: true, code: true, name: true } }

// ถูก
department: { select: { id: true, deptCode: true, englishName: true } }
```
Department schema ใช้ `deptCode` และ `englishName` ไม่ใช่ `code`/`name` — Prisma throw error ทุกครั้งที่ query

---

### Bug 2: User แสดงข้อมูลไม่ได้ (กรองแค่ inactive users)
**ไฟล์:** `src/features/user/dto/user.dto.ts`

**สาเหตุ:** Zod transform แปลง `undefined` เป็น `false`
```ts
// ผิด — undefined กลายเป็น false → query isActive: false เสมอ
isActive: z.string().optional().transform((val) => val === 'true')

// ถูก — ถ้าไม่ส่งมา ให้เป็น undefined (ไม่กรอง)
isActive: z.string().optional().transform((val) => val === undefined ? undefined : val === 'true')
```
เมื่อ frontend ไม่ส่ง `isActive` → `undefined === 'true'` = `false` → Repository filter `where.isActive = false` → ไม่เจอ active users เลย

---

## i18n Updates

**ไฟล์:** `src/i18n/locales/en.json`

เพิ่ม sections ใหม่:
- `department` — title, add, edit, code, englishName, localName, parent, noParent
- `location` — title, add, edit, code, name, branch
- `employee` — title, add, edit, empNo, empCode, englishName, localName, position, hireDate, phone
- `user` — title, add, edit, firstName, lastName, phone, roles, name

เพิ่ม keys ใน `common`:
- `select`, `remarks`, `updateSuccess`, `createSuccess`, `deleteSuccess`, `deleteConfirmMessage`

แก้ไข: ลบ `common` block ซ้ำ (duplicate key ที่เกิดจาก merge ผิดพลาด)

---

## Routing Updates

**ไฟล์:** `src/App.tsx`

เพิ่ม 4 routes ใหม่ภายใต้ Protected + MainLayout:
```tsx
<Route path="/department" element={<DepartmentPage />} />
<Route path="/location"   element={<LocationPage />} />
<Route path="/employee"   element={<EmployeePage />} />
<Route path="/user"       element={<UserPage />} />
```

---

## Files Changed

### Frontend (`E:\high-performance-pos-web\`)
| File | Action |
|------|--------|
| `src/App.tsx` | เพิ่ม 4 routes ใหม่ |
| `src/i18n/locales/en.json` | เพิ่ม locale keys + แก้ duplicate |
| `src/features/department/department.types.ts` | สร้างใหม่ |
| `src/features/department/department.api.ts` | สร้างใหม่ |
| `src/features/department/DepartmentPage.tsx` | สร้างใหม่ |
| `src/features/location/location.types.ts` | สร้างใหม่ |
| `src/features/location/location.api.ts` | สร้างใหม่ |
| `src/features/location/LocationPage.tsx` | สร้างใหม่ |
| `src/features/employee/employee.types.ts` | สร้างใหม่ |
| `src/features/employee/employee.api.ts` | สร้างใหม่ |
| `src/features/employee/EmployeePage.tsx` | สร้างใหม่ |
| `src/features/user/user.types.ts` | สร้างใหม่ |
| `src/features/user/user.api.ts` | สร้างใหม่ |
| `src/features/user/UserPage.tsx` | สร้างใหม่ |

### Backend (`E:\high-performance-pos\`)
| File | Action |
|------|--------|
| `src/features/employee/employee.repository.ts` | แก้ field names ใน department include |
| `src/features/user/dto/user.dto.ts` | แก้ isActive Zod transform bug |

---

## Current Status

### Frontend — Module 1 Master Data ✅ ครบแล้ว
| Feature | Route | Status |
|---------|-------|--------|
| Branch | `/branch` | ✅ Done |
| Basic Data | `/basic` | ✅ Done |
| Department | `/department` | ✅ Done |
| Location | `/location` | ✅ Done |
| Employee | `/employee` | ✅ Done |
| User | `/user` | ✅ Done |

### Next Steps (Module 2+)
- **Module 2:** Product Management (Category, Brand, Group, Product hierarchy, UOM, Price)
- **Module 3:** Inventory (Stock Card, Stock Adjust, Goods Receive)
- **Module 4A:** POS Retail (Sales Screen, Payment, Session)
