import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { Category } from '../types';

interface CategoryCardProps {
  category: Category;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * Category grid card (TRD §5.4 mockup): centered icon/image, name bottom-left,
 * edit pencil (+ delete) top-right. Clicking the card selects it to reveal its
 * subcategories in the master–detail panel (TRD §6.1).
 */
export function CategoryCard({
  category,
  selected,
  onSelect,
  onEdit,
  onDelete,
}: CategoryCardProps) {
  const { t } = useTranslation();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`relative flex cursor-pointer flex-col rounded-xl border p-4 transition-colors ${
        selected
          ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500 dark:bg-blue-500/10'
          : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
      }`}
    >
      <div className="absolute right-2 top-2 flex">
        <IconButton
          size="small"
          aria-label={t('common.edit')}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <EditOutlinedIcon fontSize="small" className="text-blue-600 dark:text-blue-400" />
        </IconButton>
        <IconButton
          size="small"
          aria-label={t('common.delete')}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <DeleteOutlineIcon fontSize="small" className="text-red-500" />
        </IconButton>
      </div>

      <div className="flex h-16 items-center justify-center text-slate-700 dark:text-slate-200">
        {category.imageUrl ? (
          <img src={category.imageUrl} alt={category.name} className="h-12 w-12 object-contain" />
        ) : (
          <CategoryOutlinedIcon sx={{ fontSize: 40 }} />
        )}
      </div>

      <p className="mt-3 truncate font-medium text-slate-900 dark:text-white">{category.name}</p>
    </div>
  );
}
