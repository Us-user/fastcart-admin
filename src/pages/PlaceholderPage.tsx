import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/shared/ui/PageHeader';

/**
 * Temporary stand-in for screens delivered in later phases, so the app shell is
 * navigable now. Replaced by the real module as each phase lands.
 */
export function PlaceholderPage({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader title={t(titleKey)} />
      <div className="flex min-h-[50vh] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500">
        {t('common.comingSoon')}
      </div>
    </>
  );
}
