import { useEffect, useMemo, useState } from 'react';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Button, IconButton, TextField } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { ConfirmDialog } from './ConfirmDialog';

interface NameItem {
  id: number;
  name: string;
}

interface NameListEditorProps {
  items: NameItem[];
  /** Left-column header label (e.g. "Brands", "Subcategories"). */
  listLabel: string;
  /** Form card title while creating / while editing. */
  addLabel: string;
  editLabel: string;
  placeholder: string;
  emptyHint?: string;
  isBusy: boolean;
  /** Resolve on success (form resets) / reject on failure (parent toasts). */
  onCreate: (name: string) => Promise<unknown>;
  onUpdate: (id: number, name: string) => Promise<unknown>;
  onDelete: (id: number) => Promise<unknown>;
  deleteTitle: string;
  buildDeleteMessage: (name: string) => string;
}

interface FormValues {
  name: string;
}

/**
 * Two-column "list + add/edit form" editor matching the Brands mockup (TRD §5.4):
 * left = rows with edit/delete actions, right = a card form that creates a new
 * item or edits the selected one. Reused for Brands and Subcategories so they
 * share one visual language.
 */
export function NameListEditor({
  items,
  listLabel,
  addLabel,
  editLabel,
  placeholder,
  emptyHint,
  isBusy,
  onCreate,
  onUpdate,
  onDelete,
  deleteTitle,
  buildDeleteMessage,
}: NameListEditorProps) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState<NameItem | null>(null);
  const [deleting, setDeleting] = useState<NameItem | null>(null);

  const schema = useMemo(
    () =>
      yup.object({
        name: yup
          .string()
          .trim()
          .required(t('validation.required'))
          .max(100, t('validation.maxLength', { count: 100 })),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: yupResolver(schema), defaultValues: { name: '' } });

  useEffect(() => {
    reset({ name: editing?.name ?? '' });
  }, [editing, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (editing) {
        await onUpdate(editing.id, values.name);
        setEditing(null);
      } else {
        await onCreate(values.name);
      }
      reset({ name: '' });
    } catch {
      /* parent surfaces the error toast */
    }
  });

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await onDelete(deleting.id);
      if (editing?.id === deleting.id) setEditing(null);
    } catch {
      /* parent surfaces the error toast */
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* List */}
      <div>
        <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-sm text-slate-400 dark:border-slate-700 dark:text-slate-500">
          <span>{listLabel}</span>
          <span>{t('common.action')}</span>
        </div>
        {items.length === 0 ? (
          <p className="py-6 text-sm text-slate-400 dark:text-slate-500">
            {emptyHint ?? t('common.noItems')}
          </p>
        ) : (
          <ul>
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between border-b border-slate-100 py-3 dark:border-slate-800"
              >
                <span className="truncate text-slate-900 dark:text-white">{item.name}</span>
                <span className="flex shrink-0">
                  <IconButton
                    size="small"
                    aria-label={t('common.edit')}
                    onClick={() => setEditing(item)}
                  >
                    <EditOutlinedIcon
                      fontSize="small"
                      className="text-blue-600 dark:text-blue-400"
                    />
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label={t('common.delete')}
                    onClick={() => setDeleting(item)}
                  >
                    <DeleteOutlineIcon fontSize="small" className="text-red-500" />
                  </IconButton>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add / edit form */}
      <div className="self-start rounded-xl border border-slate-200 p-6 dark:border-slate-700">
        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          {editing ? editLabel : addLabel}
        </h3>
        <form onSubmit={onSubmit} noValidate>
          <TextField
            {...register('name')}
            placeholder={placeholder}
            fullWidth
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
            slotProps={{ htmlInput: { 'aria-label': placeholder } }}
          />
          <div className="mt-4 flex justify-end gap-2">
            {editing && (
              <Button variant="outlined" color="inherit" onClick={() => setEditing(null)}>
                {t('common.cancel')}
              </Button>
            )}
            <Button type="submit" variant="contained" disabled={isBusy}>
              {editing ? t('common.save') : t('common.create')}
            </Button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={Boolean(deleting)}
        title={deleteTitle}
        message={deleting ? buildDeleteMessage(deleting.name) : ''}
        loading={isBusy}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
