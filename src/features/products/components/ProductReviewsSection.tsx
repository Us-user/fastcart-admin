import { useState } from 'react';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { IconButton, Rating } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useDeleteReviewMutation, useGetProductReviewsQuery } from '@/features/reviews/reviewsApi';
import type { ProductReview } from '@/features/reviews/types';
import { getApiErrorMessage } from '@/shared/lib/apiError';
import { formatDate } from '@/shared/lib/format';
import { useSnackbar } from '@/shared/lib/useSnackbar';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { DataState } from '@/shared/ui/DataState';
import { PaginationFooter } from '@/shared/ui/PaginationFooter';
import { card, sectionTitle } from './editStyles';

const PAGE_SIZE = 5;

interface ProductReviewsSectionProps {
  productId: number;
}

/**
 * Review moderation on the product edit screen (TRD §6.8): the per-product
 * review list with a delete (moderate) action. Reviews are read from
 * `GET /products/{id}/reviews`; deleting hits `DELETE /reviews/{id}`.
 */
export function ProductReviewsSection({ productId }: ProductReviewsSectionProps) {
  const { t, i18n } = useTranslation();
  const snackbar = useSnackbar();
  const [page, setPage] = useState(1);
  const [removing, setRemoving] = useState<ProductReview | null>(null);

  const { data, isLoading, isFetching, isError, refetch } = useGetProductReviewsQuery({
    productId,
    pageNumber: page,
    pageSize: PAGE_SIZE,
  });
  const [deleteReview, { isLoading: deleting }] = useDeleteReviewMutation();

  const reviews = data?.reviews;
  const items = reviews?.items ?? [];

  const confirmDelete = async () => {
    if (!removing) return;
    try {
      await deleteReview({ reviewId: removing.id, productId }).unwrap();
      snackbar.success(t('products.edit.reviewDeleted'));
      // Step back a page if the last item on this page was removed.
      if (items.length === 1 && page > 1) setPage((p) => p - 1);
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.deleteError')));
    } finally {
      setRemoving(null);
    }
  };

  return (
    <section className={card}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className={sectionTitle}>{t('products.edit.reviews')}</h2>
        {data && (
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Rating value={data.summary.average} precision={0.5} size="small" readOnly />
            <span>
              {data.summary.average.toFixed(1)} ·{' '}
              {t('common.resultsCount', { count: data.summary.count })}
            </span>
          </div>
        )}
      </div>

      <DataState
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        isEmpty={items.length === 0 && !isFetching}
        emptyState={
          <p className="py-6 text-center text-sm text-slate-400 dark:text-slate-500">
            {t('products.edit.noReviews')}
          </p>
        }
      >
        <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
          {items.map((review) => (
            <li key={review.id} className="flex items-start justify-between gap-4 py-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Rating value={review.rating} size="small" readOnly />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {review.authorName || t('products.edit.anonymous')}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {formatDate(review.createdAt, i18n.language)}
                  </span>
                </div>
                {review.comment && (
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {review.comment}
                  </p>
                )}
              </div>
              <IconButton
                size="small"
                onClick={() => setRemoving(review)}
                aria-label={t('common.delete')}
              >
                <DeleteOutlineIcon fontSize="small" className="text-red-500" />
              </IconButton>
            </li>
          ))}
        </ul>

        {reviews && reviews.totalPages > 1 && (
          <PaginationFooter
            page={reviews.pageNumber}
            pageCount={reviews.totalPages}
            totalCount={reviews.totalCount}
            onChange={setPage}
          />
        )}
      </DataState>

      <ConfirmDialog
        open={Boolean(removing)}
        title={t('products.edit.deleteReview.title')}
        message={t('products.edit.deleteReview.message')}
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setRemoving(null)}
      />
    </section>
  );
}
