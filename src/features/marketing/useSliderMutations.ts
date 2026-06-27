import { useCallback, useState } from 'react';

import { useAppDispatch } from '@/app/hooks';
import { baseApi } from '@/shared/api/baseApi';
import { http } from '@/shared/api/axiosInstance';
import { buildFormData } from '@/shared/lib/formData';
import type { SliderRequest } from './types';

export function useSliderMutations() {
  const dispatch = useAppDispatch();
  const [isSaving, setIsSaving] = useState(false);

  const saveSlider = useCallback(
    async (values: SliderRequest, id?: number) => {
      setIsSaving(true);
      try {
        const formData = buildFormData({
          Title: values.title,
          Subtitle: values.subtitle ?? undefined,
          SortOrder: values.sortOrder != null ? values.sortOrder : undefined,
          IsActive: values.isActive ?? undefined,
          Image: values.image ?? undefined,
        });
        if (id == null) {
          await http.post('/admin/sliders', formData);
        } else {
          await http.put(`/admin/sliders/${id}`, formData);
        }
        dispatch(baseApi.util.invalidateTags([{ type: 'Slider', id: 'LIST' }]));
      } finally {
        setIsSaving(false);
      }
    },
    [dispatch],
  );

  return { saveSlider, isSaving };
}
