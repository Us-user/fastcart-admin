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

/* ------------------------------------------------------------------ *
 * Product detail (`GET /Products/{id}`) — the full edit payload.
 * Shape verified against the live backend; the detail response is not
 * documented in Swagger (responses are `200 undefined`).
 * ------------------------------------------------------------------ */

/** A stored product image. No seeded product has images, so `imageUrl` is the
 *  assumed field name (mirrors the list's `primaryImageUrl`); confirm on first
 *  real upload. */
export interface ProductImage {
  id: number;
  imageUrl: string | null;
}

/** Brand summary on the product detail. */
export interface ProductBrandRef {
  id: number;
  name: string;
}

/** Tag summary on the product detail. */
export interface ProductTagRef {
  id: number;
  name: string;
}

/** One option value as returned on the detail (carries the persisted color link). */
export interface ProductDetailOptionValue {
  id: number;
  value: string;
  colorId: number | null;
  colorHex: string | null;
  sortOrder: number;
}

/** One option group on the detail. */
export interface ProductDetailOption {
  id: number;
  name: string;
  sortOrder: number;
  values: ProductDetailOptionValue[];
}

/** A variant's option labels (read-only summary on the detail). */
export interface ProductVariantOptionRef {
  optionName: string;
  value: string;
}

/** A variant on the detail — price/discount/cost/stock all live here (TRD §7). */
export interface ProductDetailVariant {
  id: number;
  sku: string | null;
  price: number;
  hasDiscount: boolean;
  discountPrice: number | null;
  effectivePrice: number;
  stockCount: number;
  isActive: boolean;
  options: ProductVariantOptionRef[];
}

/** Full `GET /Products/{id}` payload backing the edit screen (TRD §5.3, §8.2). */
export interface ProductDetail {
  id: number;
  name: string;
  code: string;
  description: string | null;
  brand: ProductBrandRef | null;
  categoryId: number | null;
  categoryName: string | null;
  subCategoryId: number;
  subCategoryName: string | null;
  condition: ProductCondition;
  isTaxable: boolean;
  createdAt: string;
  images: ProductImage[];
  tags: ProductTagRef[];
  options: ProductDetailOption[];
  variants: ProductDetailVariant[];
  avgRating: number;
  reviewCount: number;
  fromPrice: number;
  maxPrice: number;
  inStock: boolean;
}

/* ------------------------------------------------------------------ *
 * Sectioned-save request bodies (TRD §8.3). Each section persists via
 * its own endpoint; bodies verified against Swagger.
 * ------------------------------------------------------------------ */

/** Base fields — `PUT /Products/{id}` (`UpdateProductRequest`). No price/variants. */
export interface UpdateProductRequest {
  name: string;
  code: string;
  description?: string | null;
  subCategoryId: number;
  brandId?: number | null;
  isTaxable: boolean;
  condition: ProductCondition;
  tagIds: number[];
}

/** Variant update — `PUT /Products/{id}/variants/{variantId}` (`UpdateVariantRequest`).
 *  All fields nullable server-side; omitted keys are left unchanged. No
 *  `optionValueIds` (the option linkage is fixed once a variant exists), and
 *  `count` is updated through the dedicated stock endpoint instead. */
export interface UpdateVariantRequest {
  sku?: string | null;
  price?: number | null;
  hasDiscount?: boolean | null;
  discountPrice?: number | null;
  costPrice?: number | null;
  count?: number | null;
  isActive?: boolean | null;
}
