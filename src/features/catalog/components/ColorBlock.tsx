import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { getApiErrorMessage } from '@/shared/lib/apiError';
import { useSnackbar } from '@/shared/lib/useSnackbar';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { DataState } from '@/shared/ui/DataState';
import { useDeleteColorMutation, useGetColorsQuery } from '../colorsApi';
import type { Color } from '../types';
import { NewColorModal } from './NewColorModal';

const PAGE_SIZE = 100;

interface ColorBlockProps {
  /** Selected color ids. */
  value: number[];
  onChange: (ids: number[]) => void;
}

/**
 * Product-form Colour block (TRD §5.3): preset swatches that toggle selection
 * plus a "Create new" tile opening the New color modal. Each swatch carries
 * edit/delete affordances so colors stay fully manageable (TRD §9).
 */
export function ColorBlock({ value, onChange }: ColorBlockProps) {
  const { t } = useTranslation();
  const snackbar = useSnackbar();
  const { data, isLoading, isError, refetch } = useGetColorsQuery({ pageSize: PAGE_SIZE });
  const [deleteColor, { isLoading: deleting }] = useDeleteColorMutation();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Color | null>(null);
  const [removing, setRemoving] = useState<Color | null>(null);

  const toggle = (id: number) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  const confirmDelete = async () => {
    if (!removing) return;
    try {
      await deleteColor(removing.id).unwrap();
      onChange(value.filter((v) => v !== removing.id));
      snackbar.success(t('catalog.toast.colorDeleted'));
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.deleteError')));
    } finally {
      setRemoving(null);
    }
  };

  return (
    <DataState isLoading={isLoading} isError={isError} onRetry={refetch}>
      <div className="flex flex-wrap items-center gap-3">
        {(data?.items ?? []).map((color) => {
          const selected = value.includes(color.id);
          return (
            <div key={color.id} className="group relative">
              <Tooltip title={`${color.name} · ${color.hexCode}`}>
                <button
                  type="button"
                  onClick={() => toggle(color.id)}
                  aria-label={color.name}
                  aria-pressed={selected}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border transition-shadow ${
                    selected
                      ? 'border-transparent ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900'
                      : 'border-slate-200 dark:border-slate-600'
                  }`}
                  style={{ backgroundColor: color.hexCode }}
                >
                  {selected && (
                    <CheckIcon
                      fontSize="small"
                      className="text-white mix-blend-difference"
                      aria-hidden
                    />
                  )}
                </button>
              </Tooltip>

              {/* Management affordances (TRD §9) — revealed on hover/focus. */}
              <span className="pointer-events-none absolute -top-2 -right-2 flex gap-0.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => setEditing(color)}
                  aria-label={t('common.edit')}
                  className="pointer-events-auto flex h-5 w-5 items-center justify-center rounded-full bg-white text-blue-600 shadow ring-1 ring-slate-200 dark:bg-slate-800 dark:text-blue-400 dark:ring-slate-600"
                >
                  <EditOutlinedIcon sx={{ fontSize: 12 }} />
                </button>
                <button
                  type="button"
                  onClick={() => setRemoving(color)}
                  aria-label={t('common.delete')}
                  className="pointer-events-auto flex h-5 w-5 items-center justify-center rounded-full bg-white text-red-500 shadow ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-600"
                >
                  <DeleteOutlineIcon sx={{ fontSize: 12 }} />
                </button>
              </span>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex h-9 items-center gap-1 rounded-full border border-dashed border-slate-300 px-3 text-sm font-medium text-blue-600 transition-colors hover:border-blue-400 dark:border-slate-600 dark:text-blue-400"
        >
          <AddIcon sx={{ fontSize: 16 }} />
          {t('catalog.createNewColor')}
        </button>
      </div>

      <NewColorModal open={creating} onClose={() => setCreating(false)} />
      <NewColorModal open={Boolean(editing)} color={editing} onClose={() => setEditing(null)} />

      <ConfirmDialog
        open={Boolean(removing)}
        title={t('catalog.deleteColor.title')}
        message={removing ? t('catalog.deleteColor.message', { name: removing.name }) : ''}
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setRemoving(null)}
      />
    </DataState>
  );
}
