import { useMemo, useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button, IconButton, MenuItem, Switch, TextField } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useGetBrandsQuery } from '@/features/catalog/brandsApi';
import { useGetCategoriesQuery } from '@/features/catalog/categoriesApi';
import { useGetColorsQuery } from '@/features/catalog/colorsApi';
import { ColorBlock } from '@/features/catalog/components/ColorBlock';
import { TagBlock } from '@/features/catalog/components/TagBlock';
import { getApiErrorMessage } from '@/shared/lib/apiError';
import { useSnackbar } from '@/shared/lib/useSnackbar';
import { RichTextEditor } from '@/shared/ui/RichTextEditor';
import { productSchema, type ProductFormValues } from '../schemas';
import {
  PRODUCT_CONDITIONS,
  type CreateProductPayload,
  type EditableOption,
  type ProductCondition,
  type ProductOptionInput,
  type ProductVariantInput,
} from '../types';
import { useCreateProduct } from '../useCreateProduct';
import { ImagesUploader } from './ImagesUploader';
import { OptionsEditor } from './OptionsEditor';
import { ProductSuccessModal } from './ProductSuccessModal';

const CONDITION_LABEL: Record<ProductCondition, string> = {
  BrandNew: 'products.condition.brandNew',
  Refurbished: 'products.condition.refurbished',
  Old: 'products.condition.old',
};

const DEFAULT_VALUES: ProductFormValues = {
  name: '',
  code: '',
  description: '',
  categoryId: '',
  subCategoryId: '',
  brandId: '',
  condition: 'BrandNew',
  price: '',
  discount: '',
  count: '',
  isTaxable: false,
  hasOptions: false,
};

const card =
  'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900';
const sectionTitle = 'mb-4 text-base font-bold text-slate-900 dark:text-white';

/**
 * Add product form (TRD §5.3, §6.9, §7, §8.1; mockup `Detail products.png`).
 * Create is a single multipart `POST /Products`: price/stock are packed into a
 * base variant, the Colour block is persisted as a `Color` option (its values
 * carry `colorId`), and Options/Variants are JSON-stringified (TRD §7).
 */
