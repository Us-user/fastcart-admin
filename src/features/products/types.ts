/** Product condition (TRD §6.9). */
export type ProductCondition = 'BrandNew' | 'Refurbished' | 'Old';

/** Color swatch summary returned on list items. */
export interface ProductSwatch {
  value: string;
  hexCode: string;
}

/**
 * A row in `GET /Products` (the list payload — not the full product).
 * Pricing now lives at the product level (`price`/`discountPrice`/
 * `effectivePrice`), not as a per-variant range.
 */
export interface ProductListItem {
  id: number;
  name: string;
  code: string | null;
  brandName: string | null;
  categoryName: string | null;
  subCategoryName: string | null;
  primaryImageUrl: string | null;
  price: number;
  discountPrice: number | null;
  effectivePrice: number;
  hasDiscount: boolean;
  inStock: boolean;
  condition: ProductCondition | null;
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

/** One variant's value on a single option axis, referenced by name + value
 *  (option values have no ids yet at create time). */
export interface CreateVariantOption {
  optionName: string;
  value: string;
}

/**
 * One variant inside the multipart create payload's stringified `Variants` array.
 * The new backend requires every variant to pick exactly one value for each option
 * axis (`optionValues`, verified live), so the form sends the full combination
 * matrix — not a single empty base variant. Price/discount/cost are ignored by the
 * create endpoint (the product-level price is set via `PUT /Products/{id}` right
 * after create), but kept here harmlessly.
 */
export interface ProductVariantInput {
  sku?: string | null;
  optionValues: CreateVariantOption[];
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

/** A stored product image (`GET /Products/{id}` → `images[]`). */
export interface ProductImage {
  id: number;
  url: string | null;
  isPrimary: boolean;
  sortOrder: number;
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

/**
 * A variant on the detail. Pricing moved to the product level, so a variant now
 * carries only its SKU, stock, active state and the option values that define it.
 */
export interface ProductDetailVariant {
  id: number;
  sku: string | null;
  stockCount: number;
  isActive: boolean;
  options: ProductVariantOptionRef[];
}

/** Full `GET /Products/{id}` payload backing the edit screen (TRD §5.3, §8.2). */
export interface ProductDetail {
  id: number;
  name: string;
  code: string | null;
  description: string | null;
  brand: ProductBrandRef | null;
  categoryId: number | null;
  categoryName: string | null;
  subCategoryId: number;
  subCategoryName: string | null;
  condition: ProductCondition | null;
  isTaxable: boolean;
  createdAt: string;
  images: ProductImage[];
  tags: ProductTagRef[];
  options: ProductDetailOption[];
  variants: ProductDetailVariant[];
  avgRating: number;
  reviewCount: number;
  price: number;
  hasDiscount: boolean;
  discountPrice: number | null;
  effectivePrice: number;
  inStock: boolean;
}

/* ------------------------------------------------------------------ *
 * Sectioned-save request bodies (TRD §8.3). Each section persists via
 * its own endpoint; bodies verified against Swagger.
 * ------------------------------------------------------------------ */

/** Base fields — `PUT /Products/{id}` (`UpdateProductRequest`). Pricing now lives
 *  on the product, so price/discount/cost are part of this base save. */
export interface UpdateProductRequest {
  name: string;
  code: string;
  description?: string | null;
  subCategoryId: number;
  brandId?: number | null;
  isTaxable: boolean;
  condition: ProductCondition;
  price: number;
  hasDiscount: boolean;
  discountPrice?: number | null;
  costPrice?: number | null;
  tagIds: number[];
}

/** New variant — `POST /Products/{id}/variants` (`AddVariantRequest`). Price/cost
 *  are no longer per-variant; a variant is just its SKU, stock and option picks. */
export interface AddVariantRequest {
  sku?: string | null;
  optionValueIds: number[];
  count: number;
  isActive: boolean;
}

/** Variant update — `PUT /Products/{id}/variants/{variantId}` (`UpdateVariantRequest`).
 *  All fields nullable server-side; omitted keys are left unchanged. No
 *  `optionValueIds` (the option linkage is fixed once a variant exists), and
 *  `count` is updated through the dedicated stock endpoint instead. */
export interface UpdateVariantRequest {
  sku?: string | null;
  count?: number | null;
  isActive?: boolean | null;
}
