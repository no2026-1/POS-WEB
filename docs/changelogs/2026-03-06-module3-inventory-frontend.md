# Changelog: 2026-03-06
## Module 3 — Inventory Frontend

---

### New Files Created (14 files)

#### Purchase Order
- `src/features/purchase-order/purchase-order.types.ts`
- `src/features/purchase-order/purchase-order.api.ts`
- `src/features/purchase-order/PurchaseOrderPage.tsx` — List with status filter + New PO side panel
- `src/features/purchase-order/PurchaseOrderDetailPage.tsx` — Detail page with lines management + Receive/Cancel actions

#### Goods Receive
- `src/features/goods-receive/goods-receive.types.ts`
- `src/features/goods-receive/goods-receive.api.ts`
- `src/features/goods-receive/GoodsReceivePage.tsx` — List with side panel, Confirm/Cancel workflow

#### Stock Adjustment
- `src/features/stock-adjust/stock-adjust.types.ts`
- `src/features/stock-adjust/stock-adjust.api.ts`
- `src/features/stock-adjust/StockAdjustPage.tsx` — List with status filter + New Adjustment side panel
- `src/features/stock-adjust/StockAdjustDetailPage.tsx` — Detail page with lines management + Confirm/Cancel actions

#### Stock Ledger
- `src/features/stock/stock.types.ts`
- `src/features/stock/stock.api.ts`
- `src/features/stock/StockPage.tsx` — Read-only ledger with location/date filters + pagination

### Updated Files

- `src/i18n/locales/en.json` — Added locale keys: `purchaseOrder`, `goodsReceive`, `stockAdjust`, `stock`, `common.back`, and nav keys for Inventory section
- `src/App.tsx` — Added 6 new routes: `/purchase-order`, `/purchase-order/:id`, `/goods-receive`, `/stock-adjust`, `/stock-adjust/:id`, `/stock`
- `src/components/layout/MainLayout.tsx` — Added "Inventory" nav section in sidebar

### UX Patterns

| Feature | Pattern |
|---|---|
| Purchase Order | List page → click row → Detail page (lines + workflow) |
| Goods Receive | List page + side panel (header only) |
| Stock Adjustment | List page → click row → Detail page (lines + workflow) |
| Stock Ledger | Read-only list, no create/edit |

### Workflow Notes

- **PO Receive**: available when status = APPROVED, SUBMITTED, or DRAFT (if requireApproval = false)
- **Stock Adjust Confirm**: available when status = APPROVED, SUBMITTED, or DRAFT (if requireApproval = false)
- **adjustTypeId** in Stock Adjust: references BasicLine ID from Basic Data module
- Cancel: available on all statuses except final states (RECEIVED / CONFIRMED / CANCELLED)

### API Endpoints Used

| Feature | Base Path |
|---|---|
| Purchase Orders | `GET/POST /api/purchase-orders`, `PUT/POST /:id/approve|receive|cancel`, `POST/PUT/DELETE /:id/lines/:lineId` |
| Goods Receives | `GET/POST /api/goods-receives`, `PUT /:id`, `POST /:id/confirm|cancel` |
| Stock Adjusts | `GET/POST /api/stock-adjusts`, `PUT /:id`, `POST /:id/approve|confirm|cancel`, `POST/PUT/DELETE /:id/lines/:lineId` |
| Stocks | `GET /api/stocks` |
