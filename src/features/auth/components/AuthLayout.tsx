import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { BrandLogo } from '@/shared/ui/BrandLogo';

/** Diagonal teal→navy wash matching the auth mockups' left panel. */
const PANEL_BACKGROUND =
  'radial-gradient(120% 120% at 0% 0%, rgba(20,120,110,0.55) 0%, rgba(20,120,110,0) 45%),' +
  'radial-gradient(130% 120% at 100% 0%, rgba(70,100,170,0.45) 0%, rgba(70,100,170,0) 55%),' +
  'linear-gradient(135deg, #142a3f 0%, #0f1c33 100%)';

/**
 * Split auth layout (TRD §3.4): branded dark panel on the left, the form slot on
 * the right. Reused by Login, Forgot password and Reset password so the three
 * screens stay pixel-consistent with the mockups.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen">
      {/* Left branded panel — hidden below md, matching the desktop mockup */}
      <aside
        className="relative hidden w-[53%] flex-col justify-center px-16 md:flex"
        style={{ background: PANEL_BACKGROUND }}
      >
        <p className="mb-6 text-2xl font-normal text-white">{t('auth.welcome')}</p>
        <BrandLogo tone="dark" size={48} />
      </aside>

      {/* Right form panel */}
      <main className="flex w-full items-center justify-center bg-white px-6 py-12 dark:bg-slate-950 md:w-[47%]">
        <div className="w-full max-w-[400px]">
          {/* Compact brand for mobile, where the left panel is hidden */}
          <div className="mb-10 flex justify-center md:hidden">
            <BrandLogo tone="light" size={40} className="dark:hidden" />
            <BrandLogo tone="dark" size={40} className="hidden dark:inline-flex" />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
