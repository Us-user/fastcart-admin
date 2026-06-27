import { baseApi } from '@/shared/api/baseApi';
import type { SubCategoryRequest } from './types';

/**
 * SubCategory mutations (JSON). Subcategories are read inline via the Categories
 * query (`includeSubcategories=true`), so these mutations invalidate the
 * `Category` LIST tag to refresh the master–detail panel (TRD §6.1).
 */
export const subCategoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createSubCategory: builder.mutation<void, SubCategoryRequest>({
      query: (body) => ({ url: '/SubCategories', method: 'POST', body }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),
    updateSubCategory: builder.mutation<void, { id: number } & SubCategoryRequest>({
      query: ({ id, ...body }) => ({ url: `/SubCategories/${id}`, method: 'PUT', body }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),
    deleteSubCategory: builder.mutation<void, number>({
      query: (id) => ({ url: `/SubCategories/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateSubCategoryMutation,
  useUpdateSubCategoryMutation,
  useDeleteSubCategoryMutation,
} = subCategoriesApi;
