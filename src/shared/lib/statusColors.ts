/**
 * Single source of truth for status → color (TRD §4, §13). Reused for order,
 * payment, return, and inventory pills so a status never gets a different color
 * on different screens. Pill classes include light + dark variants.
 *
 * Exact pill colors will be reconciled against the mockups when those screens
 * are built; the mapping itself stays centralized here.
 */
export type StatusTone = 'green' | 'amber' | 'blue' | 'gray' | 'red' | 'slate' | 'violet';

const TONE_CLASSES: Record<StatusTone, string> = {
  green: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  gray: 'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-300',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  slate: 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900',
  violet: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
};

const DEFAULT_TONE: StatusTone = 'gray';

/** Normalized status key → tone. Keys are lowercased with separators stripped. */
const STATUS_TONE: Record<string, StatusTone> = {
  // Order status (TRD §4.0)
  new: 'blue',
  ready: 'amber',
  shipped: 'slate',
  received: 'blue',
  delivered: 'green',
  cancelled: 'red',
  canceled: 'red',
  returned: 'violet',
  // Payment status
  pending: 'gray',
  paid: 'green',
  failed: 'red',
  refunded: 'violet',
  // Return status
  requested: 'amber',
  approved: 'green',
  rejected: 'red',
  completed: 'blue',
  // Inventory (Products mockup shows "Out of Stock" as a neutral gray pill)
  instock: 'green',
  lowstock: 'amber',
  outofstock: 'gray',
};

function normalize(status: string): string {
  return status.toLowerCase().replace(/[\s_-]/g, '');
}

export function getStatusTone(status: string): StatusTone {
  return STATUS_TONE[normalize(status)] ?? DEFAULT_TONE;
}

export function getStatusPillClasses(status: string): string {
  return TONE_CLASSES[getStatusTone(status)];
}
