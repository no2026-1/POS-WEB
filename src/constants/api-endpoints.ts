export const API = {
  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_ME: '/auth/me',

  // Master Data
  BRANCH: '/branch',
  BASIC: '/basic',
  BASIC_LINES: (id: number) => `/basic/${id}/lines`,
  BASIC_LINE: (lineId: number) => `/basic/lines/${lineId}`,
  DEPARTMENT: '/department',
  LOCATION: '/location',
  EMPLOYEE: '/employee',
  USERS: '/users',

  // Product
  UOMS: '/uoms',
  PRODUCT_CATEGORIES: '/product-categories',
  PRODUCT_BRANDS: '/product-brands',
  PRODUCT_GROUPS: '/product-groups',
  PRODUCTS: '/products',
  PRODUCT_CONVERSIONS: '/product-conversions',
  PRODUCT_PRICES: '/product-prices',

  // Partners
  CUSTOMERS: '/customers',
  VENDORS: '/vendors',

  // Inventory
  PURCHASE_ORDERS: '/purchase-orders',
  GOODS_RECEIVES: '/goods-receives',
  STOCK_ADJUSTS: '/stock-adjusts',
  STOCK_MOVES: '/stock-moves',
  STOCKS: '/stocks',
  STOCK_CARDS: '/stock-cards',

  // POS
  POS_CONFIG: '/pos-config',
  SESSIONS: '/sessions',
  POS_ORDERS: '/pos-orders',
  POS_ORDER_LINES: '/pos-order-lines',
  PAYMENTS: '/payments',
  POS_RETURNS: '/pos-returns',
  POS_RETURN_LINES: '/pos-return-lines',

  // Reports
  DAILY_CLOSES: '/daily-closes',
  CUSTOMER_CREDITS: '/customer-credits',

  // Settings
  EXCHANGE_RATES: '/exchange-rates',
  TABLES: '/tables',
} as const
