import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { FullScreenLoader } from '@/shared/ui/FullScreenLoader';
import { useGetMeQuery } from './authApi';
import { clearCredentials, selectIsAdmin, selectIsAuthenticated, setUser } from './authSlice';

/**
 * Gate for authenticated routes (TRD §3.2/§3.3). Also the auth-bootstrap point:
 * when a token exists it fetches `GET /Auth/me`, syncs the user into Redux, and
 * holds rendering behind a splash until resolved. A failed `me` (invalid token)
 * clears the session and bounces to /login.
 */
export function RequireAuth() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { data, isError, isLoading } = useGetMeQuery(undefined, { skip: !isAuthenticated });

  useEffect(() => {
    if (data) {
      dispatch(setUser(data));
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (isError) {
      dispatch(clearCredentials());
    }
  }, [isError, dispatch]);

  if (!isAuthenticated || isError) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (isLoading || !data) {
    return <FullScreenLoader />;
  }
  return <Outlet />;
}

/**
 * Admin-only gate (TRD §3.3). Renders nested under `RequireAuth`, so the user is
 * already resolved; non-admins are sent to the "Insufficient permissions" screen.
 */
export function RequireAdmin() {
  const isAdmin = useAppSelector(selectIsAdmin);
  if (!isAdmin) {
    return <Navigate to="/no-access" replace />;
  }
  return <Outlet />;
}

/** Keeps authenticated users out of the auth screens (login/forgot/reset). */
export function PublicOnly() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
