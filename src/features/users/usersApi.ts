import { baseApi } from '@/shared/api/baseApi';
import type { ApiEnvelope, PagedResult } from '@/shared/api/types';
import type { UserListItem, UserDetail, Role, AssignRoleRequest } from './types';

interface GetUsersArgs {
  userName?: string;
  pageNumber?: number;
  pageSize?: number;
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<PagedResult<UserListItem>, GetUsersArgs>({
      query: ({ userName, pageNumber = 1, pageSize = 20 }) => ({
        url: '/admin/users',
        params: {
          ...(userName ? { userName } : {}),
          pageNumber,
          pageSize,
        },
      }),
      transformResponse: (res: ApiEnvelope<PagedResult<UserListItem>>) => res.data,
      providesTags: [{ type: 'User', id: 'LIST' }],
    }),

    getUser: builder.query<UserDetail, string>({
      query: (id) => `/admin/users/${id}`,
      transformResponse: (res: ApiEnvelope<UserDetail>) => res.data,
      providesTags: (_r, _e, id) => [{ type: 'User', id }],
    }),

    deleteUser: builder.mutation<void, string>({
      query: (id) => ({ url: `/admin/users/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),

    getRoles: builder.query<Role[], void>({
      query: () => '/admin/roles',
      transformResponse: (res: ApiEnvelope<Role[]>) => res.data,
      providesTags: [{ type: 'Role', id: 'LIST' }],
    }),

    assignRole: builder.mutation<void, { userId: string; body: AssignRoleRequest }>({
      query: ({ userId, body }) => ({
        url: `/admin/users/${userId}/roles`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { userId }) => [
        { type: 'User', id: 'LIST' },
        { type: 'User', id: userId },
      ],
    }),

    removeRole: builder.mutation<void, { userId: string; roleId: string }>({
      query: ({ userId, roleId }) => ({
        url: `/admin/users/${userId}/roles/${roleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { userId }) => [
        { type: 'User', id: 'LIST' },
        { type: 'User', id: userId },
      ],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useDeleteUserMutation,
  useGetRolesQuery,
  useAssignRoleMutation,
  useRemoveRoleMutation,
} = usersApi;
