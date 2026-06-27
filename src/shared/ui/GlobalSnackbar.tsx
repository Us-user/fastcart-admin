import { Alert, Snackbar } from '@mui/material';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { hideSnackbar, selectSnackbar } from '@/features/ui/uiSlice';

/**
 * App-wide snackbar host (TRD §4.1). Mounted once near the root; mutations push
 * messages via `useSnackbar`. Bottom-right, auto-hides, filled severity colors.
 */
export function GlobalSnackbar() {
  const dispatch = useAppDispatch();
  const { open, message, severity, key } = useAppSelector(selectSnackbar);

  return (
    <Snackbar
      key={key}
      open={open}
      autoHideDuration={5000}
      onClose={(_, reason) => {
        if (reason !== 'clickaway') {
          dispatch(hideSnackbar());
        }
      }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={() => dispatch(hideSnackbar())}
        severity={severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
