import { useMemo } from 'react';

import { useAppDispatch } from '@/app/hooks';
import { showSnackbar } from '@/features/ui/uiSlice';

/**
 * Thin wrapper over the global snackbar (TRD §4.1). Callers pass already
 * translated strings since they have access to `t`.
 */
export function useSnackbar() {
  const dispatch = useAppDispatch();
  return useMemo(
    () => ({
      success: (message: string) => dispatch(showSnackbar({ message, severity: 'success' })),
      error: (message: string) => dispatch(showSnackbar({ message, severity: 'error' })),
      info: (message: string) => dispatch(showSnackbar({ message, severity: 'info' })),
      warning: (message: string) => dispatch(showSnackbar({ message, severity: 'warning' })),
    }),
    [dispatch],
  );
}
