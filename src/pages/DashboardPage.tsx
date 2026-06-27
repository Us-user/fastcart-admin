import { useTranslation } from 'react-i18next';

import { RecentTransactions } from '@/features/dashboard/components/RecentTransactions';
import { RevenueChart } from '@/features/dashboard/components/RevenueChart';
import { SummaryCards } from '@/features/dashboard/components/SummaryCards';
import { TopProductsByUnits } from '@/features/dashboard/components/TopProductsByUnits';
import { TopSellingProducts } from '@/features/dashboard/components/TopSellingProducts';

export function DashboardPage() {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">{t('nav.dashboard')}</h1>

      <div className="flex gap-6">
        {/* Main content column */}
        <div className="min-w-0 flex-1 flex flex-col gap-6">
          <SummaryCards />
          <RevenueChart />
          <div className="grid grid-cols-2 gap-6">
            <RecentTransactions />
            <TopProductsByUnits />
          </div>
        </div>

        {/* Right sidebar: Top Selling Products */}
        <div className="w-72 shrink-0">
          <TopSellingProducts />
        </div>
      </div>
    </div>
  );
}
