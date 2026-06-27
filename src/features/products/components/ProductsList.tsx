import { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { Button, Checkbox, IconButton, InputAdornment, MenuItem, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { getApiErrorMessage } from '@/shared/lib/apiError';
import { formatPriceRange } from '@/shared/lib/format';
import { getStatusPillClasses } from '@/shared/lib/statusColors';
import { useSnackbar } from '@/shared/lib/useSnackbar';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { DataState } from '@/shared/ui/DataState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { PageHeader } from '@/shared/ui/PageHeader';
import { PaginationFooter } from '@/shared/ui/PaginationFooter';
import {
  useBulkDeleteProductsMutation,
  useDeleteProductMutation,
  useGetProductsQuery,
} from '../productsApi';
import type { ProductListItem, ProductSort } from '../types';

const PAGE_SIZE = 20;

const SORT_OPTIONS: { value: ProductSort; labelKey: string }[] = [
  { value: 'newest', labelKey: 'products.sort.newest' },
  { value: 'price_asc', labelKey: 'products.sort.priceAsc' },
  { value: 'price_desc', labelKey: 'products.sort.priceDesc' },
  { value: 'rating', labelKey: 'products.sort.topRated' },
];

/**
 * Products list (TRD §5.3, mockup `Products.png`): searchable, sortable, paged
 * table with multi-select and single/bulk delete. The "Add product" action is
 * hidden in the genuine empty state to match the empty-state mockup.
 */
export function ProductsList() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const [searchInput, setSearchInput] = useState('');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<ProductSort>('newest');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [pendingDelete, setPendingDelete] = useState<ProductListItem | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  // Debounce the search box so each keystroke doesn't fire a request.
  useEffect(() => {
    const id = setTimeout(() => {
      setQ(searchInput.trim());
      setPage(1);
      setSelected([]);
    }, 400);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data, isLoading, isError, refetch } = useGetProductsQuery({
    q: q || undefined,
    sort,
    pageNumber: page,
    pageSize: PAGE_SIZE,
  });
  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();
  const [bulkDelete, { isLoading: bulkDeleting }] = useBulkDeleteProductsMutation();

  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const hasProducts = totalCount > 0;

  const allSelected = items.length > 0 && selected.length === items.length;
  const someSelected = selected.length > 0 && !allSelected;

  const toggleAll = () => setSelected(allSelected ? [] : items.map((p) => p.id));
  const toggleOne = (id: number) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));

  const changePage = (next: number) => {
    setPage(next);
    setSelected([]);
  };
  const changeSort = (next: ProductSort) => {
    setSort(next);
    setPage(1);
    setSelected([]);
  };

  const goToEdit = (id: number) => navigate(`/products/${id}/edit`);
  const goToCreate = () => navigate('/products/new');

  const confirmSingleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteProduct(pendingDelete.id).unwrap();
      setSelected((prev) => prev.filter((v) => v !== pendingDelete.id));
      snackbar.success(t('products.toast.deleted'));
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.deleteError')));
    } finally {
      setPendingDelete(null);
    }
  };

  const confirmBulkDelete = async () => {
    try {
      await bulkDelete(selected).unwrap();
      snackbar.success(t('products.toast.bulkDeleted', { count: selected.length }));
      setSelected([]);
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.deleteError')));
    } finally {
      setBulkOpen(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={t('nav.products')}
        action={
          hasProducts ? (
            <Button variant="contained" startIcon={<AddIcon />} onClick={goToCreate}>
              {t('products.addProduct')}
            </Button>
          ) : undefined
        }
      />

      <DataState
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        isEmpty={!q && !hasProducts}
        emptyState={
          <EmptyState
            icon={<ShoppingBagOutlinedIcon sx={{ fontSize: 32 }} />}
            title={t('products.empty.title')}
            description={t('products.empty.description')}
            action={
              <Button variant="contained" startIcon={<AddIcon />} onClick={goToCreate}>
                {t('products.addProduct')}
              </Button>
            }
          />
        }
      >
        {/* Toolbar: search + sort filter, bulk actions on the right */}
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
              label={t('products.filter')}
              value={sort}
              onChange={(e) => changeSort(e.target.value as ProductSort)}
              sx={{ minWidth: 170 }}
            >
              {SORT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </MenuItem>
              ))}
            </TextField>
          </div>

          <div className="flex items-center gap-2">
            <IconButton
              onClick={() => selected.length === 1 && goToEdit(selected[0])}
              disabled={selected.length !== 1}
              aria-label={t('products.bulkEdit')}
              className="rounded-lg border border-slate-200 dark:border-slate-700"
              sx={{ borderRadius: 2 }}
            >
              <EditOutlinedIcon fontSize="small" className="text-blue-600 dark:text-blue-400" />
            </IconButton>
            <IconButton
              onClick={() => setBulkOpen(true)}
              disabled={selected.length === 0}
              aria-label={t('products.bulkDelete')}
              className="rounded-lg border border-slate-200 dark:border-slate-700"
              sx={{ borderRadius: 2 }}
            >
              <DeleteOutlineIcon fontSize="small" className="text-red-500" />
            </IconButton>
          </div>
        </div>

        {items.length === 0 ? (
          <p className="mt-10 text-center text-sm text-slate-400 dark:text-slate-500">
            {t('products.noSearchResults')}
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-400 dark:border-slate-700 dark:text-slate-500">
                    <th className="w-10 py-3 pr-2">
                      <Checkbox
                        checked={allSelected}
                        indeterminate={someSelected}
                        onChange={toggleAll}
                        size="small"
                        slotProps={{ input: { 'aria-label': t('products.selectAll') } }}
                      />
                    </th>
                    <th className="py-3 pr-4 font-medium">{t('products.columns.product')}</th>
                    <th className="py-3 pr-4 font-medium">{t('products.columns.inventory')}</th>
                    <th className="py-3 pr-4 font-medium">{t('products.columns.category')}</th>
                    <th className="py-3 pr-4 font-medium">{t('products.columns.price')}</th>
                    <th className="py-3 pr-4 text-right font-medium">
                      {t('products.columns.action')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((product) => {
                    const isSelected = selected.includes(product.id);
                    return (
                      <tr
                        key={product.id}
                        className={`border-b border-slate-100 transition-colors dark:border-slate-800 ${
                          isSelected
                            ? 'bg-blue-50/60 dark:bg-blue-500/5'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-3 pr-2">
                          <Checkbox
                            checked={isSelected}
                            onChange={() => toggleOne(product.id)}
                            size="small"
                            slotProps={{
                              input: {
                                'aria-label': t('products.selectRow', { name: product.name }),
                              },
                            }}
                          />
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3">
                            {product.primaryImageUrl ? (
                              <img
                                src={product.primaryImageUrl}
                                alt={product.name}
                                className="h-10 w-10 shrink-0 rounded-lg object-cover"
                              />
                            ) : (
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500">
                                <ShoppingBagOutlinedIcon fontSize="small" />
                              </span>
                            )}
                            <span className="font-medium text-slate-900 dark:text-white">
                              {product.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          {product.inStock ? (
                            <span className="text-slate-600 dark:text-slate-300">
                              {t('products.inStock')}
                            </span>
                          ) : (
                            <span
                              className={`inline-block rounded-md px-2 py-1 text-xs font-medium ${getStatusPillClasses('outofstock')}`}
                            >
                              {t('products.outOfStock')}
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">
                          {product.categoryName ?? '—'}
                        </td>
                        <td className="py-3 pr-4 text-slate-900 dark:text-white">
                          {formatPriceRange(product.fromPrice, product.maxPrice, i18n.language)}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center justify-end gap-1">
                            <IconButton
                              size="small"
                              onClick={() => goToEdit(product.id)}
                              aria-label={t('common.edit')}
                            >
                              <EditOutlinedIcon
                                fontSize="small"
                                className="text-blue-600 dark:text-blue-400"
                              />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => setPendingDelete(product)}
                              aria-label={t('common.delete')}
                            >
                              <DeleteOutlineIcon fontSize="small" className="text-red-500" />
                            </IconButton>
                          </div>
                        </td>
                      </tr>
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

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={t('products.delete.title')}
        message={t('products.delete.message')}
        loading={deleting}
        onConfirm={confirmSingleDelete}
        onClose={() => setPendingDelete(null)}
      />

      <ConfirmDialog
        open={bulkOpen}
        title={t('products.bulkDeleteModal.title')}
        message={t('products.bulkDeleteModal.message', { count: selected.length })}
        loading={bulkDeleting}
        onConfirm={confirmBulkDelete}
        onClose={() => setBulkOpen(false)}
      />
    </div>
  );
}
