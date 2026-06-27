import { useState, type KeyboardEvent } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Chip, IconButton, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { getApiErrorMessage } from '@/shared/lib/apiError';
import { useSnackbar } from '@/shared/lib/useSnackbar';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { DataState } from '@/shared/ui/DataState';
import {
  useCreateTagMutation,
  useDeleteTagMutation,
  useGetTagsQuery,
  useUpdateTagMutation,
} from '../tagsApi';
import type { Tag } from '../types';

interface TagBlockProps {
  /** Selected tag ids → sent to the product API as `TagIds`. */
  value: number[];
  onChange: (ids: number[]) => void;
}

/**
 * Product-form Tags block (TRD §5.3): selected tags render as removable chips;
 * a name field with a ✓ creates-or-selects a tag. Existing tags are selectable
 * and manageable (rename/delete) so tags stay fully manageable (TRD §9).
 */
export function TagBlock({ value, onChange }: TagBlockProps) {
  const { t } = useTranslation();
  const snackbar = useSnackbar();
  const { data: tags, isLoading, isError, refetch } = useGetTagsQuery();
  const [createTag, { isLoading: creating }] = useCreateTagMutation();
  const [updateTag, { isLoading: updating }] = useUpdateTagMutation();
  const [deleteTag, { isLoading: deleting }] = useDeleteTagMutation();

  const [input, setInput] = useState('');
  const [editing, setEditing] = useState<Tag | null>(null);
  const [editText, setEditText] = useState('');
  const [removing, setRemoving] = useState<Tag | null>(null);

  const all = tags ?? [];
  const select = (id: number) => {
    if (!value.includes(id)) onChange([...value, id]);
  };

  const addByName = async () => {
    const name = input.trim();
    if (!name) return;
    const existing = all.find((tag) => tag.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      select(existing.id);
      setInput('');
      return;
    }
    try {
      await createTag({ name }).unwrap();
      // Create returns no id; refetch and select the tag by name.
      const fresh = await refetch().unwrap();
      const created = fresh.find((tag) => tag.name.toLowerCase() === name.toLowerCase());
      if (created) select(created.id);
      setInput('');
      snackbar.success(t('catalog.toast.tagCreated'));
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.saveError')));
    }
  };

  const onAddKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void addByName();
    }
  };

  const saveRename = async () => {
    if (!editing) return;
    const name = editText.trim();
    if (!name || name === editing.name) {
      setEditing(null);
      return;
    }
    try {
      await updateTag({ id: editing.id, name }).unwrap();
      snackbar.success(t('catalog.toast.tagUpdated'));
      setEditing(null);
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.saveError')));
    }
  };

  const confirmDelete = async () => {
    if (!removing) return;
    try {
      await deleteTag(removing.id).unwrap();
      onChange(value.filter((v) => v !== removing.id));
      snackbar.success(t('catalog.toast.tagDeleted'));
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.deleteError')));
    } finally {
      setRemoving(null);
    }
  };

  const selectedTags = all.filter((tag) => value.includes(tag.id));
  const availableTags = all.filter((tag) => !value.includes(tag.id));

  return (
    <DataState isLoading={isLoading} isError={isError} onRetry={refetch}>
      <div className="flex flex-col gap-4">
        {/* Add by name */}
        <div className="flex items-center gap-2">
          <TextField
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onAddKeyDown}
            placeholder={t('catalog.tagName')}
            size="small"
            fullWidth
            slotProps={{ htmlInput: { 'aria-label': t('catalog.tagName') } }}
          />
          <IconButton
            onClick={() => void addByName()}
            disabled={creating || !input.trim()}
            aria-label={t('common.add')}
            className="shrink-0"
            sx={{
              bgcolor: 'primary.main',
              color: 'common.white',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            <CheckIcon fontSize="small" />
          </IconButton>
        </div>

        {/* Selected tags — removable chips (mockup) */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Chip
                key={tag.id}
                label={tag.name}
                onDelete={() => onChange(value.filter((v) => v !== tag.id))}
                color="primary"
                variant="filled"
              />
            ))}
          </div>
        )}

        {/* Existing tags — selectable + manageable */}
        {availableTags.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-slate-400 dark:text-slate-500">
              {t('catalog.existingTags')}
            </p>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) =>
                editing?.id === tag.id ? (
                  <span key={tag.id} className="flex items-center gap-1">
                    <TextField
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          void saveRename();
                        }
                        if (e.key === 'Escape') setEditing(null);
                      }}
                      size="small"
                      autoFocus
                      sx={{ width: 140 }}
                      slotProps={{ htmlInput: { 'aria-label': t('catalog.tagName') } }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => void saveRename()}
                      disabled={updating}
                      aria-label={t('common.save')}
                    >
                      <CheckIcon fontSize="small" className="text-blue-600 dark:text-blue-400" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setEditing(null)}
                      aria-label={t('common.cancel')}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </span>
                ) : (
                  <span key={tag.id} className="group relative">
                    <Chip
                      label={tag.name}
                      onClick={() => select(tag.id)}
                      variant="outlined"
                      sx={{ pr: 3.5 }}
                    />
                    <span className="absolute top-1/2 right-1 flex -translate-y-1/2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                      <IconButton
                        size="small"
                        sx={{ p: 0.25 }}
                        onClick={() => {
                          setEditing(tag);
                          setEditText(tag.name);
                        }}
                        aria-label={t('common.edit')}
                      >
                        <EditOutlinedIcon
                          sx={{ fontSize: 13 }}
                          className="text-blue-600 dark:text-blue-400"
                        />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{ p: 0.25 }}
                        onClick={() => setRemoving(tag)}
                        aria-label={t('common.delete')}
                      >
                        <DeleteOutlineIcon sx={{ fontSize: 13 }} className="text-red-500" />
                      </IconButton>
                    </span>
                  </span>
                ),
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(removing)}
        title={t('catalog.deleteTag.title')}
        message={removing ? t('catalog.deleteTag.message', { name: removing.name }) : ''}
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setRemoving(null)}
      />
    </DataState>
  );
}
