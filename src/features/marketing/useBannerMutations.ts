import { useCallback, useState } from 'react';

import { useAppDispatch } from '@/app/hooks';
import { baseApi } from '@/shared/api/baseApi';
import { http } from '@/shared/api/axiosInstance';
import { buildFormData } from '@/shared/lib/formData';
import type { BannerRequest } from './types';

export function useBannerMutations() {
  const dispatch = useAppDispatch();
  const [isSaving, setIsSaving] = useState(false);

  const saveBanner = useCallback(
    async (values: BannerRequest, id?: number) => {
      setIsSaving(true);
      try {
        const formData = buildFormData({
          Title: values.title,
          CategoryId: values.categoryId ?? undefined,
          EndsAt: values.endsAt ?? undefined,
          IsActive: values.isActive ?? undefined,
          Image: values.image ?? undefined,
        });
        if (id == null) {
          await http.post('/admin/banners', formData);
        } else {
          await http.put(`/admin/banners/${id}`, formData);
        }
        dispatch(baseApi.util.invalidateTags([{ type: 'Banner', id: 'LIST' }]));
      } finally {
        setIsSaving(false);
      }
    },
    [dispatch],
  );

  return { saveBanner, isSaving };
}
