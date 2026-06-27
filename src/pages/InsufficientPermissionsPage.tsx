import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useLogout } from '@/features/auth/useLogout';
import { BrandLogo } from '@/shared/ui/BrandLogo';

/**
 * Shown to authenticated users who lack the admin role (TRD §3.3). Not a crash
 * or silent logout — a clear message with a way out (log out / back to login).
 */
export function InsufficientPermissionsPage() {
  const { t } = useTranslation();
  const logout = useLogout();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gray-50 px-6 dark:bg-slate-950">
      <BrandLogo tone="light" size={40} className="dark:hidden" />
      <BrandLogo tone="dark" size={40} className="hidden dark:inline-flex" />

      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400">
          <LockOutlinedIcon fontSize="large" />
        </div>
        <h1 className="mb-3 text-2xl font-bold text-slate-900 dark:text-white">
          {t('permissions.title')}
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {t('permissions.description')}
        </p>
        <Button variant="contained" fullWidth onClick={() => void logout()}>
          {t('permissions.logout')}
        </Button>
      </div>
    </div>
  );
}
