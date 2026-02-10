import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { integrationsApi } from '@/src/apis';
import type { ShopifyCredentials } from '@/src/types';

export const INTEGRATIONS_CATALOG_QUERY_KEY = 'integrations-catalog';
export const CONNECTED_SUMMARY_QUERY_KEY = 'connected-summary';

export function useIntegrationsCatalog() {
  return useQuery({
    queryKey: [INTEGRATIONS_CATALOG_QUERY_KEY],
    queryFn: async () => {
      const data = await integrationsApi.getCatalog();
      return Array.isArray(data?.integrations) ? data.integrations : [];
    },
    staleTime: 300000, // 5 minutes
  });
}

export function useConnectedSummary() {
  return useQuery({
    queryKey: [CONNECTED_SUMMARY_QUERY_KEY],
    queryFn: () => integrationsApi.getConnectedSummary(),
    staleTime: 60000, // 1 minute
  });
}

export function useConnectShopify() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: ShopifyCredentials) =>
      integrationsApi.connectShopify(credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONNECTED_SUMMARY_QUERY_KEY] });
    },
  });
}

export function useSyncShopify() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => integrationsApi.syncShopify(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['shopify-orders'] });
    },
  });
}
