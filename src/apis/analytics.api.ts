import { authFetch } from '@/utils/api';
import { API_ENDPOINTS } from '@/src/constants';

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

export const analyticsApi = {
  getOverview: async (): Promise<any> => {
    return authFetch(API_ENDPOINTS.ANALYTICS.OVERVIEW);
  },

  getProfitSummary: async (): Promise<any> => {
    return authFetch(API_ENDPOINTS.ANALYTICS.PROFIT_SUMMARY);
  },

  getRevenueByChannel: async (params: DateRangeParams): Promise<any> => {
    const queryParams = new URLSearchParams(params as Record<string, string>).toString();
    return authFetch(`${API_ENDPOINTS.ANALYTICS.REVENUE_BY_CHANNEL}?${queryParams}`);
  },
};
