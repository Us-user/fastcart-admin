/** Product condition (TRD §6.9). */
export type ProductCondition = 'BrandNew' | 'Refurbished' | 'Old';

/** Color swatch summary returned on list items. */
export interface ProductSwatch {
  value: string;
  hexCode: string;
}

/** A row in `GET /Products` (the list payload — not the full product). */
export interface ProductListItem {
  id: number;
  name: string;
  code: string;
  brandName: string | null;
  categoryName: string | null;
  subCategoryName: string | null;
  primaryImageUrl: string | null;
  fromPrice: number;
  maxPrice: number;
  hasDiscount: boolean;
  inStock: boolean;
  condition: ProductCondition;
  isNew: boolean;
  avgRating: number;
  reviewCount: number;
  swatches: ProductSwatch[];
}

/**
 * Sort values honored by `GET /Products` (verified against the live backend).
 * `'newest'` is the backend default; unknown values fall back to it.
 */
export type ProductSort = 'newest' | 'price_asc' | 'price_desc' | 'rating';

export interface GetProductsArgs {
  q?: string;
  sort?: ProductSort;
  pageNumber?: number;
  pageSize?: number;
  categoryId?: number;
  subCategoryId?: number;
  condition?: ProductCondition;
  inStock?: boolean;
}
