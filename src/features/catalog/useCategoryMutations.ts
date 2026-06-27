import { useCallback, useState } from 'react';

import { useAppDispatch } from '@/app/hooks';
import { baseApi } from '@/shared/api/baseApi';
import { http } from '@/shared/api/axiosInstance';
import { buildFormData } from '@/shared/lib/formData';
import type { CategoryFormValues } from './types';

/**
 * Create/update a Category via the axios instance because the endpoint is
 * `multipart/form-data` (Name + Image) — RTK Query handles only the JSON
 * catalog endpoints (TRD §7). On success we invalidate the `Category` LIST tag
 * so the RTK Query grid refetches.
 */
export function useCategoryMutations() {
  const dispatch = useAppDispatch();
  const [isSaving, setIsSaving] = useState(false);

  const saveCategory = useCallback(
    async (values: CategoryFormValues, id?: number) => {
      setIsSaving(true);
      try {
        const formData = buildFormData({
          Name: values.name,
          Image: values.image ?? undefined,
        });
        if (id == null) {
          await http.post('/Categories', formData);
        } else {
          await http.put(`/Categories/${id}`, formData);
        }
        dispatch(baseApi.util.invalidateTags([{ type: 'Category', id: 'LIST' }]));
      } finally {
        setIsSaving(false);
      }
    },
    [dispatch],
  );

  return { saveCategory, isSaving };
}
