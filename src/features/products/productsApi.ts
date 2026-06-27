import { baseApi } from '@/shared/api/baseApi';
import type { ApiEnvelope, PagedResult } from '@/shared/api/types';
import type { GetProductsArgs, ProductListItem } from './types';

/** Products list + delete endpoints (TRD §5.3). Create/edit are multipart/sectioned, added later. */
export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<PagedResult<ProductListItem>, GetProductsArgs | void>({
      query: (arg) => ({
        url: '/Products',
        params: {
          Q: arg?.q || undefined,
          // 'newest' is the default; only send a Sort the backend reorders on.
          Sort: arg?.sort && arg.sort !== 'newest' ? arg.sort : undefined,
          CategoryId: arg?.categoryId,
          SubCategoryId: arg?.subCategoryId,
          Condition: arg?.condition,
          InStock: arg?.inStock,
          PageNumber: arg?.pageNumber,
          PageSize: arg?.pageSize,
        },
      }),
      transformResponse: (raw: ApiEnvelope<PagedResult<ProductListItem>>) => raw.data,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((p) => ({ type: 'Product' as const, id: p.id })),
              { type: 'Product' as const, id: 'LIST' },
            ]
          : [{ type: 'Product' as const, id: 'LIST' }],
    }),
    deleteProduct: builder.mutation<void, number>({
      query: (id) => ({ url: `/Products/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),
    bulkDeleteProducts: builder.mutation<void, number[]>({
      query: (ids) => ({ url: '/Products/bulk-delete', method: 'POST', body: { ids } }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetProductsQuery, useDeleteProductMutation, useBulkDeleteProductsMutation } =
  productsApi;
