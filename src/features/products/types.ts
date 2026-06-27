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

/** Selectable conditions for the Add/Edit form dropdown (TRD §6.9). */
export const PRODUCT_CONDITIONS: readonly ProductCondition[] = ['BrandNew', 'Refurbished', 'Old'];

/**
 * One option value inside the multipart create payload's stringified `Options`
 * (server schema `CreateOptionValueInput`). `colorId` links the value to a Color
 * — this is how the Colour block's selections are persisted (TRD §5.3, §7).
 */
export interface OptionValueInput {
  value: string;
  colorId?: number | null;
  sortOrder: number;
}

/** One option group inside the stringified `Options` array (server `OptionRequest`). */
export interface ProductOptionInput {
  name: string;
  sortOrder: number;
  values: OptionValueInput[];
}

/**
 * One variant inside the stringified `Variants` array (server `AddVariantRequest`).
 * Price / discount / cost / stock live on the variant, NOT at the product level —
 * so even a simple product is created with a single base variant (TRD §7).
 */
export interface ProductVariantInput {
  sku?: string | null;
  optionValueIds: number[];
  price: number;
  hasDiscount: boolean;
  discountPrice?: number | null;
  costPrice: number;
  count: number;
  isActive: boolean;
}

/** A user-editable option in the OptionsEditor (flattened from `ProductOptionInput`). */
export interface EditableOption {
  name: string;
  values: string[];
}

/**
 * Assembled multipart create payload handed to `useCreateProduct`. `options` and
 * `variants` are objects here; the hook `JSON.stringify`s them into string form
 * fields, and `images` become binary parts (TRD §7).
 */
export interface CreateProductPayload {
  name: string;
  code: string;
  description?: string;
  subCategoryId: number;
  brandId?: number;
  isTaxable: boolean;
  condition: ProductCondition;
  tagIds: number[];
  options: ProductOptionInput[];
  variants: ProductVariantInput[];
  images: File[];
}
