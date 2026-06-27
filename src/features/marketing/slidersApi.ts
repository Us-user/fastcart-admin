import { baseApi } from '@/shared/api/baseApi';
import type { ApiEnvelope } from '@/shared/api/types';
import type { Slider } from './types';

export const slidersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSliders: builder.query<Slider[], void>({
      query: () => '/admin/sliders',
      transformResponse: (raw: ApiEnvelope<Slider[]>) => raw.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map((s) => ({ type: 'Slider' as const, id: s.id })),
              { type: 'Slider' as const, id: 'LIST' },
            ]
          : [{ type: 'Slider' as const, id: 'LIST' }],
    }),
    deleteSlider: builder.mutation<void, number>({
      query: (id) => ({ url: `/admin/sliders/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Slider', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetSlidersQuery, useDeleteSliderMutation } = slidersApi;
