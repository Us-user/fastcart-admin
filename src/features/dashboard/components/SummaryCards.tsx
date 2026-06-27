import { Skeleton } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import PaidIcon from '@mui/icons-material/Paid';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTranslation } from 'react-i18next';

import { formatCompactCurrency } from '@/shared/lib/format';
import { useGetDashboardSummaryQuery } from '../dashboardApi';

interface CardConfig {
  key: 'sales' | 'cost' | 'profit';
  labelKey: string;
  icon: React.ElementType;
  bg: string;
  iconBg: string;
  iconColor: string;
}

const CARDS: CardConfig[] = [
  {
    key: 'sales',
    labelKey: 'dashboard.sales',
    icon: BarChartIcon,
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    iconBg: 'bg-rose-100 dark:bg-rose-900/40',
    iconColor: 'text-rose-500',
  },
  {
    key: 'cost',
    labelKey: 'dashboard.cost',
    icon: PaidIcon,
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    iconBg: 'bg-orange-100 dark:bg-orange-900/40',
    iconColor: 'text-orange-500',
  },
  {
    key: 'profit',
    labelKey: 'dashboard.profit',
    icon: CheckCircleIcon,
    bg: 'bg-green-50 dark:bg-green-950/30',
    iconBg: 'bg-green-100 dark:bg-green-900/40',
    iconColor: 'text-green-500',
  },
];

export function SummaryCards() {
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useGetDashboardSummaryQuery();

  return (
    <div className="grid grid-cols-3 gap-4">
      {CARDS.map(({ key, labelKey, icon: Icon, bg, iconBg, iconColor }) => (
        <div
          key={key}
          className={`flex items-center gap-4 rounded-xl p-5 ${bg}`}
        >
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
            <Icon className={iconColor} />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t(labelKey)}</p>
            {isLoading ? (
              <Skeleton width={80} height={32} />
            ) : (
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data ? formatCompactCurrency(data[key], i18n.language) : '—'}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
