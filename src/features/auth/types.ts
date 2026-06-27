export interface AuthUser {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  /** Roles from `GET /Auth/me`; admin gating checks for the `admin` role (TRD §3.3). */
  roles: string[];
}
