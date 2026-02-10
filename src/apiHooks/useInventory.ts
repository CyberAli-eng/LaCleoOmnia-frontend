import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '@/src/apis';
import type { AdjustInventoryData } from '@/src/types';

export const INVENTORY_QUERY_KEY = 'inventory';
export const INVENTORY_HISTORY_QUERY_KEY = 'inventory-history';

export function useInventory() {
  return useQuery({
    queryKey: [INVENTORY_QUERY_KEY],
    queryFn: async () => {
      const data = await inventoryApi.getAll();
      return Array.isArray(data?.inventory) ? data.inventory : [];
    },
    staleTime: 60000, // 1 minute
  });
}

export function useInventoryHistory(sku: string, warehouseId: string) {
  return useQuery({
    queryKey: [INVENTORY_HISTORY_QUERY_KEY, sku, warehouseId],
    queryFn: async () => {
      const data = await inventoryApi.getHistory(sku, warehouseId);
      return Array.isArray(data?.history) ? data.history : [];
    },
    enabled: !!sku && !!warehouseId,
  });
}

export function useAdjustInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdjustInventoryData) => inventoryApi.adjust(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVENTORY_QUERY_KEY] });
    },
  });
}
