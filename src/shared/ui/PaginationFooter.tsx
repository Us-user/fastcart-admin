import { Pagination } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface PaginationFooterProps {
  page: number;
  pageCount: number;
  totalCount: number;
  onChange: (page: number) => void;
}

/**
 * Numbered pagination + results count, matching the mockup footer
 * ("← 1 2 3 … 24 →" on the left, "274 Results" on the right). The active page is
 * a blue pill; built on MUI Pagination so keyboard/aria behavior comes for free.
 */
export function PaginationFooter({ page, pageCount, totalCount, onChange }: PaginationFooterProps) {
  const { t } = useTranslation();

  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
      <Pagination
        page={page}
        count={pageCount}
        onChange={(_, next) => onChange(next)}
        shape="rounded"
        siblingCount={1}
        boundaryCount={1}
        sx={{
          '& .MuiPaginationItem-root': {
            color: 'text.secondary',
            border: 'none',
          },
          '& .MuiPaginationItem-root.Mui-selected': {
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            color: '#2563EB',
            fontWeight: 600,
          },
          '& .MuiPaginationItem-root.Mui-selected:hover': {
            backgroundColor: 'rgba(37, 99, 235, 0.18)',
          },
        }}
      />
      <span className="text-sm text-slate-500 dark:text-slate-400">
        {t('common.resultsCount', { count: totalCount })}
      </span>
    </div>
  );
}
