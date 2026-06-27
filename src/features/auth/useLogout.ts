import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { baseApi } from '@/shared/api/baseApi';
import { useLogoutMutation } from './authApi';
import { clearCredentials, selectAuth } from './authSlice';

/**
 * Logs out (TRD §3.2 / §11): best-effort `POST /Auth/logout`, then clears tokens,
 * wipes the RTK Query cache, and routes to /login. Logout never blocks on a
 * network failure.
 */
export function useLogout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { refreshToken } = useAppSelector(selectAuth);
  const [logout] = useLogoutMutation();

  return useCallback(async () => {
    try {
      if (refreshToken) {
        await logout({ refreshToken }).unwrap();
      }
    } catch {
      // Ignore — local logout must succeed regardless of the server response.
    }
    dispatch(clearCredentials());
    dispatch(baseApi.util.resetApiState());
    navigate('/login', { replace: true });
  }, [dispatch, navigate, logout, refreshToken]);
}
