import { baseApi } from '@/shared/api/baseApi';
import type { ApiEnvelope, Color, ColorRequest, PagedResult } from './types';

interface GetColorsArgs {
  pageNumber?: number;
  pageSize?: number;
}

/** Colors CRUD (JSON). `GET /Colors` is paged like `/Brands` (TRD §9). */
export const colorsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getColors: builder.query<PagedResult<Color>, GetColorsArgs | void>({
      query: (arg) => ({
        url: '/Colors',
        params: { pageNumber: arg?.pageNumber, pageSize: arg?.pageSize },
      }),
      transformResponse: (raw: ApiEnvelope<PagedResult<Color>>) => raw.data,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((c) => ({ type: 'Color' as const, id: c.id })),
              { type: 'Color' as const, id: 'LIST' },
            ]
          : [{ type: 'Color' as const, id: 'LIST' }],
    }),
    createColor: builder.mutation<void, ColorRequest>({
      query: (body) => ({ url: '/Colors', method: 'POST', body }),
      invalidatesTags: [{ type: 'Color', id: 'LIST' }],
    }),
    updateColor: builder.mutation<void, { id: number } & ColorRequest>({
      query: ({ id, ...body }) => ({ url: `/Colors/${id}`, method: 'PUT', body }),
      invalidatesTags: [{ type: 'Color', id: 'LIST' }],
    }),
    deleteColor: builder.mutation<void, number>({
      query: (id) => ({ url: `/Colors/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Color', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetColorsQuery,
  useCreateColorMutation,
  useUpdateColorMutation,
  useDeleteColorMutation,
} = colorsApi;
