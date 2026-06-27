import { useTranslation } from 'react-i18next';

type Tone = 'light' | 'dark';

interface BrandLogoProps {
  /** `dark` = white wordmark (on the dark panel); `light` = ink wordmark (on white surfaces). */
  tone?: Tone;
  /** Icon height in px; the wordmark scales relative to it. */
  size?: number;
  className?: string;
  /** Render only the cart mark, no wordmark. */
  iconOnly?: boolean;
}

/**
 * FastCart brand lockup — an orange delivery cart with a blue "speed" accent
 * plus the "fastcart" wordmark. Approximates the mockup branding (no logo asset
 * is shipped); reused on the auth panel (tone="dark") and the top bar.
 */
export function BrandLogo({
  tone = 'light',
  size = 40,
  className,
  iconOnly = false,
}: BrandLogoProps) {
  const { t } = useTranslation();
  const wordmarkColor = tone === 'dark' ? '#ffffff' : '#0f172a';

  return (
    <span
      className={`inline-flex items-center gap-3 ${className ?? ''}`}
      aria-label={t('app.name')}
    >
      <CartMark height={size} />
      {!iconOnly && (
        <span
          className="font-extrabold italic tracking-tight leading-none"
          style={{ color: wordmarkColor, fontSize: size * 0.78 }}
        >
          fastcart
        </span>
      )}
    </span>
  );
}

function CartMark({ height }: { height: number }) {
  const amber = '#F5A524';
  const blue = '#2F6BFF';
  return (
    <svg
      height={height}
      viewBox="0 0 72 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="presentation"
    >
      {/* motion / speed lines */}
      <line x1="2" y1="22" x2="20" y2="22" stroke={amber} strokeWidth="3" strokeLinecap="round" />
      <line x1="0" y1="32" x2="14" y2="32" stroke={amber} strokeWidth="3" strokeLinecap="round" />
      {/* cart handle */}
      <path
        d="M16 8 H24 L29 36"
        stroke={amber}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* cart basket outline */}
      <path d="M27 16 H66 L60 38 H31 Z" stroke={amber} strokeWidth="3.2" strokeLinejoin="round" />
      {/* blue speed fill inside the basket */}
      <path d="M33 21 H60 L57 29 H35 Z" fill={blue} />
      <path d="M36 32 H56 L55 35 H37 Z" fill={amber} />
      {/* wheels */}
      <circle cx="35" cy="48" r="4.2" stroke={amber} strokeWidth="3" />
      <circle cx="56" cy="48" r="4.2" stroke={amber} strokeWidth="3" />
    </svg>
  );
}
