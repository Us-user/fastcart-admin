import axios from 'axios';

import { authStorage } from '@/shared/lib/authStorage';
import { setCredentials, clearCredentials } from '@/features/auth/authSlice';
import { storeRef } from './storeRef';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface RefreshData {
  accessToken: string;
  refreshToken?: string;
}
interface RefreshResponse {
  success: boolean;
  data: RefreshData;
}

let refreshPromise: Promise<string | null> | null = null;

/**
 * Single-flight 401 refresh shared by the RTK Query base query and the axios
 * instance (TRD §3.2 / §7). Concurrent callers await the same in-flight
 * request; on success the new tokens are persisted and the new access token is
 * returned, on failure tokens are cleared and `null` is returned.
 */
export function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function performRefresh(): Promise<string | null> {
  const refreshToken = authStorage.getRefreshToken();
  if (!refreshToken) {
    handleRefreshFailure();
    return null;
  }

  try {
    // Bare axios call (not the shared `http` instance) so this request bypasses
    // the 401 interceptor and cannot trigger a refresh loop.
    const { data: envelope } = await axios.post<RefreshResponse>(`${API_BASE}/api/v1/Auth/refresh`, {
      refreshToken,
    });
    const tokenData = envelope.data ?? (envelope as unknown as RefreshData);
    storeRef.store?.dispatch(
      setCredentials({
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken ?? refreshToken,
      }),
    );
    return tokenData.accessToken;
  } catch {
    handleRefreshFailure();
    return null;
  }
}

function handleRefreshFailure() {
  storeRef.store?.dispatch(clearCredentials());
}
