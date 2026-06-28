import { baseApi } from '@/shared/api/baseApi';
import type { ApiEnvelope, Tag, TagRequest } from './types';

/** Tags CRUD (JSON). `GET /Tags` returns a flat array (not paged) (TRD §9). */
export const tagsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTags: builder.query<Tag[], void>({
      query: () => ({ url: '/Tags' }),
      transformResponse: (raw: ApiEnvelope<Tag[]>) => raw.data ?? [],
      providesTags: (result) =>
        result
          ? [
              ...result.map((tag) => ({ type: 'Tag' as const, id: tag.id })),
              { type: 'Tag' as const, id: 'LIST' },
            ]
          : [{ type: 'Tag' as const, id: 'LIST' }],
    }),
    createTag: builder.mutation<void, TagRequest>({
      query: (body) => ({ url: '/Tags', method: 'POST', body }),
      invalidatesTags: [{ type: 'Tag', id: 'LIST' }],
    }),
    updateTag: builder.mutation<void, { id: number } & TagRequest>({
      query: ({ id, ...body }) => ({ url: `/Tags/${id}`, method: 'PUT', body }),
      invalidatesTags: [{ type: 'Tag', id: 'LIST' }],
    }),
    deleteTag: builder.mutation<void, number>({
      query: (id) => ({ url: `/Tags/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Tag', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetTagsQuery, useCreateTagMutation, useUpdateTagMutation, useDeleteTagMutation } =
  tagsApi;
