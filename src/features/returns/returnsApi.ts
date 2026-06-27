import { baseApi } from '@/shared/api/baseApi';
import type { ApiEnvelope, PagedResult } from '@/shared/api/types';
import type { ReturnItem, ResolveReturnRequest, ReturnStatus } from './types';

interface GetReturnsArgs {
  status?: ReturnStatus | '';
  pageNumber?: number;
  pageSize?: number;
}

export const returnsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReturns: builder.query<PagedResult<ReturnItem>, GetReturnsArgs>({
      query: ({ status, pageNumber = 1, pageSize = 20 }) => ({
        url: '/admin/returns',
        params: {
          ...(status ? { status } : {}),
          pageNumber,
          pageSize,
        },
      }),
      transformResponse: (res: ApiEnvelope<PagedResult<ReturnItem>>) => res.data,
      providesTags: [{ type: 'Return', id: 'LIST' }],
    }),

    resolveReturn: builder.mutation<void, { id: number; body: ResolveReturnRequest }>({
      query: ({ id, body }) => ({
        url: `/admin/returns/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [{ type: 'Return', id: 'LIST' }],
    }),
  }),
});

export const { useGetReturnsQuery, useResolveReturnMutation } = returnsApi;
