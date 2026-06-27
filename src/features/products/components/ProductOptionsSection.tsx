import { useState, type KeyboardEvent } from 'react';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import { Button, Chip, IconButton, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { getApiErrorMessage } from '@/shared/lib/apiError';
import { useSnackbar } from '@/shared/lib/useSnackbar';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import {
  useAddProductOptionMutation,
  useDeleteProductOptionMutation,
  useUpdateProductOptionMutation,
} from '../productsApi';
import type { OptionValueInput, ProductDetailOption } from '../types';
import { card, sectionTitle } from './editStyles';

/** Editable option value preserving its persisted color link (TRD §8.3). */
interface EditableValue {
  value: string;
  colorId: number | null;
  colorHex: string | null;
}

interface ProductOptionsSectionProps {
  productId: number;
  options: ProductDetailOption[];
}

/**
 * Options section of the edit screen (TRD §8.3). Each option group persists via
 * its own endpoint (`POST/PUT/DELETE …/options`). Color options keep their
 * `colorId` on save so the swatch link survives an edit; new typed values are
 * plain (no color). This is where colours are managed on an existing product.
 */
export function ProductOptionsSection({ productId, options }: ProductOptionsSectionProps) {
  const { t } = useTranslation();
  const [adding, setAdding] = useState(false);

  return (
    <section className={card}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className={sectionTitle}>{t('products.form.options')}</h2>
        {!adding && (
          <Button startIcon={<AddIcon />} onClick={() => setAdding(true)}>
            {t('products.edit.addOption')}
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {options.length === 0 && !adding && (
          <p className="text-sm text-slate-400 dark:text-slate-500">
            {t('products.edit.noOptions')}
          </p>
        )}

        {options
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((option, index) => (
            <OptionGroupEditor
              key={option.id}
              productId={productId}
              option={option}
              index={index}
            />
          ))}

        {adding && (
          <OptionGroupEditor
            productId={productId}
            index={options.length}
            onDone={() => setAdding(false)}
          />
        )}
      </div>
    </section>
  );
}

interface OptionGroupEditorProps {
  productId: number;
  index: number;
  /** Existing option being edited; omit to render the "new option" draft. */
  option?: ProductDetailOption;
  /** Called when a draft is created or cancelled. */
  onDone?: () => void;
}

function OptionGroupEditor({ productId, index, option, onDone }: OptionGroupEditorProps) {
  const { t } = useTranslation();
  const snackbar = useSnackbar();
  const isNew = !option;

  const [name, setName] = useState(option?.name ?? '');
  const [values, setValues] = useState<EditableValue[]>(
    option
      ? option.values
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((v) => ({ value: v.value, colorId: v.colorId, colorHex: v.colorHex }))
      : [],
  );
  const [draft, setDraft] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const [addOption, { isLoading: creating }] = useAddProductOptionMutation();
  const [updateOption, { isLoading: updating }] = useUpdateProductOptionMutation();
  const [deleteOption, { isLoading: deleting }] = useDeleteProductOptionMutation();
  const busy = creating || updating;

  const addValue = () => {
    const v = draft.trim();
    if (!v) return;
    if (!values.some((x) => x.value === v)) {
      setValues([...values, { value: v, colorId: null, colorHex: null }]);
    }
    setDraft('');
  };

  const onDraftKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addValue();
    }
  };

  const removeValue = (target: string) => setValues(values.filter((x) => x.value !== target));

  const save = async () => {
    if (!name.trim() || values.length === 0) {
      snackbar.error(t('products.edit.optionIncomplete'));
      return;
    }
    const body = {
      name: name.trim(),
      sortOrder: index,
      values: values.map<OptionValueInput>((v, i) => ({
        value: v.value,
        colorId: v.colorId,
        sortOrder: i,
      })),
    };
    try {
      if (isNew) {
        await addOption({ productId, body }).unwrap();
        snackbar.success(t('products.edit.optionCreated'));
        onDone?.();
      } else {
        await updateOption({ productId, optionId: option.id, body }).unwrap();
        snackbar.success(t('products.edit.optionUpdated'));
      }
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.saveError')));
    }
  };

  const confirmDelete = async () => {
    if (!option) return;
    try {
      await deleteOption({ productId, optionId: option.id }).unwrap();
      snackbar.success(t('products.edit.optionDeleted'));
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.deleteError')));
    } finally {
      setConfirmingDelete(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label={t('products.form.optionN', { n: index + 1 })}
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />

        <div>
          <span className="mb-1 block text-xs text-slate-400 dark:text-slate-500">
            {t('products.form.value')}
          </span>
          <div className="flex min-h-[44px] flex-wrap items-center gap-1.5 rounded-lg border border-slate-300 px-2 py-1.5 focus-within:border-blue-500 dark:border-slate-600">
            {values.map((v) => (
              <Chip
                key={v.value}
                label={v.value}
                size="small"
                onDelete={() => removeValue(v.value)}
                avatar={
                  v.colorHex ? (
                    <span
                      aria-hidden
                      className="!h-4 !w-4 rounded-full border border-black/10"
                      style={{ backgroundColor: v.colorHex }}
                    />
                  ) : undefined
                }
              />
            ))}
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onDraftKeyDown}
              placeholder={values.length === 0 ? t('products.form.value') : ''}
              aria-label={t('products.form.addValue')}
              className="min-w-[60px] flex-1 bg-transparent px-1 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
            />
            {draft.trim() && (
              <IconButton size="small" onClick={addValue} aria-label={t('products.form.addValue')}>
                <CheckIcon fontSize="small" className="text-blue-600 dark:text-blue-400" />
              </IconButton>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        {isNew ? (
          <Button variant="outlined" color="inherit" onClick={onDone}>
            {t('common.cancel')}
          </Button>
        ) : (
          <Button variant="outlined" color="error" onClick={() => setConfirmingDelete(true)}>
            {t('common.delete')}
          </Button>
        )}
        <Button variant="contained" onClick={save} disabled={busy}>
          {t('common.save')}
        </Button>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title={t('products.edit.deleteOption.title')}
        message={t('products.edit.deleteOption.message', { name: option?.name ?? '' })}
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setConfirmingDelete(false)}
      />
    </div>
  );
}
