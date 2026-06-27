import { baseApi } from '@/shared/api/baseApi';
import type { ApiEnvelope } from '@/shared/api/types';
import type { GetProductReviewsArgs, ProductReviewsResponse } from './types';

/**
 * Review moderation (TRD §6.8). Reviews are per-product, so the list is keyed by
 * productId; deleting a review invalidates that product's review list (and its
 * detail, whose `reviewCount`/`avgRating` change).
 */
export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductReviews: builder.query<ProductReviewsResponse, GetProductReviewsArgs>({
      query: ({ productId, pageNumber = 1, pageSize = 10 }) => ({
        url: `/products/${productId}/reviews`,
        params: { pageNumber, pageSize },
      }),
      transformResponse: (raw: ApiEnvelope<ProductReviewsResponse>) => raw.data,
      providesTags: (_result, _error, { productId }) => [{ type: 'Review', id: productId }],
    }),
    deleteReview: builder.mutation<void, { reviewId: number; productId: number }>({
      query: ({ reviewId }) => ({ url: `/reviews/${reviewId}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { productId }) => [
        { type: 'Review', id: productId },
        { type: 'Product', id: productId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const { useGetProductReviewsQuery, useDeleteReviewMutation } = reviewsApi;
