import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { BannersTab } from '@/features/catalog/components/BannersTab';
import { BrandsTab } from '@/features/catalog/components/BrandsTab';
import {
  CategoriesTab,
  type CategoryDialogState,
} from '@/features/catalog/components/CategoriesTab';

type TabKey = 'categories' | 'brands' | 'banners';

const TABS: { key: TabKey; labelKey: string }[] = [
  { key: 'categories', labelKey: 'catalog.tabs.categories' },
  { key: 'brands', labelKey: 'catalog.tabs.brands' },
  { key: 'banners', labelKey: 'catalog.tabs.banners' },
];

/**
 * "Other" tabbed screen (TRD §5.4): Categories / Brands / Banners, in the
 * mockup's pill-tab style. Later phases add Messages / Newsletter tabs here.
 */
export function OtherPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>('categories');
  const [categoryDialog, setCategoryDialog] = useState<CategoryDialogState>(null);

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <nav className="flex gap-2">
          {TABS.map(({ key, labelKey }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === key
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {t(labelKey)}
            </button>
          ))}
        </nav>

        {activeTab === 'categories' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCategoryDialog({ category: null })}
          >
            {t('catalog.addNew')}
          </Button>
        )}
      </div>

      {activeTab === 'categories' && (
        <CategoriesTab dialog={categoryDialog} onDialogChange={setCategoryDialog} />
      )}
      {activeTab === 'brands' && <BrandsTab />}
      {activeTab === 'banners' && <BannersTab />}
    </>
  );
}
