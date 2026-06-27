import { useRef, useState } from 'react';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import {
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { getApiErrorMessage } from '@/shared/lib/apiError';
import { useSnackbar } from '@/shared/lib/useSnackbar';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { DataState } from '@/shared/ui/DataState';
import { useDeleteSliderMutation, useGetSlidersQuery } from '../slidersApi';
import { useSliderMutations } from '../useSliderMutations';

interface SliderFormState {
  title: string;
  subtitle: string;
  sortOrder: string;
  isActive: boolean;
  image: File | null;
  previewUrl: string | null;
}

const EMPTY_FORM: SliderFormState = {
  title: '',
  subtitle: '',
  sortOrder: '',
  isActive: true,
  image: null,
  previewUrl: null,
};

export function SlidersSection() {
  const { t } = useTranslation();
  const snackbar = useSnackbar();

  const { data: sliders = [], isLoading, isError, refetch } = useGetSlidersQuery();
  const [deleteSlider, { isLoading: isDeleting }] = useDeleteSliderMutation();
  const { saveSlider, isSaving } = useSliderMutations();

  const [form, setForm] = useState<SliderFormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEdit = (slider: (typeof sliders)[number]) => {
    setEditingId(slider.id);
    setForm({
      title: slider.title,
      subtitle: slider.subtitle ?? '',
      sortOrder: slider.sortOrder != null ? String(slider.sortOrder) : '',
      isActive: slider.isActive,
      image: null,
      previewUrl: slider.imageUrl,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setForm((prev) => ({
      ...prev,
      image: file,
      previewUrl: URL.createObjectURL(file),
    }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      snackbar.error(t('validation.required'));
      return;
    }
    try {
      await saveSlider(
        {
          title: form.title.trim(),
          subtitle: form.subtitle.trim() || undefined,
          sortOrder: form.sortOrder !== '' ? Number(form.sortOrder) : undefined,
          isActive: form.isActive,
          image: form.image ?? undefined,
        },
        editingId ?? undefined,
      );
      snackbar.success(
        editingId != null ? t('marketing.toast.sliderUpdated') : t('marketing.toast.sliderCreated'),
      );
      resetForm();
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.saveError')));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSlider(deleteTarget.id).unwrap();
      snackbar.success(t('marketing.toast.sliderDeleted'));
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.deleteError')));
    } finally {
      setDeleteTarget(null);
    }
  };

  const isBusy = isSaving || isDeleting;

  return (
    <div className="flex flex-col gap-4">
      {/* Form card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <Typography variant="subtitle1" className="mb-4 font-semibold">
          {editingId != null ? t('marketing.editSlider') : t('marketing.addSlider')}
        </Typography>

        {/* Image dropzone */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mb-4 flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition hover:border-blue-400 dark:border-slate-700 dark:bg-slate-800"
        >
          {form.previewUrl ? (
            <img
              src={form.previewUrl}
              alt=""
              className="h-28 w-full rounded-lg object-cover"
            />
          ) : (
            <>
              <ImageOutlinedIcon className="text-slate-400" />
              <span className="text-sm text-slate-500">{t('catalog.clickToUpload')}</span>
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex flex-col gap-3">
          <TextField
            label={t('marketing.sliderTitle')}
            size="small"
            fullWidth
            required
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          />
          <TextField
            label={t('marketing.sliderSubtitle')}
            size="small"
            fullWidth
            value={form.subtitle}
            onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
          />
          <TextField
            label={t('marketing.sortOrder')}
            size="small"
            type="number"
            slotProps={{ htmlInput: { min: 0 } }}
            value={form.sortOrder}
            onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))}
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.isActive}
                onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                size="small"
              />
            }
            label={t('marketing.isActive')}
          />
        </div>

        <Box className="mt-4 flex gap-2">
          <Button variant="contained" onClick={handleSave} disabled={isBusy}>
            {isSaving ? <CircularProgress size={18} color="inherit" /> : t('common.save')}
          </Button>
          {editingId != null && (
            <Button variant="outlined" onClick={resetForm} disabled={isBusy}>
              {t('common.cancel')}
            </Button>
          )}
        </Box>
      </div>

      {/* Existing sliders list */}
      <DataState isLoading={isLoading} isError={isError} onRetry={refetch}>
        {sliders.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">{t('marketing.noSliders')}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {sliders.map((slider) => (
              <div
                key={slider.id}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
              >
                {slider.imageUrl ? (
                  <img
                    src={slider.imageUrl}
                    alt={slider.title}
                    className="h-12 w-20 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-20 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                    <ImageOutlinedIcon className="text-slate-400" fontSize="small" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                    {slider.title}
                  </p>
                  {slider.subtitle && (
                    <p className="truncate text-xs text-slate-500">{slider.subtitle}</p>
                  )}
                  <div className="mt-1 flex items-center gap-2">
                    {slider.sortOrder != null && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        #{slider.sortOrder}
                      </span>
                    )}
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                        slider.isActive
                          ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                      }`}
                    >
                      {slider.isActive ? t('marketing.active') : t('marketing.inactive')}
                    </span>
                  </div>
                </div>
                <Tooltip title={t('common.edit')}>
                  <IconButton size="small" onClick={() => handleEdit(slider)} disabled={isBusy}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('common.delete')}>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setDeleteTarget({ id: slider.id, title: slider.title })}
                    disabled={isBusy}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </div>
            ))}
          </div>
        )}
      </DataState>

      <ConfirmDialog
        open={deleteTarget != null}
        title={t('marketing.deleteSlider.title')}
        message={t('marketing.deleteSlider.message', { title: deleteTarget?.title ?? '' })}
        confirmLabel={t('common.delete')}
        destructive
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        loading={isDeleting}
      />
    </div>
  );
}
