import { useMemo } from 'react';
import { Button, MenuItem, Switch, TextField } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useGetBrandsQuery } from '@/features/catalog/brandsApi';
import { useGetCategoriesQuery } from '@/features/catalog/categoriesApi';
import { getApiErrorMessage } from '@/shared/lib/apiError';
import { useSnackbar } from '@/shared/lib/useSnackbar';
import { RichTextEditor } from '@/shared/ui/RichTextEditor';
import { productBaseSchema, type ProductBaseFormValues } from '../schemas';
import { useUpdateProductBaseMutation } from '../productsApi';
import { PRODUCT_CONDITIONS, type ProductCondition, type ProductDetail } from '../types';
import { card, sectionTitle } from './editStyles';

const CONDITION_LABEL: Record<ProductCondition, string> = {
  BrandNew: 'products.condition.brandNew',
  Refurbished: 'products.condition.refurbished',
  Old: 'products.condition.old',
};

interface EditInfoSectionProps {
  detail: ProductDetail;
  /** Selected tag ids (managed in the right-column Tags block; saved here). */
  tagIds: number[];
}

/**
 * Information section of the edit screen (TRD §8.2/§8.3). Persists the base
 * record via `PUT /Products/{id}` — including `tagIds`, since tags are part of
 * the base payload. The Category dropdown is a filter only; both linked
 * dropdowns are pre-filled from the product's `categoryId`/`subCategoryId`.
 */
export function EditInfoSection({ detail, tagIds }: EditInfoSectionProps) {
  const { t } = useTranslation();
  const snackbar = useSnackbar();

  const { data: categories } = useGetCategoriesQuery();
  const { data: brands } = useGetBrandsQuery({ pageSize: 100 });
  const [updateBase, { isLoading: saving }] = useUpdateProductBaseMutation();

  const resolver = useMemo(
    () => yupResolver(productBaseSchema(t)) as unknown as Resolver<ProductBaseFormValues>,
    [t],
  );
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductBaseFormValues>({
    resolver,
    defaultValues: {
      name: detail.name,
      code: detail.code,
      description: detail.description ?? '',
      categoryId: detail.categoryId ?? '',
      subCategoryId: detail.subCategoryId,
      brandId: detail.brand?.id ?? '',
      condition: detail.condition,
      isTaxable: detail.isTaxable,
    },
  });

  const categoryId = watch('categoryId');
  const selectedCategory = categories?.find((c) => c.id === Number(categoryId));
  const subCategoryOptions = selectedCategory?.subCategories ?? [];

  const onSubmit = handleSubmit(async (data) => {
    try {
      await updateBase({
        id: detail.id,
        body: {
          name: data.name.trim(),
          code: data.code.trim(),
          description: data.description || null,
          subCategoryId: Number(data.subCategoryId),
          brandId: data.brandId === '' || data.brandId == null ? null : Number(data.brandId),
          isTaxable: data.isTaxable,
          condition: data.condition,
          tagIds,
        },
      }).unwrap();
      snackbar.success(t('products.edit.detailsSaved'));
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.saveError')));
    }
  });

  return (
    <section className={card}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className={sectionTitle}>{t('products.form.information')}</h2>
        <Button variant="contained" onClick={onSubmit} disabled={saving}>
          {t('products.edit.saveDetails')}
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <TextField
          {...register('name')}
          placeholder={t('products.form.productName')}
          fullWidth
          error={Boolean(errors.name)}
          helperText={errors.name?.message}
          slotProps={{ htmlInput: { 'aria-label': t('products.form.productName') } }}
          sx={{ flex: '1 1 70%' }}
        />
        <TextField
          {...register('code')}
          placeholder={t('products.form.code')}
          error={Boolean(errors.code)}
          helperText={errors.code?.message}
          slotProps={{ htmlInput: { 'aria-label': t('products.form.code') } }}
          sx={{ flex: '1 1 30%' }}
        />
      </div>

      <div className="mt-4">
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              value={field.value}
              onChange={field.onChange}
              placeholder={t('products.form.description')}
              ariaLabel={t('products.form.description')}
            />
          )}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <TextField
              select
              label={t('products.form.category')}
              value={field.value}
              onChange={(e) => {
                field.onChange(e.target.value === '' ? '' : Number(e.target.value));
                setValue('subCategoryId', '');
              }}
              error={Boolean(errors.categoryId)}
              helperText={errors.categoryId?.message}
              fullWidth
            >
              {(categories ?? []).map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <Controller
          name="subCategoryId"
          control={control}
          render={({ field }) => (
            <TextField
              select
              label={t('products.form.subcategory')}
              value={field.value}
              onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
              disabled={!categoryId}
              error={Boolean(errors.subCategoryId)}
              helperText={
                errors.subCategoryId?.message ??
                (!categoryId ? t('products.form.selectCategoryFirst') : undefined)
              }
              fullWidth
            >
              {subCategoryOptions.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <Controller
          name="brandId"
          control={control}
          render={({ field }) => (
            <TextField
              select
              label={t('products.form.brand')}
              value={field.value}
              onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
              error={Boolean(errors.brandId)}
              helperText={errors.brandId?.message}
              fullWidth
            >
              {(brands?.items ?? []).map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <Controller
          name="condition"
          control={control}
          render={({ field }) => (
            <TextField
              select
              label={t('products.form.condition')}
              value={field.value}
              onChange={field.onChange}
              error={Boolean(errors.condition)}
              helperText={errors.condition?.message}
              fullWidth
            >
              {PRODUCT_CONDITIONS.map((c) => (
                <MenuItem key={c} value={c}>
                  {t(CONDITION_LABEL[c])}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      </div>

      <label className="mt-4 flex cursor-pointer items-center gap-2">
        <Controller
          name="isTaxable"
          control={control}
          render={({ field }) => (
            <Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
          )}
        />
        <span className="text-sm text-slate-700 dark:text-slate-200">
          {t('products.form.addTax')}
        </span>
      </label>
    </section>
  );
}
