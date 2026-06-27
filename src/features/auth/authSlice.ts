import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { authStorage } from '@/shared/lib/authStorage';
import type { AuthUser } from './types';

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
}

// Hydrate tokens from localStorage on load (TRD §3.2). The user object is
// re-fetched via `GET /Auth/me` after the app mounts (Phase 1).
const initialState: AuthState = {
  accessToken: authStorage.getAccessToken(),
  refreshToken: authStorage.getRefreshToken(),
  user: null,
};

interface Credentials {
  accessToken: string;
  refreshToken?: string | null;
  user?: AuthUser | null;
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<Credentials>) {
      const { accessToken, refreshToken, user } = action.payload;
      state.accessToken = accessToken;
      if (refreshToken !== undefined) {
        state.refreshToken = refreshToken;
      }
      if (user !== undefined) {
        state.user = user;
      }
      // Keep localStorage (the API layer's source of truth) in sync.
      authStorage.setTokens(accessToken, state.refreshToken);
    },
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
    },
    clearCredentials(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      authStorage.clear();
    },
  },
});

export const { setCredentials, setUser, clearCredentials } = authSlice.actions;
export const authReducer = authSlice.reducer;

// Selectors use a minimal state shape to avoid a circular import with the store.
type AuthSlicePart = { auth: AuthState };

export const selectAuth = (state: AuthSlicePart) => state.auth;
export const selectIsAuthenticated = (state: AuthSlicePart) => Boolean(state.auth.accessToken);
export const selectCurrentUser = (state: AuthSlicePart) => state.auth.user;
export const selectIsAdmin = (state: AuthSlicePart) =>
  Boolean(state.auth.user?.roles?.some((role) => role.toLowerCase() === 'admin'));
