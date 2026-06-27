import { useTranslation } from 'react-i18next';

import { getApiErrorMessage } from '@/shared/lib/apiError';
import { useSnackbar } from '@/shared/lib/useSnackbar';
import { NameListEditor } from '@/shared/ui/NameListEditor';
import {
  useCreateSubCategoryMutation,
  useDeleteSubCategoryMutation,
  useUpdateSubCategoryMutation,
} from '../subCategoriesApi';
import type { Category } from '../types';

/**
 * Detail half of the Categories master–detail (TRD §6.1): manage the selected
 * category's subcategories. Subcategories arrive inline on the Categories query,
 * so mutations invalidate that cache to refresh this panel.
 */
export function SubcategoryPanel({ category }: { category: Category }) {
  const { t } = useTranslation();
  const snackbar = useSnackbar();

  const [createSub, { isLoading: creating }] = useCreateSubCategoryMutation();
  const [updateSub, { isLoading: updating }] = useUpdateSubCategoryMutation();
  const [deleteSub, { isLoading: deleting }] = useDeleteSubCategoryMutation();
  const isBusy = creating || updating || deleting;

  const create = async (name: string) => {
    try {
      await createSub({ categoryId: category.id, name }).unwrap();
      snackbar.success(t('catalog.toast.subcategoryCreated'));
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.saveError')));
      throw err;
    }
  };

  const update = async (id: number, name: string) => {
    try {
      await updateSub({ id, categoryId: category.id, name }).unwrap();
      snackbar.success(t('catalog.toast.subcategoryUpdated'));
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.saveError')));
      throw err;
    }
  };

  const remove = async (id: number) => {
    try {
      await deleteSub(id).unwrap();
      snackbar.success(t('catalog.toast.subcategoryDeleted'));
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.deleteError')));
      throw err;
    }
  };

  return (
    <div className="mt-8 rounded-xl border border-slate-200 p-6 dark:border-slate-700">
      <h2 className="mb-5 text-lg font-semibold text-slate-900 dark:text-white">
        {t('catalog.subcategoriesOf', { name: category.name })}
      </h2>
      <NameListEditor
        items={category.subCategories ?? []}
        listLabel={t('catalog.subcategories')}
        addLabel={t('catalog.addSubcategory')}
        editLabel={t('catalog.editSubcategory')}
        placeholder={t('catalog.subcategoryName')}
        emptyHint={t('catalog.noSubcategories')}
        isBusy={isBusy}
        onCreate={create}
        onUpdate={update}
        onDelete={remove}
        deleteTitle={t('catalog.deleteSubcategory.title')}
        buildDeleteMessage={(name) => t('catalog.deleteSubcategory.message', { name })}
      />
    </div>
  );
}
