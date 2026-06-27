import { useTranslation } from 'react-i18next';

import { BannerSection } from '@/features/marketing/components/BannerSection';
import { SlidersSection } from '@/features/marketing/components/SlidersSection';

/**
 * Banners tab (TRD §5.4, §6.10): two-column layout — Main sliders on the left,
 * Banner on the right. No mockup → uses existing card/section visual language.
 */
export function BannersTab() {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-800 dark:text-slate-100">
          {t('marketing.mainSliders')}
        </h2>
        <SlidersSection />
      </section>
      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-800 dark:text-slate-100">
          {t('marketing.banners')}
        </h2>
        <BannerSection />
      </section>
    </div>
  );
}
