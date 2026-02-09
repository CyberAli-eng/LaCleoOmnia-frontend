export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    GOOGLE_LOGIN: '/auth/google',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // Orders
  ORDERS: {
    LIST: '/orders',
    BY_ID: (id: string) => `/orders/${id}`,
    UPDATE_STATUS: (id: string, status: string) => `/orders/${id}/${status.toLowerCase()}`,
    BULK_ACTION: (action: string) => `/orders/bulk/${action}`,
  },

  // Inventory
  INVENTORY: {
    LIST: '/inventory',
    ADJUST: '/inventory/adjust',
    HISTORY: (sku: string, warehouseId: string) =>
      `/inventory/history?sku=${sku}&warehouseId=${warehouseId}`,
  },

  // Integrations
  INTEGRATIONS: {
    CATALOG: '/integrations/catalog',
    CONNECTED_SUMMARY: '/integrations/connected-summary',
    SHOPIFY: {
      CONNECT: '/integrations/shopify/connect',
      SYNC: '/integrations/shopify/sync',
      ORDERS: '/integrations/shopify/orders',
      INVENTORY: '/integrations/shopify/inventory',
    },
  },

  // Analytics
  ANALYTICS: {
    OVERVIEW: '/analytics/overview',
    PROFIT_SUMMARY: '/analytics/profit-summary',
    REVENUE_BY_CHANNEL: '/analytics/revenue-by-channel',
  },

  // Webhooks
  WEBHOOKS: {
    LIST: '/webhooks',
    CREATE: '/webhooks',
    UPDATE: (id: string) => `/webhooks/${id}`,
    DELETE: (id: string) => `/webhooks/${id}`,
  },
} as const;
