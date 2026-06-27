import { useEffect, useMemo, type ReactNode } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

import { useAppSelector } from '@/app/hooks';
import { selectThemeMode } from '@/features/theme/themeSlice';

/** Mockup primary blue ("Log in", "Save", "+ Add order"). */
const PRIMARY_BLUE = '#2563EB';

/**
 * Single source of truth for dark mode (TRD §1.1): the Redux theme mode drives
 * both the MUI palette (`palette.mode`) and the Tailwind `dark` class on <html>,
 * so the two can never disagree. Shared control styling (mockup blue, rounded
 * fields, non-uppercase buttons) is centralized here per TRD §13.
 */
export function AppThemeProvider({ children }: { children: ReactNode }) {
  const mode = useAppSelector(selectThemeMode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: PRIMARY_BLUE },
        },
        shape: { borderRadius: 8 },
        typography: {
          button: { textTransform: 'none', fontWeight: 600 },
        },
        components: {
          MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: { root: { paddingTop: 10, paddingBottom: 10 } },
          },
        },
      }),
    [mode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
