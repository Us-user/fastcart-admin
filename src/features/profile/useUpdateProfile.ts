import { useCallback, useState } from 'react';

import { useAppDispatch } from '@/app/hooks';
import { baseApi } from '@/shared/api/baseApi';
import { http } from '@/shared/api/axiosInstance';
import { buildFormData } from '@/shared/lib/formData';
import type { UpdateProfileRequest } from './types';

export function useUpdateProfile() {
  const dispatch = useAppDispatch();
  const [isSaving, setIsSaving] = useState(false);

  const updateProfile = useCallback(
    async (values: UpdateProfileRequest) => {
      setIsSaving(true);
      try {
        const formData = buildFormData({
          FirstName: values.FirstName,
          LastName: values.LastName,
          Email: values.Email,
          PhoneNumber: values.PhoneNumber,
          Dob: values.Dob,
          Image: values.Image,
        });
        await http.put('/Profile', formData);
        dispatch(baseApi.util.invalidateTags(['Profile', 'Auth']));
      } finally {
        setIsSaving(false);
      }
    },
    [dispatch],
  );

  return { updateProfile, isSaving };
}
