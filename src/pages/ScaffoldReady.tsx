import { Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import i18n from '@/app/i18n';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectThemeMode, toggleThemeMode } from '@/features/theme/themeSlice';

/**
 * Phase 0 smoke screen. Rendering it correctly proves the whole stack is wired:
 * MUI components, Tailwind layout + `dark:` variant, Redux (theme mode), and
 * i18next (EN/RU). Replaced by the real auth flow / app shell in Phase 1.
 */
export function ScaffoldReady() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectThemeMode);

  const toggleLanguage = () => {
    void i18n.changeLanguage(i18n.language.startsWith('ru') ? 'en' : 'ru');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6 dark:bg-gray-950">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h5" className="font-semibold">
              {t('app.name')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('scaffold.ready')}
            </Typography>
            <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              {t('scaffold.stackOk')}
            </div>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={() => dispatch(toggleThemeMode())}>
                {mode === 'dark' ? t('theme.light') : t('theme.dark')}
              </Button>
              <Button variant="outlined" onClick={toggleLanguage}>
                {t('language.switch')}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </div>
  );
}
