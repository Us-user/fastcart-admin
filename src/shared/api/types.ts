/** Standard backend response envelope — every endpoint wraps its payload. */
export interface ApiEnvelope<T> {
  success: boolean;
  message: string | null;
  data: T;
  errors: unknown;
}

/** Paged list envelope used by paginated GET endpoints (e.g. `/Products`, `/Brands`). */
export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
