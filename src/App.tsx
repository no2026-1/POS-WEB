import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import MainLayout from '@/components/layout/MainLayout'
import LoginPage from '@/features/auth/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import BranchPage from '@/features/branch/BranchPage'
import BasicPage from '@/features/basic/BasicPage'
import DepartmentPage from '@/features/department/DepartmentPage'
import LocationPage from '@/features/location/LocationPage'
import EmployeePage from '@/features/employee/EmployeePage'
import UserPage from '@/features/user/UserPage'
import UomPage from '@/features/uom/UomPage'
import ProductCategoryPage from '@/features/product-category/ProductCategoryPage'
import ProductBrandPage from '@/features/product-brand/ProductBrandPage'
import ProductGroupPage from '@/features/product-group/ProductGroupPage'
import ProductPage from '@/features/product/ProductPage'
import CustomerPage from '@/features/customer/CustomerPage'
import VendorPage from '@/features/vendor/VendorPage'
import PurchaseOrderPage from '@/features/purchase-order/PurchaseOrderPage'
import PurchaseOrderDetailPage from '@/features/purchase-order/PurchaseOrderDetailPage'
import GoodsReceivePage from '@/features/goods-receive/GoodsReceivePage'
import StockAdjustPage from '@/features/stock-adjust/StockAdjustPage'
import StockAdjustDetailPage from '@/features/stock-adjust/StockAdjustDetailPage'
import StockPage from '@/features/stock/StockPage'
import PosConfigPage from '@/features/pos-config/PosConfigPage'
import SessionPage from '@/features/session/SessionPage'
import PosPage from '@/features/pos/PosPage'
import PosHistoryPage from '@/features/pos-order/PosHistoryPage'
import PosReturnPage from '@/features/pos-return/PosReturnPage'
import PosReturnDetailPage from '@/features/pos-return/PosReturnDetailPage'
import DailyClosePage from '@/features/daily-close/DailyClosePage'
import StockCardPage from '@/features/stock-card/StockCardPage'
import CustomerCreditPage from '@/features/customer-credit/CustomerCreditPage'
import ExchangeRatePage from '@/features/exchange-rate/ExchangeRatePage'
import ProductConversionPage from '@/features/product-conversion/ProductConversionPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected */}
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
            </Route>
          </Route>

          {/* POS full-screen (no sidebar) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/pos" element={<PosPage />} />
          </Route>

          {/* Redirect root */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
