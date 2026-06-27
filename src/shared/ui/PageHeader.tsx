import type { ReactNode } from 'react';

/** Standard page title row: bold heading top-left, optional action on the right. */
export function PageHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{title}</h1>
      {action}
    </div>
  );
}
