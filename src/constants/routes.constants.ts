export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  ONBOARDING: '/onboarding',
  PRIVACY: '/privacy',
  TERMS: '/terms',

  // Auth
  AUTH_SHOPIFY: '/auth/shopify',

  // Dashboard
  DASHBOARD: '/dashboard',
  DASHBOARD_ORDERS: '/dashboard/orders',
  DASHBOARD_INVENTORY: '/dashboard/inventory',
  DASHBOARD_ANALYTICS: '/dashboard/analytics',
  DASHBOARD_AUDIT: '/dashboard/audit',
  DASHBOARD_LABELS: '/dashboard/labels',
  DASHBOARD_COSTS: '/dashboard/costs',
  DASHBOARD_USERS: '/dashboard/users',
  DASHBOARD_WORKERS: '/dashboard/workers',
  DASHBOARD_INTEGRATIONS: '/dashboard/integrations',
  DASHBOARD_WEBHOOKS: '/dashboard/webhooks',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = typeof ROUTES[RouteKey];
