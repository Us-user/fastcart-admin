import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getApiErrorMessage } from '@/shared/lib/apiError';
import { useSnackbar } from '@/shared/lib/useSnackbar';
import { DataState } from '@/shared/ui/DataState';
import { NameListEditor } from '@/shared/ui/NameListEditor';
import { PaginationFooter } from '@/shared/ui/PaginationFooter';
import {
  useCreateBrandMutation,
  useDeleteBrandMutation,
  useGetBrandsQuery,
  useUpdateBrandMutation,
} from '../brandsApi';

const PAGE_SIZE = 20;

/** Brands tab (TRD §5.4): paged list on the left, add/edit form on the right. */
export function BrandsTab() {
  const { t } = useTranslation();
  const snackbar = useSnackbar();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, isFetching, refetch } = useGetBrandsQuery({
    pageNumber: page,
    pageSize: PAGE_SIZE,
  });
  const [createBrand, { isLoading: creating }] = useCreateBrandMutation();
  const [updateBrand, { isLoading: updating }] = useUpdateBrandMutation();
  const [deleteBrand, { isLoading: deleting }] = useDeleteBrandMutation();
  const isBusy = creating || updating || deleting;

  const create = async (name: string) => {
    try {
      await createBrand({ name }).unwrap();
      snackbar.success(t('catalog.toast.brandCreated'));
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.saveError')));
      throw err;
    }
  };

  const update = async (id: number, name: string) => {
    try {
      await updateBrand({ id, name }).unwrap();
      snackbar.success(t('catalog.toast.brandUpdated'));
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.saveError')));
      throw err;
    }
  };

  const remove = async (id: number) => {
    try {
      await deleteBrand(id).unwrap();
      snackbar.success(t('catalog.toast.brandDeleted'));
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.deleteError')));
      throw err;
    }
  };

  return (
    <DataState isLoading={isLoading} isError={isError} onRetry={refetch}>
      <NameListEditor
        items={data?.items ?? []}
        listLabel={t('catalog.brands')}
        addLabel={t('catalog.addBrand')}
        editLabel={t('catalog.editBrand')}
        placeholder={t('catalog.brandName')}
        emptyHint={t('catalog.noBrands')}
        isBusy={isBusy || isFetching}
        onCreate={create}
        onUpdate={update}
        onDelete={remove}
        deleteTitle={t('catalog.deleteBrand.title')}
        buildDeleteMessage={(name) => t('catalog.deleteBrand.message', { name })}
      />
      {data && data.totalPages > 1 && (
        <PaginationFooter
          page={page}
          pageCount={data.totalPages}
          totalCount={data.totalCount}
          onChange={setPage}
        />
      )}
    </DataState>
  );
}
