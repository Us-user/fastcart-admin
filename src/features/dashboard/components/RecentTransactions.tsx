import { Skeleton } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { getStatusPillClasses } from '@/shared/lib/statusColors';
import { formatCurrency, formatDate } from '@/shared/lib/format';
import { useGetDashboardRecentTransactionsQuery } from '../dashboardApi';

export function RecentTransactions() {
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useGetDashboardRecentTransactionsQuery({ take: 10 });

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800">
      <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
        {t('dashboard.recentTransactions')}
      </h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-400">
            <th className="pb-3 font-medium">{t('dashboard.columns.name')}</th>
            <th className="pb-3 font-medium">{t('dashboard.columns.date')}</th>
            <th className="pb-3 font-medium">{t('dashboard.columns.amount')}</th>
            <th className="pb-3 font-medium">{t('dashboard.columns.status')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td className="py-3"><Skeleton width={100} height={14} /></td>
                  <td className="py-3"><Skeleton width={80} height={14} /></td>
                  <td className="py-3"><Skeleton width={60} height={14} /></td>
                  <td className="py-3"><Skeleton width={60} height={24} className="rounded-full" /></td>
                </tr>
              ))
            : (data ?? []).map((tx) => (
                <tr key={tx.id}>
                  <td className="py-3 font-medium text-gray-900 dark:text-white">{tx.customerName}</td>
                  <td className="py-3 text-gray-500 dark:text-gray-400">
                    {formatDate(tx.date, i18n.language)}
                  </td>
                  <td className="py-3 text-gray-700 dark:text-gray-300">
                    {formatCurrency(tx.amount, i18n.language)}
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusPillClasses(tx.paymentStatus)}`}
                    >
                      {t(`orders.paymentStatus.${tx.paymentStatus}`)}
                    </span>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
