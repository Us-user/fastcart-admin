import { CircularProgress } from '@mui/material';

import { BrandLogo } from './BrandLogo';

/** Full-viewport splash shown while auth state resolves (TRD §3.2/§11). */
export function FullScreenLoader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white dark:bg-slate-950">
      <BrandLogo tone="light" size={44} className="dark:hidden" />
      <BrandLogo tone="dark" size={44} className="hidden dark:inline-flex" />
      <CircularProgress size={28} />
    </div>
  );
}
