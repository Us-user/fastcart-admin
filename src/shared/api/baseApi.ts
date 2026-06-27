import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { authStorage } from '@/shared/lib/authStorage';
import { refreshAccessToken } from './tokenRefresh';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_API_BASE_URL}/api/v1`,
  prepareHeaders: (headers) => {
    const token = authStorage.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

/**
 * Base query with automatic 401 reauth (TRD §3.2): on a 401, attempt a
 * single-flight refresh and retry the original request once. If refresh fails,
 * `refreshAccessToken` clears the session and we surface the original error.
 */
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }

  return result;
};

/** Single list of RTK Query cache tags reused across feature endpoint slices. */
export const TAG_TYPES = [
  'Product',
  'Order',
  'Category',
  'SubCategory',
  'Brand',
  'Color',
  'Tag',
  'Banner',
  'Slider',
  'Coupon',
  'Return',
  'User',
  'Role',
  'Message',
  'Newsletter',
  'Review',
  'Dashboard',
  'Profile',
  'Auth',
] as const;

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: TAG_TYPES,
  endpoints: () => ({}),
});
