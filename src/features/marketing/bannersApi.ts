import { baseApi } from '@/shared/api/baseApi';
import type { ApiEnvelope } from '@/shared/api/types';
import type { Banner } from './types';

export const bannersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBanners: builder.query<Banner[], void>({
      query: () => '/admin/banners',
      transformResponse: (raw: ApiEnvelope<Banner[]>) => raw.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map((b) => ({ type: 'Banner' as const, id: b.id })),
              { type: 'Banner' as const, id: 'LIST' },
            ]
          : [{ type: 'Banner' as const, id: 'LIST' }],
    }),
    deleteBanner: builder.mutation<void, number>({
      query: (id) => ({ url: `/admin/banners/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Banner', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetBannersQuery, useDeleteBannerMutation } = bannersApi;
