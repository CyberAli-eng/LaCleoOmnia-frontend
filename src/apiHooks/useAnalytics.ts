import { useQuery } from '@tanstack/react-query';
import { analyticsApi, type DateRangeParams } from '@/src/apis';

export const ANALYTICS_OVERVIEW_QUERY_KEY = 'analytics-overview';
export const PROFIT_SUMMARY_QUERY_KEY = 'profit-summary';
export const REVENUE_BY_CHANNEL_QUERY_KEY = 'revenue-by-channel';

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: [ANALYTICS_OVERVIEW_QUERY_KEY],
    queryFn: () => analyticsApi.getOverview(),
    staleTime: 60000, // 1 minute
  });
}

export function useProfitSummary() {
  return useQuery({
    queryKey: [PROFIT_SUMMARY_QUERY_KEY],
    queryFn: () => analyticsApi.getProfitSummary(),
    staleTime: 60000,
  });
}

export function useRevenueByChannel(params: DateRangeParams) {
  return useQuery({
    queryKey: [REVENUE_BY_CHANNEL_QUERY_KEY, params],
    queryFn: () => analyticsApi.getRevenueByChannel(params),
    enabled: !!(params.startDate && params.endDate),
    staleTime: 60000,
  });
}