export function ProductForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const { data: categories } = useGetCategoriesQuery();
  const { data: brands } = useGetBrandsQuery({ pageSize: 100 });
  const { data: colors } = useGetColorsQuery({ pageSize: 100 });
  const { createProduct, isSaving } = useCreateProduct();

  const [colorIds, setColorIds] = useState<number[]>([]);
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [options, setOptions] = useState<EditableOption[]>([{ name: '', values: [] }]);
  const [images, setImages] = useState<File[]>([]);
  const [successOpen, setSuccessOpen] = useState(false);

  const resolver = useMemo(
    () => yupResolver(productSchema(t)) as unknown as Resolver<ProductFormValues>,
    [t],
  );
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({ resolver, defaultValues: DEFAULT_VALUES });

  const categoryId = watch('categoryId');
  const hasOptions = watch('hasOptions');

  const selectedCategory = categories?.find((c) => c.id === Number(categoryId));
  const subCategoryOptions = selectedCategory?.subCategories ?? [];

  const resetForm = () => {
    reset(DEFAULT_VALUES);
    setColorIds([]);
    setTagIds([]);
    setOptions([{ name: '', values: [] }]);
    setImages([]);
  };

  const onSubmit = handleSubmit(async (data) => {
    const price = Number(data.price);
    const discount = data.discount === '' || data.discount == null ? 0 : Number(data.discount);
    const count = Number(data.count);
    const hasDiscount = discount > 0;

    // Options: user-defined groups first, then a synthetic "Color" option whose
    // values carry colorId — the only way the API persists colors (TRD §5.3, §7).
    const optionInputs: ProductOptionInput[] = [];
    if (data.hasOptions) {
      options
        .filter((o) => o.name.trim() && o.values.length > 0)
        .forEach((o) => {
          optionInputs.push({
            name: o.name.trim(),
            sortOrder: optionInputs.length,
            values: o.values.map((value, j) => ({ value, sortOrder: j })),
          });
        });
    }
    if (colorIds.length > 0) {
      const picked = (colors?.items ?? []).filter((c) => colorIds.includes(c.id));
      if (picked.length > 0) {
        optionInputs.push({
          name: 'Color',
          sortOrder: optionInputs.length,
          values: picked.map((c, j) => ({ value: c.name, colorId: c.id, sortOrder: j })),
        });
      }
    }

    // Price/stock live on the variant, never at product level (TRD §7).
    const variant: ProductVariantInput = {
      sku: data.code.trim() || null,
      optionValueIds: [],
      price,
      hasDiscount,
      discountPrice: hasDiscount ? Math.max(0, price - discount) : null,
      costPrice: price,
      count,
      isActive: true,
    };

    const payload: CreateProductPayload = {
      name: data.name.trim(),
      code: data.code.trim(),
      description: data.description || undefined,
      subCategoryId: Number(data.subCategoryId),
      brandId: data.brandId === '' || data.brandId == null ? undefined : Number(data.brandId),
      isTaxable: data.isTaxable,
      condition: data.condition,
      tagIds,
      options: optionInputs,
      variants: [variant],
      images,
    };

    try {
      await createProduct(payload);
      setSuccessOpen(true);
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.saveError')));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      {/* Header: breadcrumb + actions */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <IconButton onClick={() => navigate('/products')} aria-label={t('common.cancel')}>
            <ArrowBackIcon />
          </IconButton>
          <h1 className="text-2xl font-bold">
            <span className="text-slate-900 dark:text-white">{t('nav.products')}</span>
            <span className="text-slate-400 dark:text-slate-500">
              {' / '}
              {t('products.form.breadcrumbAdd')}
            </span>
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outlined" color="inherit" onClick={() => navigate('/products')}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="contained" disabled={isSaving}>
            {t('common.save')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <section className={card}>
            <h2 className={sectionTitle}>{t('products.form.information')}</h2>

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
                    onChange={(e) =>
                      field.onChange(e.target.value === '' ? '' : Number(e.target.value))
                    }
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
                    onChange={(e) =>
                      field.onChange(e.target.value === '' ? '' : Number(e.target.value))
                    }
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
          </section>

          <section className={card}>
            <h2 className={sectionTitle}>{t('products.form.price')}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <TextField
                {...register('price')}
                type="number"
                placeholder={t('products.form.productPrice')}
                error={Boolean(errors.price)}
                helperText={errors.price?.message}
                slotProps={{
                  htmlInput: {
                    'aria-label': t('products.form.productPrice'),
                    min: 0,
                    step: '0.01',
                  },
                }}
              />
              <TextField
                {...register('discount')}
                type="number"
                placeholder={t('products.form.discount')}
                error={Boolean(errors.discount)}
                helperText={errors.discount?.message}
                slotProps={{
                  htmlInput: { 'aria-label': t('products.form.discount'), min: 0, step: '0.01' },
                }}
              />
              <TextField
                {...register('count')}
                type="number"
                placeholder={t('products.form.count')}
                error={Boolean(errors.count)}
                helperText={errors.count?.message}
                slotProps={{
                  htmlInput: { 'aria-label': t('products.form.count'), min: 0, step: '1' },
                }}
              />
            </div>

            <label className="mt-4 flex cursor-pointer items-center gap-2">
              <Controller
                name="isTaxable"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                )}
              />
              <span className="text-sm text-slate-700 dark:text-slate-200">
                {t('products.form.addTax')}
              </span>
            </label>
          </section>

          <section className={card}>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {t('products.form.differentOptions')}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t('products.form.differentOptionsHint')}
                </p>
              </div>
              <Controller
                name="hasOptions"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                )}
              />
            </div>

            {hasOptions && (
              <div className="mt-6">
                <h2 className={sectionTitle}>{t('products.form.options')}</h2>
                <OptionsEditor value={options} onChange={setOptions} />
              </div>
            )}
          </section>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <section className={card}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('products.form.colour')}
              </h2>
            </div>
            <ColorBlock value={colorIds} onChange={setColorIds} />
          </section>

          <section className={card}>
            <h2 className={sectionTitle}>{t('products.form.tags')}</h2>
            <TagBlock value={tagIds} onChange={setTagIds} />
          </section>

          <section className={card}>
            <h2 className={sectionTitle}>{t('products.form.images')}</h2>
            <ImagesUploader value={images} onChange={setImages} />
          </section>
        </div>
      </div>

      <ProductSuccessModal
        open={successOpen}
        onGoToProducts={() => navigate('/products')}
        onAddNew={() => {
          setSuccessOpen(false);
          resetForm();
        }}
        onClose={() => setSuccessOpen(false)}
      />
    </form>
  );
}
