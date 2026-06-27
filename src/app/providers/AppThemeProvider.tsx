import { useEffect, useMemo, type ReactNode } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

import { useAppSelector } from '@/app/hooks';
import { selectThemeMode } from '@/features/theme/themeSlice';

/**
 * Single source of truth for dark mode (TRD §1.1): the Redux theme mode drives
 * both the MUI palette (`palette.mode`) and the Tailwind `dark` class on <html>,
 * so the two can never disagree.
 */
export function AppThemeProvider({ children }: { children: ReactNode }) {
  const mode = useAppSelector(selectThemeMode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
