import { baseApi } from '@/shared/api/baseApi';
import type { ApiEnvelope } from '@/shared/api/types';
import type {
  DashboardSummary,
  GetRecentTransactionsArgs,
  GetRevenueArgs,
  GetSummaryArgs,
  GetTopProductsArgs,
  RecentTransaction,
  RevenueDataPoint,
  TopProductItem,
} from './types';

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<DashboardSummary, GetSummaryArgs | void>({
      query: (arg) => ({
        url: '/admin/dashboard/summary',
        params: { from: arg?.from, to: arg?.to },
      }),
      transformResponse: (raw: ApiEnvelope<DashboardSummary>) => raw.data,
      providesTags: [{ type: 'Dashboard', id: 'SUMMARY' }],
    }),

    getDashboardRevenue: builder.query<RevenueDataPoint[], GetRevenueArgs | void>({
      query: (arg) => ({
        url: '/admin/dashboard/revenue',
        params: { year: arg?.year },
      }),
      transformResponse: (raw: ApiEnvelope<RevenueDataPoint[]>) => raw.data,
      providesTags: [{ type: 'Dashboard', id: 'REVENUE' }],
    }),

    getDashboardTopProducts: builder.query<TopProductItem[], GetTopProductsArgs | void>({
      query: (arg) => ({
        url: '/admin/dashboard/top-products',
        params: { metric: arg?.metric, take: arg?.take },
      }),
      transformResponse: (raw: ApiEnvelope<TopProductItem[]>) => raw.data,
      providesTags: (_r, _e, arg) => [
        { type: 'Dashboard', id: `TOP_${String(arg?.metric ?? 'sales').toUpperCase()}` },
      ],
    }),

    getDashboardRecentTransactions: builder.query<RecentTransaction[], GetRecentTransactionsArgs | void>({
      query: (arg) => ({
        url: '/admin/dashboard/recent-transactions',
        params: { take: arg?.take },
      }),
      transformResponse: (raw: ApiEnvelope<RecentTransaction[]>) => raw.data,
      providesTags: [{ type: 'Dashboard', id: 'TRANSACTIONS' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDashboardSummaryQuery,
  useGetDashboardRevenueQuery,
  useGetDashboardTopProductsQuery,
  useGetDashboardRecentTransactionsQuery,
} = dashboardApi;
