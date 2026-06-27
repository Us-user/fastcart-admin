import { baseApi } from '@/shared/api/baseApi';
import type { ApiEnvelope, PagedResult } from '@/shared/api/types';
import type {
  AdminCreateOrderRequest,
  GetOrdersArgs,
  OrderDetail,
  OrderListItem,
  SetOrderStatusRequest,
  SetPaymentStatusRequest,
} from './types';

const orderTags = (id: number) =>
  [
    { type: 'Order' as const, id },
    { type: 'Order' as const, id: 'LIST' },
  ] as const;

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<PagedResult<OrderListItem>, GetOrdersArgs | void>({
      query: (arg) => ({
        url: '/admin/orders',
        params: {
          Q: arg?.q || undefined,
          Status: arg?.status,
          PaymentStatus: arg?.paymentStatus,
          Sort: arg?.sort && arg.sort !== 'newest' ? arg.sort : undefined,
          From: arg?.from,
          To: arg?.to,
          PageNumber: arg?.pageNumber,
          PageSize: arg?.pageSize,
        },
      }),
      transformResponse: (raw: ApiEnvelope<PagedResult<OrderListItem>>) => raw.data,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((o) => ({ type: 'Order' as const, id: o.id })),
              { type: 'Order' as const, id: 'LIST' },
            ]
          : [{ type: 'Order' as const, id: 'LIST' }],
    }),

    getOrder: builder.query<OrderDetail, number>({
      query: (id) => `/admin/orders/${id}`,
      transformResponse: (raw: ApiEnvelope<OrderDetail>) => raw.data,
      providesTags: (_r, _e, id) => [{ type: 'Order', id }],
    }),

    createOrder: builder.mutation<OrderDetail, AdminCreateOrderRequest>({
      query: (body) => ({ url: '/admin/orders', method: 'POST', body }),
      transformResponse: (raw: ApiEnvelope<OrderDetail>) => raw.data,
      invalidatesTags: [{ type: 'Order', id: 'LIST' }],
    }),

    setOrderStatus: builder.mutation<void, { id: number; body: SetOrderStatusRequest }>({
      query: ({ id, body }) => ({
        url: `/admin/orders/${id}/status`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => orderTags(id),
    }),

    setPaymentStatus: builder.mutation<void, { id: number; body: SetPaymentStatusRequest }>({
      query: ({ id, body }) => ({
        url: `/admin/orders/${id}/payment-status`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => orderTags(id),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useSetOrderStatusMutation,
  useSetPaymentStatusMutation,
} = ordersApi;
