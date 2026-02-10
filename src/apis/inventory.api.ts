import { authFetch } from '@/utils/api';
import { API_ENDPOINTS } from '@/src/constants';
import type { InventoryItem, AdjustInventoryData, InventoryHistory } from '@/src/types';

export interface InventoryResponse {
  inventory: InventoryItem[];
}

export interface InventoryHistoryResponse {
  history: InventoryHistory[];
}

export const inventoryApi = {
  getAll: async (): Promise<InventoryResponse> => {
    return authFetch(API_ENDPOINTS.INVENTORY.LIST);
  },

  adjust: async (data: AdjustInventoryData): Promise<{ success: boolean }> => {
    return authFetch(API_ENDPOINTS.INVENTORY.ADJUST, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getHistory: async (sku: string, warehouseId: string): Promise<InventoryHistoryResponse> => {
    return authFetch(API_ENDPOINTS.INVENTORY.HISTORY(sku, warehouseId));
  },
};
