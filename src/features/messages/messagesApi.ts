import { baseApi } from '@/shared/api/baseApi';
import type { ApiEnvelope, PagedResult } from '@/shared/api/types';
import type { ContactMessage } from './types';

interface GetMessagesArgs {
  pageNumber?: number;
  pageSize?: number;
}

export const messagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContactMessages: builder.query<PagedResult<ContactMessage>, GetMessagesArgs>({
      query: ({ pageNumber = 1, pageSize = 20 }) => ({
        url: '/admin/contact-messages',
        params: { pageNumber, pageSize },
      }),
      transformResponse: (res: ApiEnvelope<PagedResult<ContactMessage>>) => res.data,
      providesTags: [{ type: 'Message', id: 'LIST' }],
    }),
  }),
});

export const { useGetContactMessagesQuery } = messagesApi;
