import { useCallback, useState } from 'react';

import { useAppDispatch } from '@/app/hooks';
import { baseApi } from '@/shared/api/baseApi';
import { http } from '@/shared/api/axiosInstance';
import { buildFormData } from '@/shared/lib/formData';
import type { CreateProductPayload } from './types';

/**
 * Pull the new product's id out of the create response, tolerating a bare id, an
 * object with `id`, or the API envelope wrapper (`{ data: … }`). Returns `null`
 * when the shape is unrecognised so the caller can skip the follow-up PUT.
 */
function extractCreatedId(body: unknown): number | null {
  if (typeof body === 'number' && Number.isInteger(body)) return body;
  if (body && typeof body === 'object') {
    const obj = body as Record<string, unknown>;
    if (typeof obj.id === 'number') return obj.id;
    if ('data' in obj) return extractCreatedId(obj.data);
  }
  return null;
}

/**
 * Create a product via the axios instance because `POST /Products` is
 * `multipart/form-data` (TRD §7). The quirk: `Options` and `Variants` are typed
 * as **strings** server-side, so they are `JSON.stringify`'d into single fields;
 * `TagIds` are repeated fields and `Images` are real binary parts.
 *
 * Pricing now lives on the product, but the multipart create has **no top-level
 * price field** and variants no longer carry price — so after the create we set
 * the product-level price/discount/cost through the documented
 * `PUT /Products/{id}` (`UpdateProductRequest`). This is a no-op if the backend
 * already applied a price during create. On success we invalidate the `Product`
 * LIST tag so the RTK Query list refetches.
 */
export function useCreateProduct() {
  const dispatch = useAppDispatch();
  const [isSaving, setIsSaving] = useState(false);

  const createProduct = useCallback(
    async (payload: CreateProductPayload) => {
      setIsSaving(true);
      try {
        const formData = buildFormData(
          {
            Name: payload.name,
            Code: payload.code,
            Description: payload.description || undefined,
            SubCategoryId: payload.subCategoryId,
            BrandId: payload.brandId ?? undefined,
            IsTaxable: payload.isTaxable,
            Condition: payload.condition,
            TagIds: payload.tagIds,
            Options: payload.options.length ? payload.options : undefined,
            Variants: payload.variants,
            Images: payload.images,
          },
          { stringifyKeys: ['Options', 'Variants'] },
        );
        const res = await http.post('/Products', formData);

        // Set product-level pricing via the base PUT (the create multipart has no
        // price field). Derived from the base variant the form built. Skipped if
        // the create response doesn't expose the new id.
        const id = extractCreatedId(res.data);
        const base = payload.variants[0];
        if (id != null && base) {
          try {
            await http.put(`/Products/${id}`, {
              name: payload.name,
              code: payload.code,
              description: payload.description ?? null,
              subCategoryId: payload.subCategoryId,
              brandId: payload.brandId ?? null,
              isTaxable: payload.isTaxable,
              condition: payload.condition,
              price: base.price,
              hasDiscount: base.hasDiscount,
              discountPrice: base.discountPrice ?? null,
              costPrice: base.costPrice ?? null,
              tagIds: payload.tagIds,
            });
          } catch {
            // The product was created; don't fail the whole flow (and risk a
            // duplicate re-submit) if only the price PUT fails — the price stays
            // editable from the product edit screen.
          }
        }

        dispatch(baseApi.util.invalidateTags([{ type: 'Product', id: 'LIST' }]));
      } finally {
        setIsSaving(false);
      }
    },
    [dispatch],
  );

  return { createProduct, isSaving };
}
