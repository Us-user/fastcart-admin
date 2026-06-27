import { useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { TagBlock } from '@/features/catalog/components/TagBlock';
import type { ProductDetail } from '../types';
import { EditInfoSection } from './EditInfoSection';
import { ProductImagesSection } from './ProductImagesSection';
import { ProductOptionsSection } from './ProductOptionsSection';
import { ProductReviewsSection } from './ProductReviewsSection';
import { ProductVariantsSection } from './ProductVariantsSection';
import { card, sectionTitle } from './editStyles';

interface ProductEditFormProps {
  detail: ProductDetail;
}

/**
 * Edit product screen (TRD §5.3, §8.2, §8.3). Unlike Create's single multipart
 * POST, edit is **sectioned**: each card persists via its own endpoint. Reuses
 * the Add form's visual language (mockup `Detail products.png`); colours are
 * managed as a "Color" option inside the Options section on an existing product.
 */
export function ProductEditForm({ detail }: ProductEditFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tagIds, setTagIds] = useState<number[]>(detail.tags.map((tag) => tag.id));

  return (
    <div>
      {/* Header: breadcrumb + back/cancel (no global Save — sections save themselves) */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <IconButton onClick={() => navigate('/products')} aria-label={t('common.cancel')}>
            <ArrowBackIcon />
          </IconButton>
          <h1 className="text-2xl font-bold">
            <span className="text-slate-900 dark:text-white">{t('nav.products')}</span>
            <span className="text-slate-400 dark:text-slate-500">
              {' / '}
              {t('products.edit.breadcrumb')}
            </span>
          </h1>
        </div>
        <Button variant="outlined" color="inherit" onClick={() => navigate('/products')}>
          {t('products.edit.backToProducts')}
        </Button>
      </div>

      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        {t('products.edit.sectionedHint')}
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <EditInfoSection detail={detail} tagIds={tagIds} />
          <ProductOptionsSection productId={detail.id} options={detail.options} />
          <ProductVariantsSection
            productId={detail.id}
            variants={detail.variants}
            options={detail.options}
          />
          <ProductReviewsSection productId={detail.id} />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <section className={card}>
            <h2 className={`mb-1 ${sectionTitle}`}>{t('products.form.tags')}</h2>
            <p className="mb-4 text-xs text-slate-400 dark:text-slate-500">
              {t('products.edit.tagsHint')}
            </p>
            <TagBlock value={tagIds} onChange={setTagIds} />
          </section>

          <ProductImagesSection productId={detail.id} images={detail.images} />
        </div>
      </div>
    </div>
  );
}
