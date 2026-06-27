import { useEffect, useRef, useState } from 'react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import {
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  IconButton,
  MenuItem,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useGetCategoriesQuery } from '@/features/catalog/categoriesApi';
import { getApiErrorMessage } from '@/shared/lib/apiError';
import { useSnackbar } from '@/shared/lib/useSnackbar';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { DataState } from '@/shared/ui/DataState';
import { useDeleteBannerMutation, useGetBannersQuery } from '../bannersApi';
import { useBannerMutations } from '../useBannerMutations';

interface BannerFormState {
  title: string;
  categoryId: string;
  endsAt: string;
  isActive: boolean;
  image: File | null;
  previewUrl: string | null;
}

const EMPTY_FORM: BannerFormState = {
  title: '',
  categoryId: '',
  endsAt: '',
  isActive: true,
  image: null,
  previewUrl: null,
};

/** Formats a future ISO date as "Xd Yh Zm Ws remaining" or "Expired". */
function useCountdown(endsAt: string | null) {
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (!endsAt) {
      setLabel('');
      return;
    }
    const tick = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) {
        setLabel('Expired');
        return;
      }
      const d = Math.floor(diff / 86_400_000);
      const h = Math.floor((diff % 86_400_000) / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setLabel(`${d}d ${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  return label;
}

function CountdownChip({ endsAt }: { endsAt: string | null }) {
  const label = useCountdown(endsAt);
  if (!label) return null;
  return (
    <span className="flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
      <AccessTimeIcon sx={{ fontSize: 12 }} />
      {label}
    </span>
  );
}

export function BannerSection() {
  const { t } = useTranslation();
  const snackbar = useSnackbar();

  const { data: banners = [], isLoading, isError, refetch } = useGetBannersQuery();
  const { data: categoriesData } = useGetCategoriesQuery();
  const [deleteBanner, { isLoading: isDeleting }] = useDeleteBannerMutation();
  const { saveBanner, isSaving } = useBannerMutations();

  const [form, setForm] = useState<BannerFormState>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      await saveBanner({
        title: form.title.trim(),
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
        endsAt: form.endsAt || undefined,
        isActive: form.isActive,
        image: form.image ?? undefined,
      });
      snackbar.success(t('marketing.toast.bannerCreated'));
      resetForm();
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.saveError')));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBanner(deleteTarget.id).unwrap();
      snackbar.success(t('marketing.toast.bannerDeleted'));
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.deleteError')));
    } finally {
      setDeleteTarget(null);
    }
  };

  const categories = categoriesData ?? [];
  const isBusy = isSaving || isDeleting;

  return (
    <div className="flex flex-col gap-4">
      {/* Form card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <Typography variant="subtitle1" className="mb-4 font-semibold">
          {t('marketing.addBanner')}
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
            label={t('marketing.bannerTitle')}
            size="small"
            fullWidth
            required
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          />
          <TextField
            select
            label={t('marketing.bannerCategory')}
            size="small"
            fullWidth
            value={form.categoryId}
            onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
          >
            <MenuItem value="">{t('marketing.noCategory')}</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={String(cat.id)}>
                {cat.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label={t('marketing.endsAt')}
            size="small"
            fullWidth
            type="datetime-local"
            slotProps={{ inputLabel: { shrink: true } }}
            value={form.endsAt}
            onChange={(e) => setForm((p) => ({ ...p, endsAt: e.target.value }))}
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
          <Button variant="outlined" onClick={resetForm} disabled={isBusy}>
            {t('common.cancel')}
          </Button>
        </Box>
      </div>

      {/* Existing banners list */}
      <DataState isLoading={isLoading} isError={isError} onRetry={refetch}>
        {banners.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">{t('marketing.noBanners')}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
              >
                {banner.imageUrl ? (
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="h-12 w-20 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-20 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                    <ImageOutlinedIcon className="text-slate-400" fontSize="small" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                    {banner.title}
                  </p>
                  {banner.categoryName && (
                    <p className="truncate text-xs text-slate-500">{banner.categoryName}</p>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <CountdownChip endsAt={banner.endsAt} />
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                        banner.isActive
                          ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                      }`}
                    >
                      {banner.isActive ? t('marketing.active') : t('marketing.inactive')}
                    </span>
                  </div>
                </div>
                <Tooltip title={t('common.delete')}>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setDeleteTarget({ id: banner.id, title: banner.title })}
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
        title={t('marketing.deleteBanner.title')}
        message={t('marketing.deleteBanner.message', { title: deleteTarget?.title ?? '' })}
        confirmLabel={t('common.delete')}
        destructive
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        loading={isDeleting}
      />
    </div>
  );
}
