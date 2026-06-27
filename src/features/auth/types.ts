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

/** `POST /Auth/login` response: access + refresh tokens (user info is fetched via /Auth/me). */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

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
