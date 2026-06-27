import { baseApi } from '@/shared/api/baseApi';
import type { ProfileData } from './types';

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<ProfileData, void>({
      query: () => ({ url: '/Profile' }),
      transformResponse: (res: { data: ProfileData }) => res.data,
      providesTags: ['Profile'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetProfileQuery } = profileApi;
