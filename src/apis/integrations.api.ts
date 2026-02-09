import { authFetch } from '@/utils/api';
import { API_ENDPOINTS } from '@/src/constants';
import type {
  Integration,
  ShopifyCredentials,
  IntegrationCatalog,
  ConnectedSummary,
  ShopifyOrder,
} from '@/src/types';

export interface IntegrationCatalogResponse {
  integrations: IntegrationCatalog[];
}

export interface ShopifyOrdersResponse {
  orders: ShopifyOrder[];
}

export const integrationsApi = {
  getCatalog: async (): Promise<IntegrationCatalogResponse> => {
    return authFetch(API_ENDPOINTS.INTEGRATIONS.CATALOG);
  },

  getConnectedSummary: async (): Promise<ConnectedSummary> => {
    return authFetch(API_ENDPOINTS.INTEGRATIONS.CONNECTED_SUMMARY);
  },

  connectShopify: async (credentials: ShopifyCredentials): Promise<{ success: boolean }> => {
    return authFetch(API_ENDPOINTS.INTEGRATIONS.SHOPIFY.CONNECT, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  syncShopify: async (): Promise<{ success: boolean }> => {
    return authFetch(API_ENDPOINTS.INTEGRATIONS.SHOPIFY.SYNC, {
      method: 'POST',
    });
  },

  getShopifyOrders: async (): Promise<ShopifyOrdersResponse> => {
    return authFetch(API_ENDPOINTS.INTEGRATIONS.SHOPIFY.ORDERS);
  },

  getShopifyInventory: async (): Promise<any> => {
    return authFetch(API_ENDPOINTS.INTEGRATIONS.SHOPIFY.INVENTORY);
  },
};
