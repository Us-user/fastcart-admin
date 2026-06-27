import { baseApi } from '@/shared/api/baseApi';
import type { ApiEnvelope, PagedResult } from '@/shared/api/types';
import type { Coupon, CouponRequest } from './types';

interface GetCouponsArgs {
  pageNumber?: number;
  pageSize?: number;
}

export const couponsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCoupons: builder.query<PagedResult<Coupon>, GetCouponsArgs | void>({
      query: (arg) => ({
        url: '/admin/coupons',
        params: {
          pageNumber: arg?.pageNumber,
          pageSize: arg?.pageSize,
        },
      }),
      transformResponse: (raw: ApiEnvelope<PagedResult<Coupon>>) => raw.data,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((c) => ({ type: 'Coupon' as const, id: c.id })),
              { type: 'Coupon' as const, id: 'LIST' },
            ]
          : [{ type: 'Coupon' as const, id: 'LIST' }],
    }),
    createCoupon: builder.mutation<void, CouponRequest>({
      query: (body) => ({ url: '/admin/coupons', method: 'POST', body }),
      invalidatesTags: [{ type: 'Coupon', id: 'LIST' }],
    }),
    updateCoupon: builder.mutation<void, { id: number } & CouponRequest>({
      query: ({ id, ...body }) => ({ url: `/admin/coupons/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Coupon', id },
        { type: 'Coupon', id: 'LIST' },
      ],
    }),
    deleteCoupon: builder.mutation<void, number>({
      query: (id) => ({ url: `/admin/coupons/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Coupon', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = couponsApi;
