import { useState, type KeyboardEvent } from 'react';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { Chip, IconButton, InputAdornment, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { EditableOption } from '../types';

interface OptionsEditorProps {
  value: EditableOption[];
  onChange: (options: EditableOption[]) => void;
}

/**
 * Options editor (TRD §5.3, mockup `Detail products.png`): one row per option —
 * a name field on the left and its value chips on the right. Values are added
 * inline (type + Enter / ✓) and removed via the chip ×, matching the form
 * mockup; "+ Add more" appends another option row.
 */
export function OptionsEditor({ value, onChange }: OptionsEditorProps) {
  const { t } = useTranslation();

  const updateOption = (index: number, next: EditableOption) =>
    onChange(value.map((opt, i) => (i === index ? next : opt)));

  const removeOption = (index: number) => onChange(value.filter((_, i) => i !== index));

  const addOption = () => onChange([...value, { name: '', values: [] }]);

  return (
    <div className="flex flex-col gap-5">
      {value.map((option, index) => (
        <OptionRow
          key={index}
          index={index}
          option={option}
          onChange={(next) => updateOption(index, next)}
          onRemove={() => removeOption(index)}
        />
      ))}

      <button
        type="button"
        onClick={addOption}
        className="flex w-fit items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400"
      >
        <AddIcon sx={{ fontSize: 18 }} />
        {t('products.form.addMore')}
      </button>
    </div>
  );
}

interface OptionRowProps {
  index: number;
  option: EditableOption;
  onChange: (next: EditableOption) => void;
  onRemove: () => void;
}

function OptionRow({ index, option, onChange, onRemove }: OptionRowProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');

  const addValue = () => {
    const v = draft.trim();
    if (!v) return;
    if (!option.values.includes(v)) onChange({ ...option, values: [...option.values, v] });
    setDraft('');
  };

  const removeValue = (v: string) =>
    onChange({ ...option, values: option.values.filter((x) => x !== v) });

  const onDraftKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addValue();
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <TextField
        label={t('products.form.optionN', { n: index + 1 })}
        value={option.name}
        onChange={(e) => onChange({ ...option, name: e.target.value })}
        fullWidth
        slotProps={{
          htmlInput: { 'aria-label': t('products.form.optionN', { n: index + 1 }) },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  size="small"
                  onClick={onRemove}
                  aria-label={t('products.form.removeOption')}
                >
                  <DeleteOutlineIcon fontSize="small" className="text-red-500" />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <div>
        <span className="mb-1 block text-xs text-slate-400 dark:text-slate-500">
          {t('products.form.value')}
        </span>
        <div className="flex min-h-[44px] flex-wrap items-center gap-1.5 rounded-lg border border-slate-300 px-2 py-1.5 focus-within:border-blue-500 dark:border-slate-600">
          {option.values.map((v) => (
            <Chip key={v} label={v} size="small" onDelete={() => removeValue(v)} />
          ))}
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onDraftKeyDown}
            placeholder={option.values.length === 0 ? t('products.form.value') : ''}
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
  );
}
