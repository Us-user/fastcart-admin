import { baseApi } from '@/shared/api/baseApi';
import type { ApiEnvelope, Category } from './types';

/**
 * Read + delete endpoints for Categories. Create/update are `multipart/form-data`
 * and go through the axios instance in `useCategoryMutations` (TRD §7); they
 * invalidate the same `Category` LIST tag so this query refetches.
 */
export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      // Subcategories are fetched inline so the master–detail panel (TRD §6.1)
      // reads them from the same cache as the grid.
      query: () => ({ url: '/Categories', params: { includeSubcategories: true } }),
      transformResponse: (raw: ApiEnvelope<Category[]>) => raw.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map((c) => ({ type: 'Category' as const, id: c.id })),
              { type: 'Category' as const, id: 'LIST' },
            ]
          : [{ type: 'Category' as const, id: 'LIST' }],
    }),
    deleteCategory: builder.mutation<void, number>({
      query: (id) => ({ url: `/Categories/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetCategoriesQuery, useDeleteCategoryMutation } = categoriesApi;
