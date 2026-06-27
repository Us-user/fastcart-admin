import { useMemo, useState } from 'react';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { Button, InputAdornment, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { getApiErrorMessage } from '@/shared/lib/apiError';
import { useSnackbar } from '@/shared/lib/useSnackbar';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { DataState } from '@/shared/ui/DataState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { PaginationFooter } from '@/shared/ui/PaginationFooter';
import { useDeleteCategoryMutation, useGetCategoriesQuery } from '../categoriesApi';
import type { Category } from '../types';
import { AddCategoryModal } from './AddCategoryModal';
import { CategoryCard } from './CategoryCard';
import { SubcategoryPanel } from './SubcategoryPanel';

const PAGE_SIZE = 15;

/** null = closed; `{ category: null }` = create; `{ category }` = edit. */
export type CategoryDialogState = { category: Category | null } | null;

interface CategoriesTabProps {
  dialog: CategoryDialogState;
  onDialogChange: (next: CategoryDialogState) => void;
}

/**
 * Categories tab (TRD §5.4 + §6.1): searchable, paginated card grid (master) +
 * a subcategory editor for the selected category (detail). The create dialog is
 * controlled by the parent so its "+ Add new" button can live on the tab row.
 */
export function CategoriesTab({ dialog, onDialogChange }: CategoriesTabProps) {
  const { t } = useTranslation();
  const snackbar = useSnackbar();
  const { data, isLoading, isError, refetch } = useGetCategoriesQuery();
  const [deleteCategory, { isLoading: deleting }] = useDeleteCategoryMutation();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

  const categories = useMemo(() => data ?? [], [data]);
  const filtered = useMemo(
    () => categories.filter((c) => c.name.toLowerCase().includes(search.trim().toLowerCase())),
    [categories, search],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Keep the selection bound to live data so the detail panel reflects edits.
  const selectedCategory = categories.find((c) => c.id === selectedId) ?? null;

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteCategory(pendingDelete.id).unwrap();
      snackbar.success(t('catalog.toast.categoryDeleted'));
      if (selectedId === pendingDelete.id) setSelectedId(null);
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.deleteError')));
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <DataState
      isLoading={isLoading}
      isError={isError}
      isEmpty={categories.length === 0}
      onRetry={refetch}
      emptyState={
        <EmptyState
          icon={<CategoryOutlinedIcon sx={{ fontSize: 32 }} />}
          title={t('catalog.empty.categoriesTitle')}
          description={t('catalog.empty.categoriesDescription')}
          action={
            <Button variant="contained" onClick={() => onDialogChange({ category: null })}>
              {t('catalog.addNew')}
            </Button>
          }
        />
      }
    >
      <TextField
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={t('common.searchPlaceholder')}
        className="w-full max-w-sm"
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

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-sm text-slate-400 dark:text-slate-500">
          {t('catalog.noSearchResults')}
        </p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {pageItems.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                selected={selectedId === category.id}
                onSelect={() =>
                  setSelectedId((prev) => (prev === category.id ? null : category.id))
                }
                onEdit={() => onDialogChange({ category })}
                onDelete={() => setPendingDelete(category)}
              />
            ))}
          </div>

          <PaginationFooter
            page={currentPage}
            pageCount={pageCount}
            totalCount={filtered.length}
            onChange={setPage}
          />
        </>
      )}

      {selectedCategory && <SubcategoryPanel category={selectedCategory} />}

      <AddCategoryModal
        open={dialog !== null}
        category={dialog?.category}
        onClose={() => onDialogChange(null)}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={t('catalog.deleteCategory.title')}
        message={
          pendingDelete ? t('catalog.deleteCategory.message', { name: pendingDelete.name }) : ''
        }
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </DataState>
  );
}
