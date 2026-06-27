const ACCESS_TOKEN_KEY = 'fastcart_access_token';
const REFRESH_TOKEN_KEY = 'fastcart_refresh_token';

/**
 * The API layer's source of truth for tokens (TRD §3.2). Tokens live in
 * `localStorage`; the Redux auth slice mirrors them for the UI and keeps this
 * in sync on every credential change.
 */
export const authStorage = {
  getAccessToken: (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens(accessToken: string, refreshToken: string | null): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken !== null) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },
  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
