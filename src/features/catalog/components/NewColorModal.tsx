import { useEffect, useMemo } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { getApiErrorMessage } from '@/shared/lib/apiError';
import { useSnackbar } from '@/shared/lib/useSnackbar';
import { useCreateColorMutation, useUpdateColorMutation } from '../colorsApi';
import { colorSchema, type ColorFormValues } from '../schemas';
import type { Color } from '../types';

const DEFAULT_HEX = '#000000';
const FULL_HEX = /^#[0-9a-fA-F]{6}$/;

/** Native `<input type="color">` requires a 6-digit hex; fall back while typing. */
const toSwatchHex = (value: string) => (FULL_HEX.test(value) ? value : DEFAULT_HEX);

interface NewColorModalProps {
  open: boolean;
  /** When provided the modal edits this color; otherwise it creates. */
  color?: Color | null;
  onClose: () => void;
}

/**
 * "New color" modal (TRD §5.3, mockups `02 Destructive-4/-5.png`): a Color name
 * field beside a hex field whose swatch opens the OS color picker. Also edits an
 * existing color so colors stay fully manageable (TRD §9).
 */
export function NewColorModal({ open, color, onClose }: NewColorModalProps) {
  const { t } = useTranslation();
  const snackbar = useSnackbar();
  const [createColor, { isLoading: creating }] = useCreateColorMutation();
  const [updateColor, { isLoading: updating }] = useUpdateColorMutation();
  const isEdit = Boolean(color);
  const isSaving = creating || updating;

  const resolver = useMemo(() => yupResolver(colorSchema(t)), [t]);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ColorFormValues>({ resolver, defaultValues: { name: '', hexCode: DEFAULT_HEX } });

  const hex = watch('hexCode');

  useEffect(() => {
    if (open) {
      reset({ name: color?.name ?? '', hexCode: color?.hexCode ?? DEFAULT_HEX });
    }
  }, [open, color, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const body = { name: values.name.trim(), hexCode: values.hexCode.trim().toUpperCase() };
    try {
      if (color) {
        await updateColor({ id: color.id, ...body }).unwrap();
        snackbar.success(t('catalog.toast.colorUpdated'));
      } else {
        await createColor(body).unwrap();
        snackbar.success(t('catalog.toast.colorCreated'));
      }
      onClose();
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.saveError')));
    }
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
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
        {t(isEdit ? 'catalog.editColor' : 'catalog.newColor')}
        <IconButton onClick={onClose} aria-label={t('common.cancel')} size="small" edge="end">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={onSubmit} noValidate>
        <DialogContent>
          <div className="flex items-start gap-3">
            <TextField
              {...register('name')}
              placeholder={t('catalog.colorName')}
              autoFocus
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
              sx={{ flex: '1 1 58%' }}
              slotProps={{ htmlInput: { 'aria-label': t('catalog.colorName') } }}
            />
            <TextField
              {...register('hexCode')}
              error={Boolean(errors.hexCode)}
              helperText={errors.hexCode?.message}
              sx={{ flex: '1 1 42%' }}
              slotProps={{
                htmlInput: {
                  'aria-label': t('catalog.hexCode'),
                  className: 'uppercase',
                  spellCheck: false,
                },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <span className="relative inline-flex h-7 w-7 shrink-0">
                        <span
                          className="h-7 w-7 rounded-md border border-slate-300 dark:border-slate-600"
                          style={{ backgroundColor: toSwatchHex(hex) }}
                        />
                        <input
                          type="color"
                          value={toSwatchHex(hex)}
                          onChange={(e) =>
                            setValue('hexCode', e.target.value.toUpperCase(), {
                              shouldValidate: true,
                            })
                          }
                          aria-label={t('catalog.pickColor')}
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        />
                      </span>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </div>
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
