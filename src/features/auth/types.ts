/** Normalized user used across the UI. Built from `GET /Auth/me` (TRD §3.3). */
export interface AuthUser {
  id?: string;
  email?: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  imageUrl?: string;
  /** Roles from `GET /Auth/me`; admin gating checks for the `admin` role (TRD §3.3). */
  roles: string[];
}

/**
 * Raw `GET /Auth/me` payload. The backend's exact field set is tolerated here
 * (roles may arrive as `roles[]` or a single `role`; image under a few names)
 * and normalized into `AuthUser` by `mapToAuthUser`.
 */
export interface AuthMeResponse {
  id?: string;
  email?: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  imageUrl?: string;
  image?: string;
  roles?: string[];
  role?: string;
}

/** `POST /Auth/login` — backend expects `{ login, password }` (TRD §3.1). */
export interface LoginRequest {
  login: string;
  password: string;
}

/** Wrapped API envelope returned by this backend for most endpoints. */
export interface ApiEnvelope<T> {
  success: boolean;
  message: string | null;
  data: T;
  errors: unknown;
}

export interface LoginData {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt?: string;
  tokenType?: string;
  user?: AuthMeResponse;
}

/** `POST /Auth/login` response: wrapped envelope containing tokens + user. */
export type LoginResponse = ApiEnvelope<LoginData>;

export interface ForgotPasswordRequest {
  email: string;
}

/** `POST /Auth/reset-password` — `email` + `token` come from the reset link (TRD §3.1). */
export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
