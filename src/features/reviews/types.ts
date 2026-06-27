import type { PagedResult } from '@/shared/api/types';

/** A single product review (moderation target, TRD §6.8). */
export interface ProductReview {
  id: number;
  rating: number;
  comment: string | null;
  authorName: string | null;
  createdAt: string;
}

/** Aggregate ratings returned alongside the review list. */
export interface ReviewSummary {
  average: number;
  count: number;
  /** Star → number of reviews, keyed `"1"`..`"5"`. */
  distribution: Record<string, number>;
}

/** `GET /products/{id}/reviews` payload: summary + a paged review list. */
export interface ProductReviewsResponse {
  summary: ReviewSummary;
  reviews: PagedResult<ProductReview>;
}

export interface GetProductReviewsArgs {
  productId: number;
  pageNumber?: number;
  pageSize?: number;
}
