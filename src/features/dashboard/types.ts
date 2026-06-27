import type { PaymentStatus } from '@/features/orders/types';

/** `GET /admin/dashboard/summary?from&to` */
export interface DashboardSummary {
  sales: number;
  cost: number;
  profit: number;
}

/** One month's data point from `GET /admin/dashboard/revenue?year` */
export interface RevenueDataPoint {
  month: number;
  revenue: number;
  orders: number;
}

/**
 * One item from `GET /admin/dashboard/top-products?metric&take`.
 * The same shape is used for both "sales" and "units" metrics.
 */
export interface TopProductItem {
  id: number;
  name: string;
  imageUrl: string | null;
  categoryName: string | null;
  sales: number;
  units: number;
  price: number;
}

/** One row from `GET /admin/dashboard/recent-transactions?take` */
export interface RecentTransaction {
  id: number;
  customerName: string;
  date: string;
  amount: number;
  paymentStatus: PaymentStatus;
}

export interface GetSummaryArgs {
  from?: string;
  to?: string;
}

export interface GetRevenueArgs {
  year?: number;
}

export interface GetTopProductsArgs {
  metric?: 'sales' | 'units';
  take?: number;
}

export interface GetRecentTransactionsArgs {
  take?: number;
}
