/**
 * Locale-aware formatting helpers (TRD §13). Pass the active i18n language so
 * numbers/currency render per the selected locale. Prices are USD ($) to match
 * the mockups.
 */

export function formatCurrency(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** A single price, or a "from – to" range when a product's variants differ. */
export function formatPriceRange(from: number, max: number, locale: string): string {
  return max > from
    ? `${formatCurrency(from, locale)} – ${formatCurrency(max, locale)}`
    : formatCurrency(from, locale);
}

/** Locale-aware short date (e.g. "Jun 27, 2026"). Invalid input returns ''. */
export function formatDate(value: string | number | Date, locale: string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
}

/** Locale-aware date + time (e.g. "May 5, 4:20 PM"). Invalid input returns ''. */
export function formatDateTime(value: string | number | Date, locale: string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}
