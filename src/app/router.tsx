import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '@/components/layout/ProtectedRoute/ProtectedRoute'
import MainLayout from '@/components/layout/MainLayout/MainLayout'

// Lazy-loaded pages
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'))
const BranchPage = lazy(() => import('@/features/branch/pages/BranchPage'))
const BasicPage = lazy(() => import('@/features/basic/pages/BasicPage'))
const DepartmentPage = lazy(() => import('@/features/department/pages/DepartmentPage'))
const LocationPage = lazy(() => import('@/features/location/pages/LocationPage'))
const EmployeePage = lazy(() => import('@/features/employee/pages/EmployeePage'))
const UserPage = lazy(() => import('@/features/user/pages/UserPage'))
const UomPage = lazy(() => import('@/features/uom/pages/UomPage'))
const ProductCategoryPage = lazy(() => import('@/features/product-category/pages/ProductCategoryPage'))
const ProductBrandPage = lazy(() => import('@/features/product-brand/pages/ProductBrandPage'))
const ProductGroupPage = lazy(() => import('@/features/product-group/pages/ProductGroupPage'))
const ProductPage = lazy(() => import('@/features/product/pages/ProductPage'))
const CustomerPage = lazy(() => import('@/features/customer/pages/CustomerPage'))
const VendorPage = lazy(() => import('@/features/vendor/pages/VendorPage'))
const PurchaseOrderPage = lazy(() => import('@/features/purchase-order/pages/PurchaseOrderPage'))
const PurchaseOrderDetailPage = lazy(() => import('@/features/purchase-order/pages/PurchaseOrderDetailPage'))
const GoodsReceivePage = lazy(() => import('@/features/goods-receive/pages/GoodsReceivePage'))
const StockAdjustPage = lazy(() => import('@/features/stock-adjust/pages/StockAdjustPage'))
const StockAdjustDetailPage = lazy(() => import('@/features/stock-adjust/pages/StockAdjustDetailPage'))
const StockMovePage = lazy(() => import('@/features/stock-move/pages/StockMovePage'))
const StockMoveDetailPage = lazy(() => import('@/features/stock-move/pages/StockMoveDetailPage'))
const StockPage = lazy(() => import('@/features/stock/pages/StockPage'))
const PosConfigPage = lazy(() => import('@/features/pos-config/pages/PosConfigPage'))
const SessionPage = lazy(() => import('@/features/session/pages/SessionPage'))
const PosPage = lazy(() => import('@/features/pos/pages/PosPage'))
const PosHistoryPage = lazy(() => import('@/features/pos-order/pages/PosHistoryPage'))
const PosReturnPage = lazy(() => import('@/features/pos-return/pages/PosReturnPage'))
const PosReturnDetailPage = lazy(() => import('@/features/pos-return/pages/PosReturnDetailPage'))
const DailyClosePage = lazy(() => import('@/features/daily-close/pages/DailyClosePage'))
const StockCardPage = lazy(() => import('@/features/stock-card/pages/StockCardPage'))
const CustomerCreditPage = lazy(() => import('@/features/customer-credit/pages/CustomerCreditPage'))
const ExchangeRatePage = lazy(() => import('@/features/exchange-rate/pages/ExchangeRatePage'))
const ProductConversionPage = lazy(() => import('@/features/product-conversion/pages/ProductConversionPage'))
const ProductPricePage = lazy(() => import('@/features/product-price/pages/ProductPricePage'))
const TablePage = lazy(() => import('@/features/table/pages/TablePage'))
const CompanyPage = lazy(() => import('@/features/company/pages/CompanyPage'))
const ApprovalPage = lazy(() => import('@/features/approval/pages/ApprovalPage'))
const PermissionPage = lazy(() => import('@/features/permission/pages/PermissionPage'))
const ReportsPage = lazy(() => import('@/features/reports/pages/ReportsPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected with sidebar */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/branch" element={<BranchPage />} />
              <Route path="/basic" element={<BasicPage />} />
              <Route path="/department" element={<DepartmentPage />} />
              <Route path="/location" element={<LocationPage />} />
              <Route path="/employee" element={<EmployeePage />} />
              <Route path="/user" element={<UserPage />} />
              {/* Product */}
              <Route path="/uom" element={<UomPage />} />
              <Route path="/product-category" element={<ProductCategoryPage />} />
              <Route path="/product-brand" element={<ProductBrandPage />} />
              <Route path="/product-group" element={<ProductGroupPage />} />
              <Route path="/product" element={<ProductPage />} />
              {/* Partners */}
              <Route path="/customer" element={<CustomerPage />} />
              <Route path="/vendor" element={<VendorPage />} />
              {/* Inventory */}
              <Route path="/purchase-order" element={<PurchaseOrderPage />} />
              <Route path="/purchase-order/:id" element={<PurchaseOrderDetailPage />} />
              <Route path="/goods-receive" element={<GoodsReceivePage />} />
              <Route path="/stock-adjust" element={<StockAdjustPage />} />
              <Route path="/stock-adjust/:id" element={<StockAdjustDetailPage />} />
              <Route path="/stock-move" element={<StockMovePage />} />
              <Route path="/stock-move/:id" element={<StockMoveDetailPage />} />
              <Route path="/stock" element={<StockPage />} />
              {/* POS */}
              <Route path="/pos-config" element={<PosConfigPage />} />
              <Route path="/session" element={<SessionPage />} />
              <Route path="/pos-history" element={<PosHistoryPage />} />
              <Route path="/pos-return" element={<PosReturnPage />} />
              <Route path="/pos-return/:id" element={<PosReturnDetailPage />} />
              {/* Reports */}
              <Route path="/daily-close" element={<DailyClosePage />} />
              <Route path="/stock-card" element={<StockCardPage />} />
              <Route path="/customer-credit" element={<CustomerCreditPage />} />
              {/* Settings */}
              <Route path="/exchange-rate" element={<ExchangeRatePage />} />
              <Route path="/product-conversion" element={<ProductConversionPage />} />
              <Route path="/product-price" element={<ProductPricePage />} />
              <Route path="/tables" element={<TablePage />} />
              <Route path="/company" element={<CompanyPage />} />
              <Route path="/approval" element={<ApprovalPage />} />
              <Route path="/permission" element={<PermissionPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>
          </Route>

          {/* POS full-screen (no sidebar) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/pos" element={<PosPage />} />
          </Route>

          {/* Redirect root */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
