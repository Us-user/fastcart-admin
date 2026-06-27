import type { ReactNode } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface DataStateProps {
  isLoading: boolean;
  isError: boolean;
  /** Whether the loaded data is empty — renders `emptyState` instead of children. */
  isEmpty?: boolean;
  emptyState?: ReactNode;
  onRetry?: () => void;
  children: ReactNode;
}

/**
 * Standard data-screen wrapper (TRD §11): centered spinner while loading, an
 * error message with a retry action on failure, the empty state when there is
 * no data, otherwise the content.
 */
export function DataState({
  isLoading,
  isError,
  isEmpty = false,
  emptyState,
  onRetry,
  children,
}: DataStateProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-slate-500 dark:text-slate-400">
        <p>{t('common.loadError')}</p>
        {onRetry && (
          <Button variant="outlined" onClick={onRetry}>
            {t('common.retry')}
          </Button>
        )}
      </div>
    );
  }

  if (isEmpty && emptyState) {
    return <>{emptyState}</>;
  }

  return <>{children}</>;
}
