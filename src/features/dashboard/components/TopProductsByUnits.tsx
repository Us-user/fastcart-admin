import { Skeleton } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { formatCurrency } from '@/shared/lib/format';
import { useGetDashboardTopProductsQuery } from '../dashboardApi';

export function TopProductsByUnits() {
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useGetDashboardTopProductsQuery({ metric: 'units', take: 5 });

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800">
      <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
        {t('dashboard.topProductsByUnits')}
      </h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-400">
            <th className="pb-3 font-medium">{t('dashboard.columns.name')}</th>
            <th className="pb-3 font-medium text-right">{t('dashboard.columns.price')}</th>
            <th className="pb-3 font-medium text-right">{t('dashboard.columns.units')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <Skeleton variant="rectangular" width={40} height={40} className="rounded-lg" />
                      <Skeleton width={100} height={14} />
                    </div>
                  </td>
                  <td className="py-3 text-right"><Skeleton width={60} height={14} className="ml-auto" /></td>
                  <td className="py-3 text-right"><Skeleton width={40} height={14} className="ml-auto" /></td>
                </tr>
              ))
            : (data ?? []).map((product) => (
                <tr key={product.id}>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-slate-700">
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
                      <span className="font-medium text-gray-900 dark:text-white">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-right text-gray-600 dark:text-gray-300">
                    {formatCurrency(product.price, i18n.language)}
                  </td>
                  <td className="py-3 text-right font-medium text-gray-900 dark:text-white">
                    {product.units.toLocaleString(i18n.language)}
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
