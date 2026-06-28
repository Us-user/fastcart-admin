import { baseApi } from '@/shared/api/baseApi';
import type { ApiEnvelope, PagedResult } from '@/shared/api/types';
import type {
  GetProductsArgs,
  ProductDetail,
  ProductListItem,
  ProductOptionInput,
  ProductVariantInput,
  UpdateProductRequest,
  UpdateVariantRequest,
} from './types';

/** Invalidate a product's detail + the list after a sectioned save (TRD §8.3). */
const productTags = (id: number) =>
  [
    { type: 'Product' as const, id },
    { type: 'Product' as const, id: 'LIST' },
  ] as const;

/**
 * Products list + delete + the sectioned edit endpoints (TRD §5.3, §8.3). Create
 * and image upload are multipart and live in `useCreateProduct` / the image hook;
 * everything JSON is here.
 */
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
    getProduct: builder.query<ProductDetail, number>({
      query: (id) => `/Products/${id}`,
      transformResponse: (raw: ApiEnvelope<ProductDetail>) => raw.data,
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),
    getRelatedProducts: builder.query<ProductListItem[], number>({
      query: (id) => `/Products/${id}/related`,
      transformResponse: (raw: ApiEnvelope<ProductListItem[]>) => raw.data ?? [],
    }),
    deleteProduct: builder.mutation<void, number>({
      query: (id) => ({ url: `/Products/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),
    bulkDeleteProducts: builder.mutation<void, number[]>({
      query: (ids) => ({ url: '/Products/bulk-delete', method: 'POST', body: { ids } }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    /* --- Sectioned edit (TRD §8.3): base info --- */
    updateProductBase: builder.mutation<void, { id: number; body: UpdateProductRequest }>({
      query: ({ id, body }) => ({ url: `/Products/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => productTags(id),
    }),

    /* --- Images: delete (add is multipart → axios hook) --- */
    deleteProductImage: builder.mutation<void, { productId: number; imageId: number }>({
      query: ({ productId, imageId }) => ({
        url: `/Products/${productId}/images/${imageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { productId }) => productTags(productId),
    }),

    /* --- Options --- */
    addProductOption: builder.mutation<void, { productId: number; body: ProductOptionInput }>({
      query: ({ productId, body }) => ({
        url: `/Products/${productId}/options`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { productId }) => productTags(productId),
    }),
    updateProductOption: builder.mutation<
      void,
      { productId: number; optionId: number; body: ProductOptionInput }
    >({
      query: ({ productId, optionId, body }) => ({
        url: `/Products/${productId}/options/${optionId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_r, _e, { productId }) => productTags(productId),
    }),
    deleteProductOption: builder.mutation<void, { productId: number; optionId: number }>({
      query: ({ productId, optionId }) => ({
        url: `/Products/${productId}/options/${optionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { productId }) => productTags(productId),
    }),

    /* --- Variants --- */
    addProductVariant: builder.mutation<void, { productId: number; body: ProductVariantInput }>({
      query: ({ productId, body }) => ({
        url: `/Products/${productId}/variants`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { productId }) => productTags(productId),
    }),
    updateProductVariant: builder.mutation<
      void,
      { productId: number; variantId: number; body: UpdateVariantRequest }
    >({
      query: ({ productId, variantId, body }) => ({
        url: `/Products/${productId}/variants/${variantId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_r, _e, { productId }) => productTags(productId),
    }),
    deleteProductVariant: builder.mutation<void, { productId: number; variantId: number }>({
      query: ({ productId, variantId }) => ({
        url: `/Products/${productId}/variants/${variantId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { productId }) => productTags(productId),
    }),
    /* Dedicated stock endpoint (TRD §5.3 variant stock management). */
    updateVariantStock: builder.mutation<
      void,
      { productId: number; variantId: number; count: number }
    >({
      query: ({ productId, variantId, count }) => ({
        url: `/Products/${productId}/variants/${variantId}/stock`,
        method: 'PUT',
        body: { count },
      }),
      invalidatesTags: (_r, _e, { productId }) => productTags(productId),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useGetRelatedProductsQuery,
  useDeleteProductMutation,
  useBulkDeleteProductsMutation,
  useUpdateProductBaseMutation,
  useDeleteProductImageMutation,
  useAddProductOptionMutation,
  useUpdateProductOptionMutation,
  useDeleteProductOptionMutation,
  useAddProductVariantMutation,
  useUpdateProductVariantMutation,
  useDeleteProductVariantMutation,
  useUpdateVariantStockMutation,
} = productsApi;
