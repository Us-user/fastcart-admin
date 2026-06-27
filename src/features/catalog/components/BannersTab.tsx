import { useTranslation } from 'react-i18next';

/**
 * Banners tab placeholder. The full Main sliders / Banner editors (TRD §5.4,
 * §6.10) land in Phase 6 (Marketing); the tab exists now so the shell matches
 * the mockup's three tabs.
 */
export function BannersTab() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[40vh] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500">
      {t('common.comingSoon')}
    </div>
  );
}
