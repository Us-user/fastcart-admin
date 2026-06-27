import { baseApi } from '@/shared/api/baseApi';
import type { ApiEnvelope, Brand, BrandRequest, PagedResult } from './types';

interface GetBrandsArgs {
  brandName?: string;
  pageNumber?: number;
  pageSize?: number;
}

/** Brands CRUD (JSON). `GET /Brands` is paged (TRD §9). */
export const brandsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBrands: builder.query<PagedResult<Brand>, GetBrandsArgs | void>({
      query: (arg) => ({
        url: '/Brands',
        params: {
          brandName: arg?.brandName || undefined,
          pageNumber: arg?.pageNumber,
          pageSize: arg?.pageSize,
        },
      }),
      transformResponse: (raw: ApiEnvelope<PagedResult<Brand>>) => raw.data,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((b) => ({ type: 'Brand' as const, id: b.id })),
              { type: 'Brand' as const, id: 'LIST' },
            ]
          : [{ type: 'Brand' as const, id: 'LIST' }],
    }),
    createBrand: builder.mutation<void, BrandRequest>({
      query: (body) => ({ url: '/Brands', method: 'POST', body }),
      invalidatesTags: [{ type: 'Brand', id: 'LIST' }],
    }),
    updateBrand: builder.mutation<void, { id: number } & BrandRequest>({
      query: ({ id, ...body }) => ({ url: `/Brands/${id}`, method: 'PUT', body }),
      invalidatesTags: [{ type: 'Brand', id: 'LIST' }],
    }),
    deleteBrand: builder.mutation<void, number>({
      query: (id) => ({ url: `/Brands/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Brand', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} = brandsApi;
