import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, integrationsApi } from '@/src/apis';

export const ORDERS_QUERY_KEY = 'orders';
export const SHOPIFY_ORDERS_QUERY_KEY = 'shopify-orders';

export function useOrders() {
  return useQuery({
    queryKey: [ORDERS_QUERY_KEY],
    queryFn: async () => {
      const data = await ordersApi.getAll();
      return Array.isArray(data?.orders) ? data.orders : [];
    },
    staleTime: 30000, // 30 seconds
  });
}

export function useShopifyOrders() {
  return useQuery({
    queryKey: [SHOPIFY_ORDERS_QUERY_KEY],
    queryFn: async () => {
      try {
        const data = await integrationsApi.getShopifyOrders();
        return Array.isArray(data?.orders) ? data.orders : [];
      } catch (error) {
        // If Shopify is not connected, return empty array
        return [];
      }
    },
    staleTime: 30000,
  });
}

export function useOrderById(id: string) {
  return useQuery({
    queryKey: [ORDERS_QUERY_KEY, id],
    queryFn: async () => {
      const data = await ordersApi.getById(id);
      return data.order;
    },
    enabled: !!id,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_QUERY_KEY] });
    },
  });
}

export function useBulkUpdateOrders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderIds, action }: { orderIds: string[]; action: string }) =>
      ordersApi.bulkUpdate(orderIds, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_QUERY_KEY] });
    },
  });
}
