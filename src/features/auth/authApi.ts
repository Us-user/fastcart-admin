import { baseApi } from '@/shared/api/baseApi';
import type {
  AuthMeResponse,
  AuthUser,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  ResetPasswordRequest,
} from './types';

/** Normalize the roles field, which may arrive as `roles[]` or a single `role`. */
function normalizeRoles(raw: AuthMeResponse): string[] {
  if (Array.isArray(raw.roles)) {
    return raw.roles;
  }
  if (typeof raw.role === 'string') {
    return [raw.role];
  }
  return [];
}

/** Map the raw `/Auth/me` payload to the normalized `AuthUser` used by the UI. */
export function mapToAuthUser(raw: AuthMeResponse): AuthUser {
  return {
    id: raw.id,
    email: raw.email,
    userName: raw.userName,
    firstName: raw.firstName,
    lastName: raw.lastName,
    phoneNumber: raw.phoneNumber,
    imageUrl: raw.imageUrl ?? raw.image,
    roles: normalizeRoles(raw),
  };
}

/**
 * Auth endpoints (TRD §3.1). Refresh is handled outside RTK Query in
 * `shared/api/tokenRefresh` so it can be shared with the axios instance and run
 * single-flight; everything else lives here.
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({ url: '/Auth/login', method: 'POST', body }),
    }),
    logout: builder.mutation<void, { refreshToken: string }>({
      query: (body) => ({ url: '/Auth/logout', method: 'POST', body }),
    }),
    forgotPassword: builder.mutation<void, ForgotPasswordRequest>({
      query: (body) => ({ url: '/Auth/forgot-password', method: 'POST', body }),
    }),
    resetPassword: builder.mutation<void, ResetPasswordRequest>({
      query: (body) => ({ url: '/Auth/reset-password', method: 'POST', body }),
    }),
    changePassword: builder.mutation<void, ChangePasswordRequest>({
      query: (body) => ({ url: '/Auth/change-password', method: 'POST', body }),
    }),
    getMe: builder.query<AuthUser, void>({
      query: () => ({ url: '/Auth/me' }),
      transformResponse: (raw: AuthMeResponse) => mapToAuthUser(raw),
      providesTags: ['Auth'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
} = authApi;
