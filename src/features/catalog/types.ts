/** Standard backend response envelope — every endpoint wraps its payload. */
export interface ApiEnvelope<T> {
  success: boolean;
  message: string | null;
  data: T;
  errors: unknown;
}

/** Paged list envelope used by paginated GET endpoints (e.g. `/Brands`). */
export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface SubCategory {
  id: number;
  categoryId: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  imageUrl: string | null;
  /** Populated when fetched with `includeSubcategories=true`; otherwise null. */
  subCategories: SubCategory[] | null;
}

export interface Brand {
  id: number;
  name: string;
}

/** Multipart create/edit payload for `POST/PUT /Categories` (TRD §7). */
export interface CategoryFormValues {
  name: string;
  /** New file to upload; undefined on edit when the image is unchanged. */
  image?: File | null;
}

/** JSON body for `POST/PUT /SubCategories`. */
export interface SubCategoryRequest {
  categoryId: number;
  name: string;
}

/** JSON body for `POST/PUT /Brands`. */
export interface BrandRequest {
  name: string;
}
