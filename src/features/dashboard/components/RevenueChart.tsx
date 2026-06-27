import { useState } from 'react';
import { MenuItem, Select, Skeleton, type SelectChangeEvent } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTranslation } from 'react-i18next';

import { useGetDashboardRevenueQuery } from '../dashboardApi';

const MONTH_KEYS = [
  'dashboard.months.jan',
  'dashboard.months.feb',
  'dashboard.months.mar',
  'dashboard.months.apr',
  'dashboard.months.may',
  'dashboard.months.jun',
  'dashboard.months.jul',
  'dashboard.months.aug',
  'dashboard.months.sep',
  'dashboard.months.oct',
  'dashboard.months.nov',
  'dashboard.months.dec',
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR - 2, CURRENT_YEAR - 1, CURRENT_YEAR];

interface ChartEntry {
  monthLabel: string;
  revenue: number;
  orders: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: ChartEntry }>;
  label?: string;
}

function ChartTooltip({ active, payload, label }: CustomTooltipProps) {
  const { t } = useTranslation();
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-gray-900 px-3 py-2 text-center text-sm text-white shadow-lg">
      <p className="font-semibold">
        {payload[0].value?.toLocaleString()} {t('dashboard.orders')}
      </p>
      <p className="text-gray-300">{label}</p>
    </div>
  );
}

export function RevenueChart() {
  const { t } = useTranslation();
  const [year, setYear] = useState(CURRENT_YEAR);
  const { data, isLoading } = useGetDashboardRevenueQuery({ year });

  const chartData = (data ?? []).map((pt) => ({
    monthLabel: t(MONTH_KEYS[pt.month - 1] ?? ''),
    revenue: pt.revenue,
    orders: pt.orders,
  }));

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {t('dashboard.salesRevenue')}
        </h2>
        <Select
          size="small"
          value={String(year)}
          onChange={(e: SelectChangeEvent) => setYear(Number(e.target.value))}
          sx={{ minWidth: 90 }}
        >
          {YEAR_OPTIONS.map((y) => (
            <MenuItem key={y} value={String(y)}>
              {y}
            </MenuItem>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <Skeleton variant="rectangular" height={260} className="rounded-lg" />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="monthLabel"
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip
              content={(props) => (
                <ChartTooltip
                  active={props.active}
                  payload={props.payload as unknown as CustomTooltipProps['payload']}
                  label={String(props.label ?? '')}
                />
              )}
              cursor={{ stroke: '#2563EB', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#2563EB"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#2563EB', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#fff', stroke: '#2563EB', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
