import { useCallback, useState } from 'react';

import { useAppDispatch } from '@/app/hooks';
import { baseApi } from '@/shared/api/baseApi';
import { http } from '@/shared/api/axiosInstance';
import { buildFormData } from '@/shared/lib/formData';
import type { CreateProductPayload } from './types';

/**
 * Create a product via the axios instance because `POST /Products` is
 * `multipart/form-data` (TRD §7). The quirk: `Options` and `Variants` are typed
 * as **strings** server-side, so they are `JSON.stringify`'d into single fields;
 * `TagIds` are repeated fields and `Images` are real binary parts. On success we
 * invalidate the `Product` LIST tag so the RTK Query list refetches.
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
        await http.post('/Products', formData);
        dispatch(baseApi.util.invalidateTags([{ type: 'Product', id: 'LIST' }]));
      } finally {
        setIsSaving(false);
      }
    },
    [dispatch],
  );

  return { createProduct, isSaving };
}
