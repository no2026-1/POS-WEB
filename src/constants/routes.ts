export const ROUTES = {
  // Public
  LOGIN: '/login',

  // Dashboard
  DASHBOARD: '/dashboard',

  // Master Data
  BRANCH: '/branch',
  BASIC: '/basic',
  DEPARTMENT: '/department',
  LOCATION: '/location',
  EMPLOYEE: '/employee',
  USER: '/user',

  // Product
  UOM: '/uom',
  PRODUCT_CATEGORY: '/product-category',
  PRODUCT_BRAND: '/product-brand',
  PRODUCT_GROUP: '/product-group',
  PRODUCT: '/product',

  // Partners
  CUSTOMER: '/customer',
  VENDOR: '/vendor',

  // Inventory
  PURCHASE_ORDER: '/purchase-order',
  PURCHASE_ORDER_DETAIL: '/purchase-order/:id',
  GOODS_RECEIVE: '/goods-receive',
  STOCK_ADJUST: '/stock-adjust',
  STOCK_ADJUST_DETAIL: '/stock-adjust/:id',
  STOCK_MOVE: '/stock-move',
  STOCK_MOVE_DETAIL: '/stock-move/:id',
  STOCK: '/stock',

  // POS
  POS_CONFIG: '/pos-config',
  SESSION: '/session',
  POS: '/pos',
  POS_HISTORY: '/pos-history',
  POS_RETURN: '/pos-return',
  POS_RETURN_DETAIL: '/pos-return/:id',

  // Reports
  DAILY_CLOSE: '/daily-close',
  STOCK_CARD: '/stock-card',
  CUSTOMER_CREDIT: '/customer-credit',

  // Settings
  EXCHANGE_RATE: '/exchange-rate',
  PRODUCT_CONVERSION: '/product-conversion',
  PRODUCT_PRICE: '/product-price',
  TABLES: '/tables',

  // Master Data (new)
  COMPANY: '/company',

  // Admin
  APPROVAL: '/approval',
  PERMISSION: '/permission',

  // Reports
  REPORTS: '/reports',
} as const
