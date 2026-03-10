# Changelog: 2026-03-05 (Session 2)
## Module 2 — Product Management Frontend

---

## Summary

เพิ่ม 5 features ใหม่สำหรับ Module 2 Product Management ในฝั่ง frontend ครบทั้งหมด พร้อมปรับ sidebar ให้แบ่ง section ชัดเจน

---

## Features Added

### 1. Unit of Measure — `/uom`
- ไฟล์: `src/features/uom/uom.types.ts`, `uom.api.ts`, `UomPage.tsx`
- Fields: `uomCode` (required, auto-uppercase), `uomName` (required), `remarks`
- API: `GET/POST/PUT/DELETE /api/uoms`

### 2. Product Category — `/product-category`
- ไฟล์: `src/features/product-category/product-category.types.ts`, `product-category.api.ts`, `ProductCategoryPage.tsx`
- Fields: `categoryCode`, `categoryName`, `parentId` (dropdown hierarchical), `remarks`
- API: `GET/POST/PUT/DELETE /api/product-categories`
- Response: `{ data: { data: [], pagination: {...} } }` → path: `data?.data.data.data`

### 3. Product Brand — `/product-brand`
- ไฟล์: `src/features/product-brand/product-brand.types.ts`, `product-brand.api.ts`, `ProductBrandPage.tsx`
- Fields: `brandCode`, `brandName`, `remarks`
- API: `GET/POST/PUT/DELETE /api/product-brands`

### 4. Product Group — `/product-group`
- ไฟล์: `src/features/product-group/product-group.types.ts`, `product-group.api.ts`, `ProductGroupPage.tsx`
- Fields: `groupCode`, `groupName`, `remarks`
- API: `GET/POST/PUT/DELETE /api/product-groups`

### 5. Product — `/product`
- ไฟล์: `src/features/product/product.types.ts`, `product.api.ts`, `ProductPage.tsx`
- Fields: `productCode`, `productName`, `uomId` (required), `categoryId`, `groupId`, `brandId`, `costPrice`, `sellingPrice`, `trackStock`, `minStockLevel`, `remarks`
- Dropdowns: UOM (required), Category, Brand, Group (all optional)
- `trackStock` checkbox — เมื่อ tick จะแสดง `minStockLevel` field
- Table แสดง: code, name (+ brand), category, uom, selling price, status
- API: `GET/POST/PUT/DELETE /api/products`

---

## Files Updated

### `src/App.tsx`
เพิ่ม 5 imports + 5 routes:
```
/uom, /product-category, /product-brand, /product-group, /product
```

### `src/components/layout/MainLayout.tsx`
เปลี่ยนจาก flat `navItems[]` เป็น `navSections[]` แบบมี section headers:
- **Master Data**: Branch, Basic, Department, Location, Employee, User
- **Product**: UOM, Category, Brand, Group, Products

### `src/i18n/locales/en.json`
เพิ่ม keys:
- `nav.uom`, `nav.productCategory`, `nav.productBrand`, `nav.productGroup`, `nav.product`
- `nav.sectionMasterData`, `nav.sectionProduct`
- Sections: `uom`, `productCategory`, `productBrand`, `productGroup`, `product`

---

## Response Path Reference (all paginated the same)
```
response.data.data.data → Product[] / Uom[] / etc.
```
Response: `{ success: true, data: { data: [], total, page, limit, totalPages } }`

---

## Current Frontend Status

### Module 1 — Master Data ✅
Branch, Basic, Department, Location, Employee, User

### Module 2 — Product ✅
UOM, Category, Brand, Group, Product

### Next (Module 3+)
- Module 3: Inventory (Stock, Goods Receive, Stock Adjust)
- Module 4A: POS Retail (Sales, Payment, Session)
