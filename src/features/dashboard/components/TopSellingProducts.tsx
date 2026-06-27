import { Skeleton } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { formatCompactCurrency } from '@/shared/lib/format';
import { useGetDashboardTopProductsQuery } from '../dashboardApi';

export function TopSellingProducts() {
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useGetDashboardTopProductsQuery({ metric: 'sales', take: 5 });

  return (
    <div className="flex h-full flex-col rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {t('dashboard.topSellingProducts')}
        </h2>
        <Link
          to="/products"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          {t('dashboard.seeAll')}
          <ArrowForwardIcon sx={{ fontSize: 16 }} />
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton variant="rectangular" width={48} height={48} className="rounded-lg" />
                <div className="flex-1">
                  <Skeleton width="70%" height={16} />
                  <Skeleton width="50%" height={14} />
                </div>
                <Skeleton width={60} height={16} />
              </div>
            ))
          : (data ?? []).map((product) => (
              <div key={product.id} className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-slate-700">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-400">{product.categoryName ?? '—'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {formatCompactCurrency(product.sales, i18n.language)}
                  </p>
                  <p className="text-xs text-gray-400">{t('dashboard.inSales')}</p>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
