import { baseApi } from '@/shared/api/baseApi';
import type { ApiEnvelope } from '@/shared/api/types';
import type { ProfileData } from './types';

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<ProfileData, void>({
      query: () => ({ url: '/Profile' }),
      transformResponse: (res: ApiEnvelope<ProfileData>) => res.data,
      providesTags: ['Profile'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetProfileQuery } = profileApi;
