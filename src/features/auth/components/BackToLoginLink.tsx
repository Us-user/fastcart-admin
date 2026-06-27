import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';

/** "← Log in" back link shown atop the Forgot / Reset password screens. */
export function BackToLoginLink() {
  const { t } = useTranslation();
  return (
    <RouterLink
      to="/login"
      className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
    >
      <ArrowBackIcon fontSize="small" />
      {t('auth.login')}
    </RouterLink>
  );
}
