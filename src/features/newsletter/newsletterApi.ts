import { baseApi } from '@/shared/api/baseApi';
import type { ApiEnvelope, PagedResult } from '@/shared/api/types';
import type { NewsletterSubscriber } from './types';

interface GetSubscribersArgs {
  pageNumber?: number;
  pageSize?: number;
}

export const newsletterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNewsletterSubscribers: builder.query<PagedResult<NewsletterSubscriber>, GetSubscribersArgs>({
      query: ({ pageNumber = 1, pageSize = 20 }) => ({
        url: '/admin/newsletter',
        params: { pageNumber, pageSize },
      }),
      transformResponse: (res: ApiEnvelope<PagedResult<NewsletterSubscriber>>) => res.data,
      providesTags: [{ type: 'Newsletter', id: 'LIST' }],
    }),
  }),
});

export const { useGetNewsletterSubscribersQuery } = newsletterApi;
