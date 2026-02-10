import { authFetch } from '@/utils/api';
import { API_ENDPOINTS } from '@/src/constants';
import type { Order } from '@/src/types';

export interface OrdersResponse {
  orders: Order[];
}

export interface BulkActionRequest {
  orderIds: string[];
}

export const ordersApi = {
  getAll: async (): Promise<OrdersResponse> => {
    return authFetch(API_ENDPOINTS.ORDERS.LIST);
  },

  getById: async (id: string): Promise<{ order: Order }> => {
    return authFetch(API_ENDPOINTS.ORDERS.BY_ID(id));
  },

  updateStatus: async (id: string, status: string): Promise<{ order: Order }> => {
    return authFetch(API_ENDPOINTS.ORDERS.UPDATE_STATUS(id, status), {
      method: 'POST',
    });
  },

  bulkUpdate: async (orderIds: string[], action: string): Promise<{ success: boolean }> => {
    return authFetch(API_ENDPOINTS.ORDERS.BULK_ACTION(action), {
      method: 'POST',
      body: JSON.stringify({ orderIds }),
    });
  },
};
