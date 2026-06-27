import { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { Button, Checkbox, IconButton, InputAdornment, MenuItem, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { formatCurrency, formatDateTime } from '@/shared/lib/format';
import { getStatusPillClasses } from '@/shared/lib/statusColors';
import { DataState } from '@/shared/ui/DataState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { PageHeader } from '@/shared/ui/PageHeader';
import { PaginationFooter } from '@/shared/ui/PaginationFooter';
import { useGetOrdersQuery } from '../ordersApi';
import type { OrderListItem, OrderSort } from '../types';

const PAGE_SIZE = 20;

const SORT_OPTIONS: { value: OrderSort; labelKey: string }[] = [
  { value: 'newest', labelKey: 'orders.sort.newest' },
  { value: 'oldest', labelKey: 'orders.sort.oldest' },
  { value: 'total_asc', labelKey: 'orders.sort.totalAsc' },
  { value: 'total_desc', labelKey: 'orders.sort.totalDesc' },
];


/**
 * Orders list (TRD §5.2, mockups `Orders.png` / `Orders-1.png`): searchable,
 * filterable, paginated table with multi-select and bulk-action toolbar.
 */
export function OrdersList() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState('');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<OrderSort>('newest');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    const id = setTimeout(() => {
      setQ(searchInput.trim());
      setPage(1);
      setSelected([]);
    }, 400);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data, isLoading, isError, refetch } = useGetOrdersQuery({
    q: q || undefined,
    sort,
    pageNumber: page,
    pageSize: PAGE_SIZE,
  });

  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const hasOrders = totalCount > 0;

  const allSelected = items.length > 0 && selected.length === items.length;
  const someSelected = selected.length > 0 && !allSelected;

  const toggleAll = () => setSelected(allSelected ? [] : items.map((o) => o.id));
  const toggleOne = (id: number) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));

  const changePage = (next: number) => {
    setPage(next);
    setSelected([]);
  };
  const changeSort = (next: OrderSort) => {
    setSort(next);
    setPage(1);
    setSelected([]);
  };

  const goToDetail = (id: number) => navigate(`/orders/${id}`);
  const goToCreate = () => navigate('/orders/new');

  return (
    <div>
      <PageHeader
        title={t('nav.orders')}
        action={
          hasOrders ? (
            <Button variant="contained" startIcon={<AddIcon />} onClick={goToCreate}>
              {t('orders.addOrder')}
            </Button>
          ) : undefined
        }
      />

      <DataState
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        isEmpty={!q && !hasOrders}
        emptyState={
          <EmptyState
            icon={<ListAltOutlinedIcon sx={{ fontSize: 32 }} />}
            title={t('orders.empty.title')}
            description={t('orders.empty.description')}
            action={
              <Button variant="contained" startIcon={<AddIcon />} onClick={goToCreate}>
                {t('orders.addOrder')}
              </Button>
            }
          />
        }
      >
        {/* Toolbar */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <TextField
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('common.searchPlaceholder')}
              className="w-72"
              slotProps={{
                htmlInput: { 'aria-label': t('common.search') },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon fontSize="small" className="text-slate-400" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              select
              label={t('orders.filter')}
              value={sort}
              onChange={(e) => changeSort(e.target.value as OrderSort)}
              sx={{ minWidth: 170 }}
            >
              {SORT_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {t(opt.labelKey)}
                </MenuItem>
              ))}
            </TextField>
          </div>

          <div className="flex items-center gap-2">
            <IconButton
              onClick={() => selected.length === 1 && goToDetail(selected[0])}
              disabled={selected.length !== 1}
              aria-label={t('orders.editSelected')}
              className="rounded-lg border border-slate-200 dark:border-slate-700"
              sx={{ borderRadius: 2 }}
            >
              <EditOutlinedIcon fontSize="small" className="text-blue-600 dark:text-blue-400" />
            </IconButton>
            {/* Delete is not supported by the orders API (TRD §10); icon is present to
                match the mockup but is permanently disabled. */}
            <IconButton
              disabled
              aria-label={t('orders.deleteSelected')}
              className="rounded-lg border border-slate-200 dark:border-slate-700"
              sx={{ borderRadius: 2 }}
            >
              <DeleteOutlineIcon fontSize="small" className="text-red-400" />
            </IconButton>
          </div>
        </div>

        {items.length === 0 ? (
          <p className="mt-10 text-center text-sm text-slate-400 dark:text-slate-500">
            {t('orders.noSearchResults')}
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-400 dark:border-slate-700 dark:text-slate-500">
                    <th scope="col" className="w-10 py-3 pr-2">
                      <Checkbox
                        checked={allSelected}
                        indeterminate={someSelected}
                        onChange={toggleAll}
                        size="small"
                        slotProps={{ input: { 'aria-label': t('orders.selectAll') } }}
                      />
                    </th>
                    <th scope="col" className="py-3 pr-4 font-medium">{t('orders.columns.order')}</th>
                    <th scope="col" className="py-3 pr-4 font-medium">{t('orders.columns.date')}</th>
                    <th scope="col" className="py-3 pr-4 font-medium">{t('orders.columns.customer')}</th>
                    <th scope="col" className="py-3 pr-4 font-medium">{t('orders.columns.paymentStatus')}</th>
                    <th scope="col" className="py-3 pr-4 font-medium">{t('orders.columns.orderStatus')}</th>
                    <th scope="col" className="py-3 pr-4 text-right font-medium">
                      {t('orders.columns.total')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((order) => {
                    const isSelected = selected.includes(order.id);
                    return (
                      <OrderRow
                        key={order.id}
                        order={order}
                        isSelected={isSelected}
                        lang={i18n.language}
                        onToggle={() => toggleOne(order.id)}
                        onClick={() => goToDetail(order.id)}
                        t={t}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>

            {data && data.totalPages > 1 && (
              <PaginationFooter
                page={page}
                pageCount={data.totalPages}
                totalCount={totalCount}
                onChange={changePage}
              />
            )}
          </>
        )}
      </DataState>
    </div>
  );
}

interface OrderRowProps {
  order: OrderListItem;
  isSelected: boolean;
  lang: string;
  onToggle: () => void;
  onClick: () => void;
  t: (key: string) => string;
}

function OrderRow({ order, isSelected, lang, onToggle, onClick, t }: OrderRowProps) {
  const orderLabel = order.orderNumber ? `#${order.orderNumber}` : `#${order.id}`;

  return (
    <tr
      className={`cursor-pointer border-b border-slate-100 transition-colors dark:border-slate-800 ${
        isSelected
          ? 'bg-blue-50/60 dark:bg-blue-500/5'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
      }`}
    >
      <td
        className="py-3 pr-2"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        <Checkbox
          checked={isSelected}
          onChange={onToggle}
          size="small"
          slotProps={{ input: { 'aria-label': t('orders.selectRow') } }}
        />
      </td>
      <td className="py-3 pr-4 font-medium text-slate-900 dark:text-white" onClick={onClick}>
        {orderLabel}
      </td>
      <td className="py-3 pr-4 text-slate-600 dark:text-slate-300" onClick={onClick}>
        {formatDateTime(order.createdAt, lang)}
      </td>
      <td className="py-3 pr-4 text-slate-700 dark:text-slate-200" onClick={onClick}>
        {order.customerName}
      </td>
      <td className="py-3 pr-4" onClick={onClick}>
        <StatusPill status={order.paymentStatus} />
      </td>
      <td className="py-3 pr-4" onClick={onClick}>
        <StatusPill status={order.orderStatus} />
      </td>
      <td className="py-3 pr-4 text-right font-medium text-slate-900 dark:text-white" onClick={onClick}>
        {formatCurrency(order.total, lang)}
      </td>
    </tr>
  );
}

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-md px-2.5 py-1 text-xs font-medium ${getStatusPillClasses(status)}`}
    >
      {status}
    </span>
  );
}
