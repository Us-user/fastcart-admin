import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { Button, Chip, MenuItem, Switch, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { getApiErrorMessage } from '@/shared/lib/apiError';
import { useSnackbar } from '@/shared/lib/useSnackbar';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import {
  useAddProductVariantMutation,
  useDeleteProductVariantMutation,
  useUpdateProductVariantMutation,
  useUpdateVariantStockMutation,
} from '../productsApi';
import type { ProductDetailOption, ProductDetailVariant, ProductVariantInput } from '../types';
import { card, sectionTitle } from './editStyles';

interface ProductVariantsSectionProps {
  productId: number;
  variants: ProductDetailVariant[];
  options: ProductDetailOption[];
}

/**
 * Variants section of the edit screen (TRD §5.3, §8.3). Each variant's price /
 * discount / cost / active state saves via `PUT …/variants/{id}`, its stock via
 * the dedicated `PUT …/variants/{id}/stock` endpoint, and delete via `DELETE`.
 * New variants are created with `POST …/variants` (option-value picks → ids).
 */
export function ProductVariantsSection({
  productId,
  variants,
  options,
}: ProductVariantsSectionProps) {
  const { t } = useTranslation();
  const [adding, setAdding] = useState(false);

  return (
    <section className={card}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className={sectionTitle}>{t('products.edit.variants')}</h2>
        {!adding && (
          <Button startIcon={<AddIcon />} onClick={() => setAdding(true)}>
            {t('products.edit.addVariant')}
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {variants.length === 0 && !adding && (
          <p className="text-sm text-slate-400 dark:text-slate-500">
            {t('products.edit.noVariants')}
          </p>
        )}

        {variants.map((variant) => (
          <VariantRow key={variant.id} productId={productId} variant={variant} />
        ))}

        {adding && (
          <AddVariantRow productId={productId} options={options} onDone={() => setAdding(false)} />
        )}
      </div>
    </section>
  );
}

const numberOrNull = (value: string): number | null => {
  if (value.trim() === '') return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
};

interface VariantRowProps {
  productId: number;
  variant: ProductDetailVariant;
}

function VariantRow({ productId, variant }: VariantRowProps) {
  const { t } = useTranslation();
  const snackbar = useSnackbar();

  const [sku, setSku] = useState(variant.sku ?? '');
  const [price, setPrice] = useState(String(variant.price));
  const [discountPrice, setDiscountPrice] = useState(
    variant.discountPrice == null ? '' : String(variant.discountPrice),
  );
  const [costPrice, setCostPrice] = useState('');
  const [isActive, setIsActive] = useState(variant.isActive);
  const [stock, setStock] = useState(String(variant.stockCount));
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const [updateVariant, { isLoading: saving }] = useUpdateProductVariantMutation();
  const [updateStock, { isLoading: savingStock }] = useUpdateVariantStockMutation();
  const [deleteVariant, { isLoading: deleting }] = useDeleteProductVariantMutation();

  const save = async () => {
    const priceNum = numberOrNull(price);
    if (priceNum == null || priceNum <= 0) {
      snackbar.error(t('validation.positive'));
      return;
    }
    const discount = numberOrNull(discountPrice);
    const cost = numberOrNull(costPrice);
    try {
      await updateVariant({
        productId,
        variantId: variant.id,
        body: {
          sku: sku.trim() || null,
          price: priceNum,
          hasDiscount: discount != null && discount > 0,
          discountPrice: discount,
          // Detail doesn't expose costPrice — only send it when explicitly entered.
          ...(cost != null ? { costPrice: cost } : {}),
          isActive,
        },
      }).unwrap();
      snackbar.success(t('products.edit.variantSaved'));
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.saveError')));
    }
  };

  const saveStock = async () => {
    const count = numberOrNull(stock);
    if (count == null || count < 0 || !Number.isInteger(count)) {
      snackbar.error(t('validation.integer'));
      return;
    }
    try {
      await updateStock({ productId, variantId: variant.id, count }).unwrap();
      snackbar.success(t('products.edit.stockSaved'));
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.saveError')));
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteVariant({ productId, variantId: variant.id }).unwrap();
      snackbar.success(t('products.edit.variantDeleted'));
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.deleteError')));
    } finally {
      setConfirmingDelete(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      {variant.options.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {variant.options.map((o) => (
            <Chip
              key={`${o.optionName}-${o.value}`}
              size="small"
              label={`${o.optionName}: ${o.value}`}
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <TextField
          label={t('products.edit.sku')}
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          size="small"
        />
        <TextField
          label={t('products.form.productPrice')}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          type="number"
          size="small"
          slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
        />
        <TextField
          label={t('products.edit.discountPrice')}
          value={discountPrice}
          onChange={(e) => setDiscountPrice(e.target.value)}
          type="number"
          size="small"
          slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
        />
        <TextField
          label={t('products.edit.costPrice')}
          value={costPrice}
          onChange={(e) => setCostPrice(e.target.value)}
          type="number"
          size="small"
          placeholder={t('products.edit.unchanged')}
          slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-end gap-2">
          <TextField
            label={t('products.edit.stock')}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            type="number"
            size="small"
            sx={{ width: 110 }}
            slotProps={{ htmlInput: { min: 0, step: '1' } }}
          />
          <Button variant="outlined" onClick={saveStock} disabled={savingStock}>
            {t('products.edit.updateStock')}
          </Button>
        </div>

        <label className="flex cursor-pointer items-center gap-1.5">
          <Switch size="small" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          <span className="text-sm text-slate-700 dark:text-slate-200">
            {t('products.edit.active')}
          </span>
        </label>
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <Button variant="outlined" color="error" onClick={() => setConfirmingDelete(true)}>
          {t('common.delete')}
        </Button>
        <Button variant="contained" onClick={save} disabled={saving}>
          {t('common.save')}
        </Button>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title={t('products.edit.deleteVariant.title')}
        message={t('products.edit.deleteVariant.message')}
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setConfirmingDelete(false)}
      />
    </div>
  );
}

interface AddVariantRowProps {
  productId: number;
  options: ProductDetailOption[];
  onDone: () => void;
}

function AddVariantRow({ productId, options, onDone }: AddVariantRowProps) {
  const { t } = useTranslation();
  const snackbar = useSnackbar();
  const [addVariant, { isLoading: creating }] = useAddProductVariantMutation();

  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [count, setCount] = useState('0');
  /** optionId → selected value id. */
  const [picks, setPicks] = useState<Record<number, number>>({});

  const setPick = (optionId: number, valueId: number) =>
    setPicks((prev) => ({ ...prev, [optionId]: valueId }));

  const save = async () => {
    const priceNum = numberOrNull(price);
    if (priceNum == null || priceNum <= 0) {
      snackbar.error(t('validation.positive'));
      return;
    }
    const countNum = numberOrNull(count) ?? 0;
    const discount = numberOrNull(discountPrice);
    const cost = numberOrNull(costPrice);
    const optionValueIds = options
      .map((o) => picks[o.id])
      .filter((id): id is number => typeof id === 'number');

    if (options.length > 0 && optionValueIds.length !== options.length) {
      snackbar.error(t('products.edit.pickAllOptions'));
      return;
    }

    const body: ProductVariantInput = {
      sku: sku.trim() || null,
      optionValueIds,
      price: priceNum,
      hasDiscount: discount != null && discount > 0,
      discountPrice: discount,
      costPrice: cost ?? priceNum,
      count: countNum,
      isActive: true,
    };
    try {
      await addVariant({ productId, body }).unwrap();
      snackbar.success(t('products.edit.variantCreated'));
      onDone();
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.saveError')));
    }
  };

  return (
    <div className="rounded-xl border border-dashed border-blue-300 p-4 dark:border-blue-700">
      <p className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
        {t('products.edit.newVariant')}
      </p>

      {options.length > 0 && (
        <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {options.map((o) => (
            <TextField
              key={o.id}
              select
              label={o.name}
              value={picks[o.id] ?? ''}
              onChange={(e) => setPick(o.id, Number(e.target.value))}
              size="small"
            >
              {o.values.map((v) => (
                <MenuItem key={v.id} value={v.id}>
                  {v.value}
                </MenuItem>
              ))}
            </TextField>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <TextField
          label={t('products.edit.sku')}
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          size="small"
        />
        <TextField
          label={t('products.form.productPrice')}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          type="number"
          size="small"
          slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
        />
        <TextField
          label={t('products.edit.discountPrice')}
          value={discountPrice}
          onChange={(e) => setDiscountPrice(e.target.value)}
          type="number"
          size="small"
          slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
        />
        <TextField
          label={t('products.edit.costPrice')}
          value={costPrice}
          onChange={(e) => setCostPrice(e.target.value)}
          type="number"
          size="small"
          slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
        />
        <TextField
          label={t('products.edit.stock')}
          value={count}
          onChange={(e) => setCount(e.target.value)}
          type="number"
          size="small"
          slotProps={{ htmlInput: { min: 0, step: '1' } }}
        />
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <Button variant="outlined" color="inherit" onClick={onDone}>
          {t('common.cancel')}
        </Button>
        <Button variant="contained" onClick={save} disabled={creating}>
          {t('common.create')}
        </Button>
      </div>
    </div>
  );
}
