/**
 * Centralized React Query key factory.
 * Usage: queryKeys.branches.all, queryKeys.branches.detail(1)
 */
export const queryKeys = {
  branches: {
    all: ['branches'] as const,
    detail: (id: number) => ['branches', id] as const,
  },
  basic: {
    all: ['basic'] as const,
    detail: (id: number) => ['basic', id] as const,
  },
  departments: {
    all: ['departments'] as const,
    detail: (id: number) => ['departments', id] as const,
  },
  locations: {
    all: ['locations'] as const,
    detail: (id: number) => ['locations', id] as const,
  },
  employees: {
    all: ['employees'] as const,
    detail: (id: number) => ['employees', id] as const,
  },
  users: {
    all: ['users'] as const,
    detail: (id: number) => ['users', id] as const,
  },
  uoms: {
    all: ['uoms'] as const,
    detail: (id: number) => ['uoms', id] as const,
  },
  productCategories: {
    all: ['product-categories'] as const,
    detail: (id: number) => ['product-categories', id] as const,
  },
  productBrands: {
    all: ['product-brands'] as const,
    detail: (id: number) => ['product-brands', id] as const,
  },
  productGroups: {
    all: ['product-groups'] as const,
    detail: (id: number) => ['product-groups', id] as const,
  },
  products: {
    all: ['products'] as const,
    detail: (id: number) => ['products', id] as const,
  },
  productConversions: {
    all: ['product-conversions'] as const,
    detail: (id: number) => ['product-conversions', id] as const,
  },
  productPrices: {
    all: ['product-prices'] as const,
    detail: (id: number) => ['product-prices', id] as const,
  },
  customers: {
    all: ['customers'] as const,
    detail: (id: number) => ['customers', id] as const,
  },
  customerCredits: {
    all: ['customer-credits'] as const,
    detail: (id: number) => ['customer-credits', id] as const,
  },
  vendors: {
    all: ['vendors'] as const,
    detail: (id: number) => ['vendors', id] as const,
  },
  purchaseOrders: {
    all: ['purchase-orders'] as const,
    detail: (id: number) => ['purchase-orders', id] as const,
  },
  goodsReceives: {
    all: ['goods-receives'] as const,
    detail: (id: number) => ['goods-receives', id] as const,
  },
  stockAdjusts: {
    all: ['stock-adjusts'] as const,
    detail: (id: number) => ['stock-adjusts', id] as const,
  },
  stockMoves: {
    all: ['stock-moves'] as const,
    detail: (id: number) => ['stock-moves', id] as const,
  },
  stocks: {
    all: ['stocks'] as const,
    detail: (id: number) => ['stocks', id] as const,
  },
  stockCards: {
    all: ['stock-cards'] as const,
    detail: (id: number) => ['stock-cards', id] as const,
  },
  posConfig: {
    all: ['pos-config'] as const,
    detail: (id: number) => ['pos-config', id] as const,
  },
  sessions: {
    all: ['sessions'] as const,
    detail: (id: number) => ['sessions', id] as const,
  },
  posOrders: {
    all: ['pos-orders'] as const,
    detail: (id: number) => ['pos-orders', id] as const,
  },
  posReturns: {
    all: ['pos-returns'] as const,
    detail: (id: number) => ['pos-returns', id] as const,
  },
  dailyCloses: {
    all: ['daily-closes'] as const,
    detail: (id: number) => ['daily-closes', id] as const,
  },
  exchangeRates: {
    all: ['exchange-rates'] as const,
    detail: (id: number) => ['exchange-rates', id] as const,
  },
  tables: {
    all: ['tables'] as const,
    detail: (id: number) => ['tables', id] as const,
  },
}
