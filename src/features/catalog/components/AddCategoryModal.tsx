import { useEffect, useMemo, useRef, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
} from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { getApiErrorMessage } from '@/shared/lib/apiError';
import { useSnackbar } from '@/shared/lib/useSnackbar';
import { categorySchema, type NameFormValues } from '../schemas';
import type { Category } from '../types';
import { useCategoryMutations } from '../useCategoryMutations';

const ACCEPT = 'image/svg+xml,image/png,image/jpeg,image/gif';

interface AddCategoryModalProps {
  open: boolean;
  /** When provided the modal edits this category; otherwise it creates. */
  category?: Category | null;
  onClose: () => void;
}

export function AddCategoryModal({ open, category, onClose }: AddCategoryModalProps) {
  const { t } = useTranslation();
  const snackbar = useSnackbar();
  const { saveCategory, isSaving } = useCategoryMutations();
  const inputRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(category);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const resolver = useMemo(() => yupResolver(categorySchema(t)), [t]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NameFormValues>({ resolver, defaultValues: { name: '' } });

  // Sync form + preview to the target category whenever the dialog (re)opens.
  useEffect(() => {
    if (open) {
      reset({ name: category?.name ?? '' });
      setFile(null);
      setPreviewUrl(category?.imageUrl ?? null);
    }
  }, [open, category, reset]);

  // Revoke object URLs created for the local file preview.
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pickFile = (selected: File | undefined) => {
    if (selected) setFile(selected);
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(category?.imageUrl ?? null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      await saveCategory({ name: values.name, image: file }, category?.id);
      snackbar.success(
        t(isEdit ? 'catalog.toast.categoryUpdated' : 'catalog.toast.categoryCreated'),
      );
      onClose();
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.saveError')));
    }
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 700,
        }}
      >
        {t(isEdit ? 'catalog.editCategory' : 'catalog.addCategory')}
        <IconButton onClick={onClose} aria-label={t('common.cancel')} size="small" edge="end">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={onSubmit} noValidate>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            {...register('name')}
            placeholder={t('catalog.categoryName')}
            fullWidth
            autoFocus
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
            slotProps={{ htmlInput: { 'aria-label': t('catalog.categoryName') } }}
          />

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            hidden
            onChange={(e) => pickFile(e.target.files?.[0])}
          />

          {previewUrl ? (
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <img
                src={previewUrl}
                alt={t('catalog.categoryName')}
                className="h-12 w-12 rounded-lg object-cover"
              />
              <span className="min-w-0 flex-1 truncate text-sm text-slate-600 dark:text-slate-300">
                {file?.name ?? t('catalog.currentImage')}
              </span>
              <IconButton onClick={clearFile} size="small" aria-label={t('common.delete')}>
                <DeleteOutlineIcon fontSize="small" className="text-red-500" />
              </IconButton>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                pickFile(e.dataTransfer.files?.[0]);
              }}
              className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-7 text-center transition-colors hover:border-blue-400 dark:border-slate-600 dark:hover:border-blue-500"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                <FileUploadOutlinedIcon fontSize="small" />
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-300">
                <span className="font-medium text-slate-900 underline dark:text-white">
                  {t('catalog.clickToUpload')}
                </span>{' '}
                {t('catalog.orDragAndDrop')}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {t('catalog.uploadFormats')}
              </span>
            </button>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button variant="outlined" color="inherit" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="contained" disabled={isSaving}>
            {t(isEdit ? 'common.save' : 'common.create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
