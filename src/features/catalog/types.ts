// Generic API envelope types now live in shared/api; re-exported for existing imports.
export type { ApiEnvelope, PagedResult } from '@/shared/api/types';

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

export interface Color {
  id: number;
  name: string;
  /** Hex string incl. leading `#`, e.g. `#00599C`. */
  hexCode: string;
}

/** JSON body for `POST/PUT /Colors` (TRD §9). */
export interface ColorRequest {
  name: string;
  hexCode: string;
}

export interface Tag {
  id: number;
  name: string;
}

/** JSON body for `POST/PUT /Tags` (TRD §9). */
export interface TagRequest {
  name: string;
}
