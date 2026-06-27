import { useCallback, useState } from 'react';

import { useAppDispatch } from '@/app/hooks';
import { baseApi } from '@/shared/api/baseApi';
import { http } from '@/shared/api/axiosInstance';
import { buildFormData } from '@/shared/lib/formData';

/**
 * Add images to an existing product via `POST /Products/{id}/images`. This is
 * `multipart/form-data` (the `Images` field is binary parts), so it goes through
 * the axios instance like product create (TRD §7), then invalidates the product
 * detail + list so the new images appear.
 */
export function useUploadProductImages() {
  const dispatch = useAppDispatch();
  const [isUploading, setUploading] = useState(false);

  const upload = useCallback(
    async (productId: number, images: File[]) => {
      if (images.length === 0) return;
      setUploading(true);
      try {
        const formData = buildFormData({ Images: images });
        await http.post(`/Products/${productId}/images`, formData);
        dispatch(
          baseApi.util.invalidateTags([
            { type: 'Product', id: productId },
            { type: 'Product', id: 'LIST' },
          ]),
        );
      } finally {
        setUploading(false);
      }
    },
    [dispatch],
  );

  return { upload, isUploading };
}
